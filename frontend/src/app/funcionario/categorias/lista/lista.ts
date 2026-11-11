import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria';
import { DialogService } from '../../../shared/dialog/dialog.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.html',
  styleUrl: './lista.css',
})
export class Lista implements OnInit {

  categorias = signal<Categoria[]>([]);
  carregando = signal(false);
  erro = signal('');
  aba = signal<'ATIVAS' | 'INATIVAS'>('ATIVAS');

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private dialog: DialogService
  ) { }

  ngOnInit(): void {
    this.carregarCategorias();
  }

  selecionarAba(aba: 'ATIVAS' | 'INATIVAS'): void {
    if (this.aba() === aba) {
      return;
    }

    this.aba.set(aba);
    this.carregarCategorias();
  }

  carregarCategorias(): void {
    this.carregando.set(true);
    this.erro.set('');

    const requisicao =
      this.aba() === 'ATIVAS'
        ? this.categoriaService.listar()
        : this.categoriaService.listarInativas();

    requisicao.subscribe({
      next: (categorias) => {
        this.categorias.set(categorias);
        this.carregando.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar categorias:', erro);
        this.erro.set('Não foi possível carregar as categorias.');
        this.carregando.set(false);
      }
    });
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

  async remover(id: number): Promise<void> {
    const categoria = this.categorias().find((c) => c.id === id);

    if (!categoria) {
      return;
    }

    const confirmou = await this.dialog.confirmar(
      `Tem certeza que deseja excluir a categoria "${categoria.nome}"?`,
      'Excluir categoria',
      'Excluir',
    );

    if (!confirmou) {
      return;
    }

    this.categoriaService.remover(id).subscribe({
      next: () => {
        this.carregarCategorias();
      },
      error: (erro) => {
        console.error('Erro ao remover categoria:', erro);
        this.erro.set('Não foi possível excluir a categoria.');
      },
    });
  }

  reativar(id: number): void {
    this.categoriaService.reativar(id).subscribe({
      next: () => {
        this.carregarCategorias();
      },
      error: (erro) => {
        console.error('Erro ao reativar categoria:', erro);
        this.erro.set(
          erro.error?.erro ?? erro.error?.message ?? 'Não foi possível reativar a categoria.',
        );
      },
    });
  }
}