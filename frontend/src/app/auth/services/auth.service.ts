import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';

export interface DadosRegistro {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

interface LoginResponse {
  id: number;
  nome: string;
  email: string;
  perfil: 'CLIENTE' | 'FUNCIONARIO';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly apiUrl = 'http://localhost:8080/api/auth';
  private readonly sessaoStorageKey = 'sessao';

  private _usuario: Usuario | null = null;

  constructor() {
    this.restaurarSessao();
  }

  get autenticado(): boolean {
    return this._usuario !== null;
  }

  fazerLogin(email: string, senha: string): Observable<Usuario> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, { email, senha })
      .pipe(
        map((resp) => {
          const usuario: Usuario = {
            id: resp.id,
            nome: resp.nome,
            email: resp.email,
            perfil: resp.perfil === 'FUNCIONARIO' ? 'funcionario' : 'cliente',
          };

          this._usuario = usuario;
          this.salvarSessao(usuario);
          return usuario;
        }),
      );
  }

  fazerRegistro(dados: DadosRegistro): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cadastro`, dados);
  }

  recuperarSenha(email: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/recuperar-senha`, { email });
  }

  getUsuario(): Usuario | null {
    return this._usuario;
  }

  verificarAutenticacao(): boolean {
    return this.autenticado;
  }

  logout(): void {
    this._usuario = null;
    this.limparSessao();
    this.router.navigate(['/']);
  }

  private salvarSessao(usuario: Usuario): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.sessaoStorageKey, JSON.stringify(usuario));
  }

  private limparSessao(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(this.sessaoStorageKey);
  }

  private restaurarSessao(): void {
    if (!this.isBrowser) {
      return;
    }

    const bruto = localStorage.getItem(this.sessaoStorageKey);
    if (!bruto) {
      return;
    }

    try {
      const usuario = JSON.parse(bruto) as Usuario;
      if (!usuario?.id || !usuario.email || !usuario.perfil) {
        throw new Error('Sessão inválida');
      }
      this._usuario = usuario;
    } catch {
      localStorage.removeItem(this.sessaoStorageKey);
    }
  }
}