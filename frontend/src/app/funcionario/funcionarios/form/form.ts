
import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import {
  FuncionarioDTO,
  FuncionarioService,
} from '../../../services/funcionario.service';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly funcionarioService = inject(FuncionarioService);

  funcionarioId: number | null = null;
  erro = signal('');
  carregando = signal(false);
  salvando = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    nome: new FormControl('', [
      Validators.required,
      Validators.maxLength(80),
    ]),
    dataNascimento: new FormControl('', [Validators.required]),
    senha: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{4}$/),
    ]),
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.queryParamMap.get('id');

    if (idParam) {
      this.funcionarioId = Number(idParam);
      this.carregando.set(true);
      this.form.controls.senha.setValidators([Validators.pattern(/^\d{4}$/)]);
      this.form.controls.senha.updateValueAndValidity();

      this.funcionarioService.obterPorId(this.funcionarioId).subscribe({
        next: (funcionario) => {
          this.form.patchValue({
            email: funcionario.email,
            nome: funcionario.nome,
            dataNascimento: funcionario.dataNascimento,
          });
          this.carregando.set(false);
        },
        error: (erro) => {
          console.error('Erro ao carregar funcionário:', erro);
          this.erro.set('Não foi possível carregar o funcionário.');
          this.carregando.set(false);
        },
      });
    }
  }

  get modoEdicao(): boolean {
    return this.funcionarioId !== null;
  }

  onSubmit(): void {
    if (this.form.invalid || this.salvando()) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro.set('');
    this.salvando.set(true);

    const valor = this.form.getRawValue();

      const dados: FuncionarioDTO = {
      nome: valor.nome ?? '',
      email: valor.email ?? '',
      dataNascimento: valor.dataNascimento ?? '',
      senha: valor.senha ?? '',
    };

    if (valor.senha) {
      dados.senha = valor.senha;
    }

    const requisicao =
      this.modoEdicao && this.funcionarioId !== null
        ? this.funcionarioService.atualizar(this.funcionarioId, dados)
        : this.funcionarioService.inserir(dados);

    requisicao.subscribe({
      next: () => {
        this.router.navigate(['/funcionario/funcionarios/lista']);
      },
      error: (erro) => {
        console.error('Erro ao salvar funcionário:', erro);

        this.erro.set(
          erro.error?.message ??
            'Não foi possível salvar o funcionário. Verifique os dados informados.',
        );

        this.salvando.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/funcionario/funcionarios/lista']);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}