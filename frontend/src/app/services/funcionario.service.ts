
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Funcionario } from '../models/funcionario';

export interface FuncionarioDTO {
  nome: string;
  email: string;
  dataNascimento: string;
  senha?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/funcionarios';

  listar(): Observable<Funcionario[]> {
    return this.http.get<Funcionario[]>(this.apiUrl);
  }

  obterPorId(id: number): Observable<Funcionario> {
    return this.http.get<Funcionario>(`${this.apiUrl}/${id}`);
  }

  inserir(dados: FuncionarioDTO): Observable<Funcionario> {
    return this.http.post<Funcionario>(this.apiUrl, dados);
  }

  atualizar(
    id: number,
    dados: FuncionarioDTO,
  ): Observable<Funcionario> {
    return this.http.put<Funcionario>(`${this.apiUrl}/${id}`, dados);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
