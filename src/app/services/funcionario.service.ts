import { Injectable } from '@angular/core';
import { Funcionario } from '../models/funcionario';

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService {
  private funcionarios: Funcionario[] = [
    { id: 1, nome: 'Maria', email: 'maria@gmail.com', dataNascimento: '1990-05-12', senha: '1234', ativo: true },
    { id: 2, nome: 'Mário', email: 'mario@gmail.com', dataNascimento: '1988-11-03', senha: '5678', ativo: true },
  ];

  listar(): Funcionario[] {
    return this.funcionarios;
  }

  listarAtivos(): Funcionario[] {
    return this.funcionarios.filter((funcionario) => funcionario.ativo);
  }

  obterPorId(id: number): Funcionario | undefined {
    return this.funcionarios.find((funcionario) => funcionario.id === id);
  }

  inserir(dados: { nome: string; email: string; dataNascimento: string; senha: string }): Funcionario | null {
    if (this.emailEmUso(dados.email)) {
      return null;
    }

    const proximoId = this.funcionarios.reduce((maior, f) => Math.max(maior, f.id), 0) + 1;
    const novo: Funcionario = { id: proximoId, ...dados, ativo: true };
    this.funcionarios.push(novo);
    return novo;
  }

  atualizar(
    id: number,
    dados: { nome: string; email: string; dataNascimento: string; senha: string },
  ): Funcionario | null {
    const funcionario = this.obterPorId(id);
    if (!funcionario) {
      return null;
    }
    if (this.emailEmUso(dados.email, id)) {
      return null;
    }

    Object.assign(funcionario, dados);
    return funcionario;
  }

  remover(id: number, emailFuncionarioLogado: string): boolean {
    const funcionario = this.obterPorId(id);
    if (!funcionario) {
      return false;
    }
    if (funcionario.email === emailFuncionarioLogado) {
      return false;
    }

    const ativos = this.funcionarios.filter((f) => f.ativo);
    if (ativos.length <= 1) {
      return false;
    }

    funcionario.ativo = false;
    return true;
  }

  private emailEmUso(email: string, ignorarId?: number): boolean {
    return this.funcionarios.some(
      (f) => f.ativo && f.id !== ignorarId && f.email.toLowerCase() === email.toLowerCase(),
    );
  }
}