
import { Component, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { FuncionarioService } from '../../../services/funcionario.service';

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
  erro = '';
  carregando = false;
  salvando = false;

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    nome: new FormControl('', [
      Validators.required,
      Validators.maxLength(80),
    ]),
    dataNascimento: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.queryParamMap.get('id');

    if (idParam) {
      this.funcionarioId = Number(idParam);
      this.carregando = true;

      this.funcionarioService.obterPorId(this.funcionarioId).subscribe({
        next: (funcionario) => {
          this.form.patchValue({
            email: funcionario.email,
            nome: funcionario.nome,
            dataNascimento: funcionario.dataNascimento,
          });
          this.carregando = false;
        },
        error: (erro) => {
          console.error('Erro ao carregar funcionário:', erro);
          this.erro = 'Não foi possível carregar o funcionário.';
          this.carregando = false;
        },
      });
    }
  }

  get modoEdicao(): boolean {
    return this.funcionarioId !== null;
  }

  onSubmit(): void {
    if (this.form.invalid || this.salvando) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro = '';
    this.salvando = true;

    const valor = this.form.getRawValue();

    const dados = {
      nome: valor.nome ?? '',
      email: valor.email ?? '',
      dataNascimento: valor.dataNascimento ?? '',
    };

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

        this.erro =
          erro.error?.detail ??
          erro.error?.message ??
          'Não foi possível salvar o funcionário. Verifique os dados informados.';

        this.salvando = false;
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
