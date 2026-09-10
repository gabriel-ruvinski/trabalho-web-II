import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Solicitacao {
  id: number;
  titulo: string;
  solicitante: string;
  dataAbertura: string;
  estado:
    | 'ABERTA'
    | 'ORÇADA'
    | 'REJEITADA'
    | 'APROVADA'
    | 'REDIRECIONADA'
    | 'ARRUMADA'
    | 'PAGA'
    | 'FINALIZADA';

  // Indica se o funcionário logado é o destino do redirecionamento
  destinoRedirecionamento?: boolean;

  valor?: number;
}

@Component({
  selector: 'app-lista-solicitacoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-solicitacoes.html',
})
export class ListaSolicitacoes {

  filtro: 'HOJE' | 'PERIODO' | 'TODAS' = 'TODAS';

  dataInicio = '';
  dataFim = '';

  // Simulação do funcionário logado
  funcionarioLogadoId = 1;

  solicitacoes: Solicitacao[] = [
    {
      id: 101,
      titulo: 'Conserto do ar-condicionado',
      solicitante: 'João da Silva',
      dataAbertura: '2026-09-09T10:30:00',
      estado: 'ABERTA',
      valor: 0,
    },
    {
      id: 102,
      titulo: 'Manutenção do computador',
      solicitante: 'Maria Souza',
      dataAbertura: '2026-09-09T09:15:00',
      estado: 'ORÇADA',
      valor: 350,
    },
    {
      id: 103,
      titulo: 'Troca de lâmpadas',
      solicitante: 'Carlos Oliveira',
      dataAbertura: '2026-09-08T15:40:00',
      estado: 'APROVADA',
      valor: 120,
    },
    {
      id: 104,
      titulo: 'Reparo na impressora',
      solicitante: 'Ana Costa',
      dataAbertura: '2026-09-08T11:20:00',
      estado: 'REDIRECIONADA',
      destinoRedirecionamento: true,
      valor: 500,
    },
    {
      id: 105,
      titulo: 'Manutenção hidráulica',
      solicitante: 'Pedro Santos',
      dataAbertura: '2026-09-07T14:10:00',
      estado: 'PAGA',
      valor: 800,
    },
    {
      id: 106,
      titulo: 'Conserto de porta',
      solicitante: 'Lucas Alves',
      dataAbertura: '2026-09-06T08:30:00',
      estado: 'FINALIZADA',
      valor: 200,
    },
    {
      id: 107,
      titulo: 'Compra de material',
      solicitante: 'Fernanda Lima',
      dataAbertura: '2026-09-05T16:00:00',
      estado: 'REJEITADA',
    },
    {
      id: 108,
      titulo: 'Pintura da sala',
      solicitante: 'Roberto Lima',
      dataAbertura: '2026-09-04T13:00:00',
      estado: 'ARRUMADA',
      valor: 1000,
    },
  ];

  get solicitacoesFiltradas(): Solicitacao[] {
    let resultado = [...this.solicitacoes];

    // Só mostra REDIRECIONADA quando o funcionário logado
    // é o destino do redirecionamento
    resultado = resultado.filter(solicitacao => {
      if (solicitacao.estado === 'REDIRECIONADA') {
        return solicitacao.destinoRedirecionamento === true;
      }

      return true;
    });

    // Filtro de data
    if (this.filtro === 'HOJE') {
      const hoje = new Date();

      resultado = resultado.filter(solicitacao => {
        const data = new Date(solicitacao.dataAbertura);

        return (
          data.getFullYear() === hoje.getFullYear() &&
          data.getMonth() === hoje.getMonth() &&
          data.getDate() === hoje.getDate()
        );
      });
    }

    if (
      this.filtro === 'PERIODO' &&
      this.dataInicio &&
      this.dataFim
    ) {
      const inicio = new Date(`${this.dataInicio}T00:00:00`);
      const fim = new Date(`${this.dataFim}T23:59:59`);

      resultado = resultado.filter(solicitacao => {
        const data = new Date(solicitacao.dataAbertura);

        return data >= inicio && data <= fim;
      });
    }

    // Mais recente primeiro
    resultado.sort(
      (a, b) =>
        new Date(b.dataAbertura).getTime() -
        new Date(a.dataAbertura).getTime()
    );

    return resultado;
  }

  aplicarFiltro(): void {
    // O getter solicitacoesFiltradas já aplica os filtros.
    // Esse método existe para deixar o HTML mais claro.
  }

  limparFiltros(): void {
    this.filtro = 'TODAS';
    this.dataInicio = '';
    this.dataFim = '';
  }

getClasseEstado(estado: Solicitacao['estado']): string {
  const classes: Record<Solicitacao['estado'], string> = {
    ABERTA: 'bg-estado-aberta text-white',
    'ORÇADA': 'bg-estado-orcada text-white',
    REJEITADA: 'bg-estado-rejeitada text-white',
    APROVADA: 'bg-estado-aprovada text-white',
    REDIRECIONADA: 'bg-estado-redirecionada text-white',
    ARRUMADA: 'bg-estado-arrumada text-white',
    PAGA: 'bg-estado-paga text-white',
    FINALIZADA: 'bg-estado-finalizada text-white',
  };

  return classes[estado];
}

getBordaEstado(estado: Solicitacao['estado']): string {
  const classes: Record<Solicitacao['estado'], string> = {
    ABERTA: 'border-l-4 border-l-estado-aberta',
    'ORÇADA': 'border-l-4 border-l-estado-orcada',
    REJEITADA: 'border-l-4 border-l-estado-rejeitada',
    APROVADA: 'border-l-4 border-l-estado-aprovada',
    REDIRECIONADA: 'border-l-4 border-l-estado-redirecionada',
    ARRUMADA: 'border-l-4 border-l-estado-arrumada',
    PAGA: 'border-l-4 border-l-estado-paga',
    FINALIZADA: 'border-l-4 border-l-estado-finalizada',
  };

  return classes[estado];
}


getClasseBolinha(estado: Solicitacao['estado']): string {
  const classes: Record<Solicitacao['estado'], string> = {
    ABERTA: 'bg-estado-aberta',
    'ORÇADA': 'bg-estado-orcada',
    REJEITADA: 'bg-estado-rejeitada',
    APROVADA: 'bg-estado-aprovada',
    REDIRECIONADA: 'bg-estado-redirecionada',
    ARRUMADA: 'bg-estado-arrumada',
    PAGA: 'bg-estado-paga',
    FINALIZADA: 'bg-estado-finalizada',
  };

  return classes[estado];
}

  formatarData(data: string): string {
    return new Date(data).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  efetuarOrcamento(solicitacao: Solicitacao): void {
    console.log('Efetuar orçamento:', solicitacao);
  }

  efetuarManutencao(solicitacao: Solicitacao): void {
    console.log('Efetuar manutenção:', solicitacao);
  }

  finalizarSolicitacao(solicitacao: Solicitacao): void {
    console.log('Finalizar solicitação:', solicitacao);
  }
}