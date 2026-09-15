import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { SolicitacaoService } from '../../services/solicitacao.service';
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
  private readonly solicitacaoService = inject(SolicitacaoService);

  solicitacao: Solicitacao | undefined;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.solicitacao = this.solicitacaoService.obterPorId(id);
  }

  pagarServico(): void {
    if (!this.solicitacao) {
      return;
    }
    this.solicitacao = this.solicitacaoService.pagar(this.solicitacao.id);
    alert('Pagamento confirmado com sucesso');
    this.router.navigate(['/dashboard']);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}