import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria';

@Component({
  selector: 'app-form',
  imports: [FormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form implements OnInit {

  categoria: Categoria = {
    id: 0,
    nome: ''
  };

  constructor(
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));

    if (id) {
      const categoria = this.categoriaService.obterPorId(id);

      if (categoria) {
        this.categoria = {
          ...categoria
        };
      }
    }
  }

  salvar(): void {
    if (this.categoria.nome.trim() === '') {
      return;
    }

    if (this.categoria.id === 0) {
      this.categoriaService.adicionar(this.categoria.nome);
    } else {
      this.categoriaService.atualizar(
        this.categoria.id,
        this.categoria.nome
      );
    }

    this.router.navigate(['/funcionario/categorias/lista']);
  }

  cancelar(): void {
    this.router.navigate(['/funcionario/categorias/lista']);
  }
}