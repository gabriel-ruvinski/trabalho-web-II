import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { Solicitacao } from '../../models/solicitacao';

@Component({
  selector: 'app-mostrar-orcamento',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './mostrar-orcamento.html',
  styleUrl: './mostrar-orcamento.css',
})
export class MostrarOrcamento implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  solicitacao: Solicitacao | undefined;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.solicitacao = this.solicitacaoService.obterPorId(id);
  }

  aprovarServico(): void {
    if (!this.solicitacao) {
      return;
    }
    this.solicitacao = this.solicitacaoService.aprovar(this.solicitacao.id);
    const valor = (this.solicitacao.valorOrcamento ?? 0).toFixed(2).replace('.', ',');
    alert(`Serviço Aprovado no Valor R$ ${valor}`);
    this.router.navigate(['/dashboard']);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}