import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoService } from '../../services/solicitacao.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly solicitacaoService = inject(SolicitacaoService);

  solicitacoes: Solicitacao[] = [];

  constructor() {
    this.solicitacoes = this.solicitacaoService.listar();
  }

  rotuloEstado(solicitacao: Solicitacao): string {
    return ROTULO_ESTADO[solicitacao.estado];
  }

  descricaoResumida(texto: string): string {
    return texto.length > 30 ? `${texto.slice(0, 30)}…` : texto;
  }

  formatarDataHora(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(data);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
