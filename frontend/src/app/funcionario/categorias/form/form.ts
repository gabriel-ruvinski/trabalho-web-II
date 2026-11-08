import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../../services/categoria.service';
import { ApenasLetrasDirective } from '../../../shared/apenas-letras';
import { Categoria } from '../../../models/categoria';

@Component({
  selector: 'app-form',
  imports: [FormsModule, ApenasLetrasDirective],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form implements OnInit {
  categoria: Categoria = { id: 0, nome: '' };

  erro = signal('');
  salvando = signal(false);
  carregando = signal(false);

  constructor(
    private categoriaService: CategoriaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.queryParamMap.get('id'));

    if (id) {
      this.carregando.set(true);

      this.categoriaService.obterPorId(id).subscribe({
        next: (categoria) => {
          this.categoria = { ...categoria };
          this.carregando.set(false);
        },
        error: (erro) => {
          console.error('Erro ao carregar categoria:', erro);
          this.erro.set('Não foi possível carregar a categoria.');
          this.carregando.set(false);
        },
      });
    }
  }

  salvar(): void {
    const nome = this.categoria.nome.trim();

    if (nome === '' || !/^[a-zA-ZÀ-ÿ\s]+$/.test(nome)) {
      return;
    }

    this.salvando.set(true);
    this.erro.set('');

    const requisicao =
      this.categoria.id === 0
        ? this.categoriaService.adicionar(nome)
        : this.categoriaService.atualizar(this.categoria.id, nome);

    requisicao.subscribe({
      next: () => {
        this.router.navigate(['/funcionario/categorias/lista']);
      },
      error: (erro) => {
        console.error('Erro ao salvar categoria:', erro);
        this.erro.set(
          erro.error?.message ?? erro.error?.erro ?? 'Não foi possível salvar a categoria.'
        );
        this.salvando.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/funcionario/categorias/lista']);
  }
}