import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CategoriaService } from './categoria.service';
import { HistoricoSolicitacao } from '../models/historico-solicitacao';
import { Solicitacao } from '../models/solicitacao';

interface NovaSolicitacao {
  descricaoEquipamento: string;
  categoriaId: number;
  descricaoDefeito: string;
}

interface SolicitacaoJson {
  id: number;
  descricaoEquipamento: string;
  categoriaId: number;
  categoriaNome: string;
  descricaoDefeito: string;
  dataHoraAbertura: string;
  estado: Solicitacao['estado'];
  historico: Array<{
    dataHora: string;
    estado: HistoricoSolicitacao['estado'];
    funcionarioNome: string | null;
    observacao: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class SolicitacaoService {
  private readonly storageKey = 'solicitacoes';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly categoriaService = inject(CategoriaService);

  listar(): Solicitacao[] {
    return this.carregar().sort(
      (a, b) => a.dataHoraAbertura.getTime() - b.dataHoraAbertura.getTime(),
    );
  }

  criar(dados: NovaSolicitacao): Solicitacao {
    const categoria = this.categoriaService.obterPorId(dados.categoriaId);
    if (!categoria || !categoria.ativa) {
      throw new Error('Categoria inválida.');
    }

    const agora = new Date();
    const solicitacoes = this.carregar();
    const proximoId = solicitacoes.reduce((maior, item) => Math.max(maior, item.id), 0) + 1;

    const nova: Solicitacao = {
      id: proximoId,
      descricaoEquipamento: dados.descricaoEquipamento.trim(),
      categoriaId: categoria.id,
      categoriaNome: categoria.nome,
      descricaoDefeito: dados.descricaoDefeito.trim(),
      dataHoraAbertura: agora,
      estado: 'ABERTA',
      historico: [
        {
          dataHora: agora,
          estado: 'ABERTA',
          funcionarioNome: null,
          observacao: 'Solicitação registrada pelo cliente',
        },
      ],
    };

    solicitacoes.push(nova);
    this.salvar(solicitacoes);
    return nova;
  }

  private carregar(): Solicitacao[] {
    if (!this.isBrowser) {
      return [];
    }

    const bruto = localStorage.getItem(this.storageKey);
    if (!bruto) {
      return [];
    }

    try {
      const lista = JSON.parse(bruto) as SolicitacaoJson[];
      return lista.map((item) => ({
        ...item,
        dataHoraAbertura: new Date(item.dataHoraAbertura),
        historico: item.historico.map((passo) => ({
          ...passo,
          dataHora: new Date(passo.dataHora),
        })),
      }));
    } catch {
      return [];
    }
  }

  private salvar(solicitacoes: Solicitacao[]): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(solicitacoes));
  }
}
