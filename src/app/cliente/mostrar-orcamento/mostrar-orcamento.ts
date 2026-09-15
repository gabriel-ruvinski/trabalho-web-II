import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Solicitacao } from '../../models/solicitacao';
import { CurrencyPipe } from '@angular/common';
import { SolicitacaoService } from '../../services/solicitacao.service';

@Component({
  selector: 'app-mostrar-orcamento',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './mostrar-orcamento.html',
  styleUrl: './mostrar-orcamento.css',
})
export class MostrarOrcamento {
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

  sair(): void {
    this.router.navigate(['/dashboard']);
  }

  aprovarServico(): void {
    if (this.solicitacao) {
      this.solicitacao.estado = 'APROVADA';
      alert('Serviço aprovado no valor de R$ ' + (this.solicitacao.valorOrcamento ?? 0).toFixed(2));
      this.router.navigate(['/dashboard']);
    }
  }
}
