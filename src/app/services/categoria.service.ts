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

  listarAtivas(): Categoria[] {
    return this.categorias.filter((categoria) => categoria.ativa);
  }

  obterPorId(id: number): Categoria | undefined {
    return this.categorias.find((categoria) => categoria.id === id);
  }
}
