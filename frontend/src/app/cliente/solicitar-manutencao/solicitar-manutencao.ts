import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria.service';
import { SolicitacaoService } from '../../services/solicitacao.service';

@Component({
  selector: 'app-solicitar-manutencao',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './solicitar-manutencao.html',
  styleUrl: './solicitar-manutencao.css',
})
export class SolicitarManutencao implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly categoriaService = inject(CategoriaService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  categorias: Categoria[] = [];
  erroCategorias = '';

  form = new FormGroup({
    descricaoEquipamento: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(120),
    ]),
    categoriaId: new FormControl<number | null>(null, [Validators.required]),
    descricaoDefeito: new FormControl('', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(500),
    ]),
  });

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (erro) => {
        console.error('Erro ao carregar categorias:', erro);
        this.erroCategorias = 'Não foi possível carregar as categorias.';
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const categoria = this.categorias.find(
      (item) => item.id === Number(valor.categoriaId)
    );

    if (!categoria) {
      alert('Selecione uma categoria válida.');
      return;
    }

    const usuario = this.authService.getUsuario();

    this.solicitacaoService.criar({
      descricaoEquipamento: valor.descricaoEquipamento ?? '',
      categoriaId: categoria.id,
      categoriaNome: categoria.nome,
      descricaoDefeito: valor.descricaoDefeito ?? '',
      clienteNome: usuario?.nome,
      clienteCpf: usuario?.cpf,
      clienteEmail: usuario?.email,
      clienteTelefone: usuario?.telefone,
    });

    alert('Solicitação registrada com estado ABERTA.');
    this.router.navigate(['/dashboard']);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}