import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _autenticado: boolean = false; // Flag de autenticação

  get autenticado(): boolean { // Getter para verificar se o usuário está autenticado
    return this._autenticado;
  }

  constructor(
    private router: Router // Injeção do Router para navegação
  ) {}
  // Método para realizar o login do usuário
  fazerLogin(email: string, senha: string): boolean {
  if (email === 'teste@gmail.com' && senha === '1234') {
    this._autenticado = true;
    this.router.navigate(['/']);
    return true;
  }

  this._autenticado = false;
  return false;
}
  // TODO: Enviar e-mail e senha para o backend

  // TODO: Receber resposta do backend

  // TODO: Verificar se as credenciais são válidas

  // TODO: Obter informações do usuário

  // TODO: Obter perfil do usuário

  // TODO: Armazenar token de autenticação, caso seja utilizado

  // TODO: Armazenar informações necessárias do usuário autenticado

  // TODO: Criar método verificarAutenticacao()

  // TODO: Criar método obterUsuario()

  // TODO: Criar método logout()

  // TODO: Remover informações da sessão no logout

  // TODO: Tratar erros retornados pelo backend

}
