import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { Categoria } from '../../models/categoria';
import { CategoriaService } from '../../services/categoria.service';
import { SolicitacaoApiService } from '../../services/solicitacao-api.service';
import { DialogService } from '../../shared/dialog/dialog.service';

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
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(DialogService);

  categorias: Categoria[] = [];
  erroCategorias = '';
  carregandoCategorias = false;
  enviando = false;

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
  this.carregarCategorias();
}

carregarCategorias(): void {
  this.carregandoCategorias = true;
  this.erroCategorias = '';

  this.categoriaService.listar().subscribe({
    next: (categorias) => {
      this.categorias = categorias;
      this.carregandoCategorias = false;
      this.cdr.markForCheck();
    },
    error: (erro) => {
      console.error('Erro ao carregar categorias:', erro);
      this.erroCategorias = 'Não foi possível carregar as categorias.';
      this.carregandoCategorias = false;
      this.cdr.markForCheck();
    },
  });
}

  onSubmit(): void {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = this.form.getRawValue();
    const categoria = this.categorias.find(
      (item) => item.id === Number(valor.categoriaId),
    );

    if (!categoria) {
      this.dialog.erro('Selecione uma categoria válida.');
      return;
    }

    const clienteId = this.authService.getUsuario()?.id;

    if (!clienteId) {
      this.dialog.erro('Não foi possível identificar o cliente logado. Faça login novamente.');
      return;
    }

    this.enviando = true;

    this.solicitacaoApi
      .abrir(
        clienteId,
        categoria.id,
        (valor.descricaoEquipamento ?? '').trim(),
        (valor.descricaoDefeito ?? '').trim(),
      )
      .subscribe({
        next: async () => {
          await this.dialog.avisar('Solicitação registrada com estado ABERTA.');
          this.router.navigate(['/dashboard']);
        },
        error: (erro) => {
          console.error('Erro ao registrar solicitação:', erro);
          this.enviando = false;
          this.dialog.erro(erro.error?.message ?? 'Não foi possível registrar a solicitação.');
        },
      });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}