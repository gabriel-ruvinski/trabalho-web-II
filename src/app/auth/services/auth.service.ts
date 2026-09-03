import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Usuario } from '../../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _autenticado: boolean = false;
  private _usuario: Usuario | null = null;

  // Mock temporário de usuários — trocar quando integrar com backend
  private _usuariosMock: Usuario[] = [
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

  get autenticado(): boolean {
    return this._autenticado;
  }

  constructor(private router: Router) {}

  fazerLogin(email: string, senha: string): boolean {
    const encontrado = this._usuariosMock.find(
      u => u.email === email && u.senha === senha
    );

    if (encontrado) {
      this._autenticado = true;
      this._usuario = { ...encontrado, autenticado: true };
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
    this.router.navigate(['/login']);
  }
}