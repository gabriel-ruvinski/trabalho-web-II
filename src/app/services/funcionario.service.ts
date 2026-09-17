import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Funcionario } from '../models/funcionario';

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService {
  private readonly storageKey = 'funcionarios';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly funcionarios: Funcionario[] = this.carregar();

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
    this.salvar();
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
    this.salvar();
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
    this.salvar();
    return true;
  }

  private emailEmUso(email: string, ignorarId?: number): boolean {
    return this.funcionarios.some(
      (f) => f.ativo && f.id !== ignorarId && f.email.toLowerCase() === email.toLowerCase(),
    );
  }

  private dadosIniciais(): Funcionario[] {
    return [
      { id: 1, nome: 'Maria', email: 'maria@gmail.com', dataNascimento: '1990-05-12', senha: '1234', ativo: true },
      { id: 2, nome: 'Mário', email: 'mario@gmail.com', dataNascimento: '1988-11-03', senha: '5678', ativo: true },
    ];
  }

  private carregar(): Funcionario[] {
    if (!this.isBrowser) {
      return [];
    }

    const bruto = localStorage.getItem(this.storageKey);
    if (!bruto) {
      const iniciais = this.dadosIniciais();
      localStorage.setItem(this.storageKey, JSON.stringify(iniciais));
      return iniciais;
    }

    try {
      return JSON.parse(bruto) as Funcionario[];
    } catch {
      return this.dadosIniciais();
    }
  }

  private salvar(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(this.funcionarios));
  }
}