import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EstadoSolicitacao, ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { formatarMoeda } from '../../shared/utils/formatacao';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-lista-solicitacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-solicitacoes.html',
})
export class ListaSolicitacoes {
  private readonly router = inject(Router);
  private readonly solicitacaoService = inject(SolicitacaoService);
  private readonly authService = inject(AuthService);

  filtro: 'HOJE' | 'PERIODO' | 'TODAS' = 'TODAS';
  dataInicio = '';
  dataFim = '';
  funcionarioLogadoId = 1;

  get solicitacoes(): Solicitacao[] {
    return this.solicitacaoService.listar();
  }

  get solicitacoesFiltradas(): Solicitacao[] {
    let resultado = [...this.solicitacoes];

    resultado = resultado.filter((solicitacao) => {
      if (solicitacao.estado === 'REDIRECIONADA') {
        return solicitacao.funcionarioDestinoId === this.funcionarioLogadoId;
      }
      return true;
    });

    if (this.filtro === 'HOJE') {
      const hoje = new Date();
      resultado = resultado.filter((solicitacao) => {
        const data = solicitacao.dataHoraAbertura;
        return (
          data.getFullYear() === hoje.getFullYear() &&
          data.getMonth() === hoje.getMonth() &&
          data.getDate() === hoje.getDate()
        );
      });
    }

    if (this.filtro === 'PERIODO' && this.dataInicio && this.dataFim) {
      const inicio = new Date(`${this.dataInicio}T00:00:00`);
      const fim = new Date(`${this.dataFim}T23:59:59`);
      resultado = resultado.filter((solicitacao) => {
        const data = solicitacao.dataHoraAbertura;
        return data >= inicio && data <= fim;
      });
    }

    resultado.sort(
      (a, b) => a.dataHoraAbertura.getTime() - b.dataHoraAbertura.getTime(),
    );

    return resultado;
  }

  aplicarFiltro(): void {}

  limparFiltros(): void {
    this.filtro = 'TODAS';
    this.dataInicio = '';
    this.dataFim = '';
  }

  rotuloEstado(estado: EstadoSolicitacao): string {
    return ROTULO_ESTADO[estado];
  }

  getClasseEstado(estado: EstadoSolicitacao): string {
    const classes: Record<EstadoSolicitacao, string> = {
      ABERTA: 'bg-estado-aberta text-white',
      ORCADA: 'bg-estado-orcada text-white',
      REJEITADA: 'bg-estado-rejeitada text-white',
      APROVADA: 'bg-estado-aprovada text-white',
      REDIRECIONADA: 'bg-estado-redirecionada text-white',
      ARRUMADA: 'bg-estado-arrumada text-white',
      PAGA: 'bg-estado-paga text-white',
      FINALIZADA: 'bg-estado-finalizada text-white',
    };
    return classes[estado];
  }

  getBordaEstado(estado: EstadoSolicitacao): string {
    const classes: Record<EstadoSolicitacao, string> = {
      ABERTA: 'border-l-4 border-l-estado-aberta',
      ORCADA: 'border-l-4 border-l-estado-orcada',
      REJEITADA: 'border-l-4 border-l-estado-rejeitada',
      APROVADA: 'border-l-4 border-l-estado-aprovada',
      REDIRECIONADA: 'border-l-4 border-l-estado-redirecionada',
      ARRUMADA: 'border-l-4 border-l-estado-arrumada',
      PAGA: 'border-l-4 border-l-estado-paga',
      FINALIZADA: 'border-l-4 border-l-estado-finalizada',
    };
    return classes[estado];
  }

  getClasseBolinha(estado: EstadoSolicitacao): string {
    const classes: Record<EstadoSolicitacao, string> = {
      ABERTA: 'bg-estado-aberta',
      ORCADA: 'bg-estado-orcada',
      REJEITADA: 'bg-estado-rejeitada',
      APROVADA: 'bg-estado-aprovada',
      REDIRECIONADA: 'bg-estado-redirecionada',
      ARRUMADA: 'bg-estado-arrumada',
      PAGA: 'bg-estado-paga',
      FINALIZADA: 'bg-estado-finalizada',
    };
    return classes[estado];
  }

  formatarMoeda = formatarMoeda;

  formatarData(data: Date): string {
    return data.toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  efetuarOrcamento(solicitacao: Solicitacao): void {
    this.router.navigate(['/funcionario/efetuar-orcamento', solicitacao.id]);
  }

  efetuarManutencao(solicitacao: Solicitacao): void {
    this.router.navigate(['/funcionario/efetuar-manutencao', solicitacao.id]);
  }

  finalizarSolicitacao(solicitacao: Solicitacao): void {
    this.router.navigate(['/funcionario/finalizar-solicitacao', solicitacao.id]);
  }
    sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
