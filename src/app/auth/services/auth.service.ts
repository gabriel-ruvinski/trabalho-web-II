import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

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

  fazerLogin(email: string, senha: string): boolean {
    const encontrado = this._usuariosMock.find(
      (u) => u.email === email && u.senha === senha,
    );

    if (encontrado) {
      this._autenticado = true;
      this._usuario = { ...encontrado, autenticado: true };
      this.salvarSessao(email);
      return true;
    }

    this._autenticado = false;
    this._usuario = null;
    return false;
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

  fazerRegistro(dados: {
    nome: string;
    email: string;
    cpf: string;
    telefone: string;
    cep: string;
  }): void {
    const senhaGerada = this.gerarSenha();

    const novoUsuario: Usuario = {
      ...dados,
      senha: senhaGerada,
      autenticado: false,
      perfil: 'cliente',
    };

    this._usuariosMock.push(novoUsuario);
    this.salvarUsuarios();

    // Simulação de "envio por email" — sem backend real ainda
    console.log(`Senha enviada para ${dados.email}: ${senhaGerada}`);
    alert(`Cadastro realizado! Sua senha foi enviada para ${dados.email}. (Senha mock: ${senhaGerada})`);
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

  private salvarSessao(email: string): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.sessaoStorageKey, email);
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

    const email = localStorage.getItem(this.sessaoStorageKey);
    if (!email) {
      return;
    }

    const encontrado = this._usuariosMock.find((u) => u.email === email);
    if (encontrado) {
      this._autenticado = true;
      this._usuario = { ...encontrado, autenticado: true };
    }
  }
}