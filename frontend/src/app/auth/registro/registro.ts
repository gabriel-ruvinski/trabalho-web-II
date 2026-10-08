import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { AuthService } from '../services/auth.service';
import { ViaCEPService } from '../../services/viacep.service';

/** Valida CPF pelos dígitos verificadores. Espera o valor apenas com números. */
function cpfValido(control: AbstractControl): ValidationErrors | null {
  const cpf = String(control.value ?? '');

  if (!cpf) {
    return null;
  }

  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) {
    return { cpfInvalido: true };
  }

  const calcularDigito = (base: string, pesoInicial: number): number => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const digito1 = calcularDigito(cpf.substring(0, 9), 10);
  const digito2 = calcularDigito(cpf.substring(0, 10), 11);

  const valido = digito1 === Number(cpf[9]) && digito2 === Number(cpf[10]);
  return valido ? null : { cpfInvalido: true };
}

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink, NgxMaskDirective],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly viaCEPService = inject(ViaCEPService);

  buscandoCEP = false;
  erroCEP = '';
  erroCadastro = '';

  form = new FormGroup({
    nome: new FormControl('', [Validators.required]),
    sobrenome: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    cpf: new FormControl('', [Validators.required, cpfValido]),
    telefone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{10,11}$/),
    ]),
    cep: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{8}$/),
    ]),
    logradouro: new FormControl('', [Validators.required]),
    numero: new FormControl('', [Validators.required]),
    complemento: new FormControl(''),
    bairro: new FormControl('', [Validators.required]),
    cidade: new FormControl('', [Validators.required]),
    uf: new FormControl('', [
      Validators.required,
      Validators.pattern(/^[A-Za-z]{2}$/),
    ]),
  });

  constructor() {
    this.form.controls.cep.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((valor) => {
        if (valor?.length === 8) {
          this.buscarCEP();
        }
      });
  }

  buscarCEP(): void {
    const cepControl = this.form.controls.cep;
    this.erroCEP = '';

    if (cepControl.invalid) {
      cepControl.markAsTouched();
      return;
    }

    this.buscandoCEP = true;

    this.viaCEPService.buscar(cepControl.value ?? '').subscribe({
      next: (endereco) => {
        this.buscandoCEP = false;

        if (!endereco) {
          this.erroCEP = 'CEP não encontrado.';
          return;
        }

        this.form.patchValue({
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.localidade,
          uf: endereco.uf,
        });
      },
      error: () => {
        this.buscandoCEP = false;
        this.erroCEP = 'Não foi possível buscar o CEP agora.';
      },
    });
  }

  onSubmit(): void {
    this.erroCadastro = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const ok = this.authService.fazerRegistro({
      nome: `${v.nome} ${v.sobrenome}`,
      email: v.email!,
      cpf: v.cpf!,
      telefone: v.telefone!,
      cep: v.cep!,
      logradouro: v.logradouro!,
      numero: v.numero!,
      complemento: v.complemento ?? '',
      bairro: v.bairro!,
      cidade: v.cidade!,
      uf: v.uf!.toUpperCase(),
    });

    if (!ok) {
      this.erroCadastro = 'E-mail ou CPF já cadastrado.';
      return;
    }

    this.router.navigate(['/']);
  }
}