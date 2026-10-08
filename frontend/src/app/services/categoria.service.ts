import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Categoria } from '../models/categoria';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly storageKey = 'categorias';
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly categorias: Categoria[] = this.carregar();

  listar(): Categoria[] {
    return this.categorias;
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
    });

    this.salvar();
  }

  atualizar(id: number, nome: string): void {
    const categoria = this.obterPorId(id);

    if (categoria) {
      categoria.nome = nome;
      this.salvar();
    }
  }

  remover(id: number): void {
    const indice = this.categorias.findIndex(
      (categoria) => categoria.id === id
    );

    if (indice !== -1) {
      this.categorias.splice(indice, 1);
      this.salvar();
    }
  }

  private dadosIniciais(): Categoria[] {
    return [
      { id: 1, nome: 'Notebook' },
      { id: 2, nome: 'Desktop' },
      { id: 3, nome: 'Impressora' },
      { id: 4, nome: 'Mouse' },
      { id: 5, nome: 'Teclado' },
    ];
  }

  private carregar(): Categoria[] {
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
      return JSON.parse(bruto) as Categoria[];
    } catch {
      return this.dadosIniciais();
    }
  }

  private salvar(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.categorias)
    );
  }
}