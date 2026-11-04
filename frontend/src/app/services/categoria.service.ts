import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/categorias';

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  obterPorId(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  adicionar(nome: string): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, { nome });
  }

  atualizar(id: number, nome: string): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, { nome });
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}