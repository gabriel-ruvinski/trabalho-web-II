import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuncionarioService } from '../../../services/funcionario.service';

@Component({
  selector: 'app-form',
  imports: [ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly funcionarioService = inject(FuncionarioService);

  funcionarioId: number | null = null;
  erro = '';

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    nome: new FormControl('', [Validators.required, Validators.maxLength(80)]),
    dataNascimento: new FormControl('', [Validators.required]),
    senha: new FormControl('', [Validators.required, Validators.minLength(4)]),
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.funcionarioId = Number(idParam);
      const funcionario = this.funcionarioService.obterPorId(this.funcionarioId);
      if (funcionario) {
        this.form.patchValue({
          email: funcionario.email,
          nome: funcionario.nome,
          dataNascimento: funcionario.dataNascimento,
          senha: funcionario.senha,
        });
      }
    }
  }

  get modoEdicao(): boolean {
    return this.funcionarioId !== null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.erro = '';
    const valor = this.form.getRawValue();
    const dados = {
      nome: valor.nome ?? '',
      email: valor.email ?? '',
      dataNascimento: valor.dataNascimento ?? '',
      senha: valor.senha ?? '',
    };

    const resultado =
      this.modoEdicao && this.funcionarioId !== null
        ? this.funcionarioService.atualizar(this.funcionarioId, dados)
        : this.funcionarioService.inserir(dados);

    if (!resultado) {
      this.erro = 'Já existe um funcionário cadastrado com este e-mail.';
      return;
    }

    this.router.navigate(['/funcionario/funcionarios']);
  }

  cancelar(): void {
    this.router.navigate(['/funcionario/funcionarios']);
  }
}