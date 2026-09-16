import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { Solicitacao } from '../../models/solicitacao';

@Component({
  selector: 'app-resgatar-servico',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './resgatar-servico.html',
  styleUrl: './resgatar-servico.css',
})
export class ResgatarServico implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  solicitacao: Solicitacao | undefined;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.solicitacao = this.solicitacaoService.obterPorId(id);
  }

  get motivoRejeicao(): string {
    const passo = this.solicitacao?.historico
      .filter((item) => item.estado === 'REJEITADA')
      .pop();
    return passo?.observacao ?? 'Motivo não informado';
  }

  resgatarServico(): void {
    if (!this.solicitacao) {
      return;
    }
    this.solicitacao = this.solicitacaoService.resgatar(this.solicitacao.id);
    alert('Serviço resgatado, voltando ao fluxo de aprovação');
    this.router.navigate(['/dashboard']);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}