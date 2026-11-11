import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { Solicitacao } from '../../models/solicitacao';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { AcaoBotao, SolicitacaoApiService } from '../../services/solicitacao-api.service';

@Component({
  selector: 'app-visualizar-solicitacao',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './visualizar-solicitacao.html',
  styleUrl: './visualizar-solicitacao.css',
})
export class VisualizarSolicitacao implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  solicitacao: Solicitacao | null = null;
  erro = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const clienteId = this.authService.getUsuario()?.id;

    if (!clienteId) {
      this.erro = 'Não foi possível identificar o cliente logado. Faça login novamente.';
      return;
    }

    this.solicitacaoApi.obterPorId(id, clienteId).subscribe({
      next: (solicitacao) => {
        this.solicitacao = solicitacao;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        console.error('Erro ao carregar solicitação:', erro);
        this.erro = erro.error?.message ?? 'Solicitação não encontrada.';
        this.cdr.markForCheck();
      },
    });
  }

  rotuloEstado(estado: string): string {
    return ROTULO_ESTADO[estado as keyof typeof ROTULO_ESTADO];
  }

  getAcaoBotao(): AcaoBotao | null {
    return this.solicitacao ? this.solicitacaoApi.getAcaoBotao(this.solicitacao) : null;
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}