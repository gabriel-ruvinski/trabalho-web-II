import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ReceitaPorCategoria, ReceitaPorDia } from '../models/receita';

interface ReceitaDiariaApi {
  data: string;
  receitaTotal: number;
  quantidadeSolicitacoes: number;
}

interface ReceitaCategoriaApi {
  categoriaId: number;
  categoria: string;
  receitaTotal: number;
  quantidadeSolicitacoes: number;
}

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/relatorios';

  receitaPorDia(dataInicio?: string, dataFim?: string): Observable<ReceitaPorDia[]> {
    return this.http
      .get<ReceitaDiariaApi[]>(`${this.apiUrl}/receita-por-dia`, {
        params: this.periodo(dataInicio, dataFim),
      })
      .pipe(
        map((linhas) =>
          linhas.map((linha) => ({
            dataIso: linha.data,
            data: new Date(`${linha.data}T00:00:00`),
            valor: Number(linha.receitaTotal),
          })),
        ),
      );
  }

  receitaPorCategoria(
    dataInicio?: string,
    dataFim?: string,
  ): Observable<ReceitaPorCategoria[]> {
    return this.http
      .get<ReceitaCategoriaApi[]>(`${this.apiUrl}/receita-por-categoria`, {
        params: this.periodo(dataInicio, dataFim),
      })
      .pipe(
        map((linhas) =>
          linhas.map((linha) => ({
            categoriaId: linha.categoriaId,
            categoriaNome: linha.categoria,
            valor: Number(linha.receitaTotal),
          })),
        ),
      );
  }

  total(linhas: Array<{ valor: number }>): number {
    return linhas.reduce((soma, linha) => soma + linha.valor, 0);
  }

  private periodo(dataInicio?: string, dataFim?: string): HttpParams {
    let params = new HttpParams();

    if (dataInicio) {
      params = params.set('dataInicial', dataInicio);
    }

    if (dataFim) {
      params = params.set('dataFinal', dataFim);
    }

    return params;
  }
}