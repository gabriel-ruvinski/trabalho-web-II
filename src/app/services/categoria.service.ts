import { Injectable } from '@angular/core';

import { Categoria } from '../models/categoria';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {

  private readonly categorias: Categoria[] = [
    { id: 1, nome: 'Notebook', ativa: true },
    { id: 2, nome: 'Desktop', ativa: true },
    { id: 3, nome: 'Impressora', ativa: true },
    { id: 4, nome: 'Mouse', ativa: true },
    { id: 5, nome: 'Teclado', ativa: true },
  ];

  listar(): Categoria[] {
    return this.categorias;
  }

  listarAtivas(): Categoria[] {
    return this.categorias.filter((categoria) => categoria.ativa);
  }

  obterPorId(id: number): Categoria | undefined {
    return this.categorias.find((categoria) => categoria.id === id);
  }

  adicionar(nome: string): void {
    const novoId =
      this.categorias.length > 0
        ? Math.max(...this.categorias.map((categoria) => categoria.id)) + 1
        : 1;

    this.categorias.push({
      id: novoId,
      nome: nome,
      ativa: true,
    });
  }

  atualizar(id: number, nome: string): void {
    const categoria = this.obterPorId(id);

    if (categoria) {
      categoria.nome = nome;
    }
  }

  remover(id: number): void {
    const categoria = this.obterPorId(id);

    if (categoria) {
      categoria.ativa = false;
    }
  }

  reativar(id: number): void {
    const categoria = this.obterPorId(id);

    if (categoria) {
      categoria.ativa = true;
    }
  }
}