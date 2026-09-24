import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { EnderecoViaCEP } from '../models/endereco-viacep';

@Injectable({
    providedIn: 'root',
})
export class ViaCEPService {
    private readonly http = inject(HttpClient);

  buscar(cep: string): Observable<EnderecoViaCEP | null> {
    const cepLimpo = cep.replace(/\D/g, '');

    return this.http
      .get<EnderecoViaCEP>(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      .pipe(map((resposta) => (resposta.erro ? null : resposta)));
  }
}