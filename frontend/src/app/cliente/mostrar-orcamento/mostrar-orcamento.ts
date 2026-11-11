import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { SolicitacaoApiService } from '../../services/solicitacao-api.service';
import { Solicitacao } from '../../models/solicitacao';
import { DialogService } from '../../shared/dialog/dialog.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
@Component({
  selector: 'app-mostrar-orcamento',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './mostrar-orcamento.html',
  styleUrl: './mostrar-orcamento.css',
})
export class MostrarOrcamento implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(DialogService);

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
        if (solicitacao.estado !== 'ORCADA') {
          this.erro = 'Só é possível aprovar ou rejeitar solicitações no estado ORÇADA.';
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

  aprovarServico(): void {
    const clienteId = this.authService.getUsuario()?.id;

    if (!this.solicitacao || !clienteId || this.enviando) {
      return;
    }

    const valor = (this.solicitacao.valorOrcamento ?? 0).toFixed(2).replace('.', ',');
    this.enviando = true;

    this.solicitacaoApi.aprovarOrcamento(this.solicitacao.id, clienteId).subscribe({
      next: async () => {
        await this.dialog.avisar(`Serviço Aprovado no Valor R$ ${valor}`);
        this.router.navigate(['/dashboard']);
      },
      error: (erro) => {
        console.error('Erro ao aprovar serviço:', erro);
        this.enviando = false;
        this.dialog.erro(erro.error?.message ?? 'Não foi possível aprovar o serviço.');
      },
    });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}