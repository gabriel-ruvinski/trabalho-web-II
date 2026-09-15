import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoService } from '../../services/solicitacao.service';

interface AcaoBotao {
  label: string;
  rota: string;
}

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

  
  getAcaoBotao(solicitacao: Solicitacao): AcaoBotao | null {
    switch (solicitacao.estado) {
      case 'ORCADA':
        return { label: 'Aprovar/Rejeitar Serviço', rota: `/orcamento/${solicitacao.id}` };
      case 'APROVADA':
        return null; // sem botão de ação
      case 'REJEITADA':
        return { label: 'Resgatar Serviço', rota: `/resgatar-servico/${solicitacao.id}` };
      case 'ARRUMADA':
        return { label: 'Pagar Serviço', rota: `/pagar-servico/${solicitacao.id}` };
      default:
        return null; 
    }
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}