import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.html',
  styleUrl: './lista.css',
})
export class Lista implements OnInit {

  categorias: Categoria[] = [];

  constructor(
    private categoriaService: CategoriaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.categorias = this.categoriaService.listar();
  }

  novaCategoria(): void {
    this.router.navigate(['/funcionario/categorias/form']);
  }

  editar(id: number): void {
    this.router.navigate(
      ['/funcionario/categorias/form'],
      {
        queryParams: { id: id }
      }
    );
  }

  remover(id: number): void {
    const categoria = this.categoriaService.obterPorId(id);

    if (!categoria) {
      return;
    }

    const confirmar = confirm(
      `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`
    );

    if (confirmar) {
      this.categoriaService.remover(id);
      this.carregarCategorias();
    }
  }
}