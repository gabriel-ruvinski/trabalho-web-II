import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { formatarDataHora, formatarMoeda } from '../../shared/utils/formatacao';

@Component({
  selector: 'app-finalizar-solicitacao',
  imports: [RouterLink],
  templateUrl: './finalizar-solicitacao.html',
  styleUrl: './finalizar-solicitacao.css',
})
export class FinalizarSolicitacao {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  solicitacao: Solicitacao | undefined;
  erro = '';

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.solicitacao = this.solicitacaoService.obterPorId(id);
    if (!this.solicitacao) {
      this.erro = 'Solicitação não encontrada.';
    } else if (this.solicitacao.estado !== 'PAGA') {
      this.erro = 'Só é possível finalizar solicitações no estado PAGA.';
    }
  }

  rotuloEstado(solicitacao: Solicitacao): string {
    return ROTULO_ESTADO[solicitacao.estado];
  }

  formatarDataHora = formatarDataHora;
  formatarMoeda = formatarMoeda;

  confirmar(): void {
    if (!this.solicitacao || this.erro) {
      return;
    }

    const funcionario = this.authService.getUsuario()?.nome ?? 'Funcionário';
    this.solicitacaoService.finalizar(this.solicitacao.id, funcionario);
    alert('Solicitação finalizada.');
    this.router.navigate(['/lista-solicitacoes']);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
