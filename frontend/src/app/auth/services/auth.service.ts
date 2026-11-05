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

  private readonly usuariosStorageKey = 'usuarios';
  private readonly sessaoStorageKey = 'sessao';

  private _autenticado = false;
  private _usuario: Usuario | null = null;

  // Mock temporário de usuários — trocar quando integrar com backend
  private readonly _usuariosMock: Usuario[] = this.carregarUsuarios();

  constructor() {
    this.restaurarSessao();
  }

  get autenticado(): boolean {
    return this._autenticado;
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
            senha: '',
            cpf: '',
            telefone: '',
            cep: '',
            autenticado: true,
            perfil: resp.perfil === 'FUNCIONARIO' ? 'funcionario' : 'cliente',
          };

          this._autenticado = true;
          this._usuario = usuario;
          this.salvarSessao(usuario);
          return usuario;
        }),
      );
  }

  getUsuario(): Usuario | null {
    return this._usuario;
  }

  verificarAutenticacao(): boolean {
    return this._autenticado;
  }

  logout(): void {
    this._autenticado = false;
    this._usuario = null;
    this.limparSessao();
    this.router.navigate(['/']);
  }

  private gerarSenha(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4 dígitos
  }

  fazerRegistro(dados: DadosRegistro): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/cadastro`, dados);
  }
  
  recuperarSenha(email: string): boolean {
  const usuario = this._usuariosMock.find(u => u.email === email);
  if (!usuario) {
    alert('E-mail não encontrado. Por favor, verifique e tente novamente.');
    return false;
  }

  const novaSenha = this.gerarSenha();
  usuario.senha = novaSenha;
  console.log(`Nova senha enviada para ${email}: ${novaSenha}`);
  alert(`Uma nova senha foi enviada para ${email}. (Senha mock: ${novaSenha})`);
  this.salvarUsuarios();
  return true;
}
  registrarFuncionario(dados: { nome: string; email: string; senha: string }): void {
    const existente = this._usuariosMock.find((u) => u.email === dados.email);

    if (existente) {
      existente.nome = dados.nome;
      existente.senha = dados.senha;
    } else {
      this._usuariosMock.push({
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        cpf: '',
        telefone: '',
        cep: '',
        autenticado: false,
        perfil: 'funcionario',
      });
    }

    this.salvarUsuarios();
  }

  private dadosIniciais(): Usuario[] {
    return [
      {
        nome: 'Cliente Teste',
        email: 'cliente@gmail.com',
        senha: '1234',
        cpf: '',
        telefone: '',
        cep: '',
        autenticado: false,
        perfil: 'cliente',
      },
      {
        nome: 'Funcionário Teste',
        email: 'funcionario@gmail.com',
        senha: '5678',
        cpf: '',
        telefone: '',
        cep: '',
        autenticado: false,
        perfil: 'funcionario',
      },
    ];
  }

  private carregarUsuarios(): Usuario[] {
    if (!this.isBrowser) {
      return this.dadosIniciais();
    }

    const bruto = localStorage.getItem(this.usuariosStorageKey);
    if (!bruto) {
      const iniciais = this.dadosIniciais();
      localStorage.setItem(this.usuariosStorageKey, JSON.stringify(iniciais));
      return iniciais;
    }

    try {
      return JSON.parse(bruto) as Usuario[];
    } catch {
      return this.dadosIniciais();
    }
  }

  private salvarUsuarios(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.usuariosStorageKey, JSON.stringify(this._usuariosMock));
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
      if (!usuario?.email || !usuario.perfil) {
        throw new Error('Sessão inválida');
      }
      this._autenticado = true;
      this._usuario = { ...usuario, autenticado: true };
    } catch {
      // sessão antiga (só o e-mail) ou corrompida
      localStorage.removeItem(this.sessaoStorageKey);
    }
  }
}