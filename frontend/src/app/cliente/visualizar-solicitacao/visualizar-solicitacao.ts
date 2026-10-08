import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { Solicitacao } from '../../models/solicitacao';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { SolicitacaoService, AcaoBotao } from '../../services/solicitacao.service';

@Component({
  selector: 'app-visualizar-solicitacao',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './visualizar-solicitacao.html',
  styleUrl: './visualizar-solicitacao.css',
})
export class VisualizarSolicitacao {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly solicitacaoService = inject(SolicitacaoService);

  solicitacao: Solicitacao | null = null;

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.solicitacao = this.solicitacaoService.obterPorId(Number(idParam)) ?? null;
    }
  }

  rotuloEstado(estado: string): string {
    return ROTULO_ESTADO[estado as keyof typeof ROTULO_ESTADO];
  }

  getAcaoBotao(): AcaoBotao | null {
    return this.solicitacao ? this.solicitacaoService.getAcaoBotao(this.solicitacao) : null;
  }

  voltar(): void {
    this.router.navigate(['/dashboard']);
  }
}
