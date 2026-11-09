import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { SolicitacaoApiService } from '../../services/solicitacao-api.service';
import { Solicitacao } from '../../models/solicitacao';

@Component({
  selector: 'app-pagar-servico',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './pagar-servico.html',
  styleUrl: './pagar-servico.css',
})
export class PagarServico implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  solicitacao: Solicitacao | undefined;
  erro = '';
  enviando = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const clienteId = this.authService.getUsuario()?.id;

    if (!clienteId) {
      this.erro = 'Não foi possível identificar o cliente logado. Faça login novamente.';
      return;
    }

    this.solicitacaoApi.obterPorId(id, clienteId).subscribe({
      next: (solicitacao) => {
        if (solicitacao.estado !== 'ARRUMADA') {
          this.erro = 'Só é possível pagar solicitações no estado ARRUMADA.';
        } else {
          this.solicitacao = solicitacao;
        }
        this.cdr.markForCheck();
      },
      error: (erro) => {
        console.error('Erro ao carregar solicitação:', erro);
        this.erro = erro.error?.message ?? 'Solicitação não encontrada.';
        this.cdr.markForCheck();
      },
    });
  }

  pagarServico(): void {
    const clienteId = this.authService.getUsuario()?.id;

    if (!this.solicitacao || !clienteId || this.enviando) {
      return;
    }

    this.enviando = true;

    this.solicitacaoApi.pagar(this.solicitacao.id, clienteId).subscribe({
      next: () => {
        alert('Pagamento confirmado com sucesso');
        this.router.navigate(['/dashboard']);
      },
      error: (erro) => {
        console.error('Erro ao registrar pagamento:', erro);
        alert(erro.error?.message ?? 'Não foi possível registrar o pagamento.');
        this.enviando = false;
      },
    });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}