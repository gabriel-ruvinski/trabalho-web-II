import { Injectable, inject } from '@angular/core';
import { CategoriaService } from './categoria.service';
import { SolicitacaoService } from './solicitacao.service';
import { Solicitacao } from '../models/solicitacao';
import { ReceitaPorCategoria, ReceitaPorDia } from '../models/receita';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  private readonly solicitacaoService = inject(SolicitacaoService);
  private readonly categoriaService = inject(CategoriaService);

  listarPagas(): Solicitacao[] {
    return this.solicitacaoService
      .listar()
      .filter(
        (item) =>
          (item.estado === 'PAGA' || item.estado === 'FINALIZADA') &&
          (item.valorOrcamento ?? 0) > 0 &&
          this.dataPagamento(item) !== null,
      );
  }

  dataPagamento(solicitacao: Solicitacao): Date | null {
    const passo = [...solicitacao.historico]
      .reverse()
      .find((item) => item.estado === 'PAGA');
    return passo ? passo.dataHora : null;
  }

  receitaPorDia(dataInicio?: string, dataFim?: string): ReceitaPorDia[] {
    const inicio = dataInicio ? new Date(`${dataInicio}T00:00:00`) : null;
    const fim = dataFim ? new Date(`${dataFim}T23:59:59`) : null;
    const porDia = new Map<string, number>();

    for (const solicitacao of this.listarPagas()) {
      const pagamento = this.dataPagamento(solicitacao);
      if (!pagamento) {
        continue;
      }
      if (inicio && pagamento < inicio) {
        continue;
      }
      if (fim && pagamento > fim) {
        continue;
      }

      const chave = this.isoDia(pagamento);
      porDia.set(chave, (porDia.get(chave) ?? 0) + (solicitacao.valorOrcamento ?? 0));
    }

    return [...porDia.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dataIso, valor]) => ({
        dataIso,
        data: new Date(`${dataIso}T00:00:00`),
        valor,
      }));
  }

  receitaPorCategoria(): ReceitaPorCategoria[] {
    const totais = new Map<number, number>();
    for (const solicitacao of this.listarPagas()) {
      totais.set(
        solicitacao.categoriaId,
        (totais.get(solicitacao.categoriaId) ?? 0) + (solicitacao.valorOrcamento ?? 0),
      );
    }

    const categorias = this.categoriaService.listar();
    const nomes = new Map(categorias.map((categoria) => [categoria.id, categoria.nome]));

    const ids = new Set<number>([...totais.keys(), ...categorias.map((c) => c.id)]);
    return [...ids]
      .map((id) => ({
        categoriaId: id,
        categoriaNome: nomes.get(id) ?? `Categoria ${id}`,
        valor: totais.get(id) ?? 0,
      }))
      .sort((a, b) => a.categoriaNome.localeCompare(b.categoriaNome, 'pt-BR'));
  }

  total(linhas: Array<{ valor: number }>): number {
    return linhas.reduce((soma, linha) => soma + linha.valor, 0);
  }

  private isoDia(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
