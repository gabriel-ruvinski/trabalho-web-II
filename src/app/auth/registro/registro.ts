import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ViaCEPService } from '../../services/viacep.service';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly viaCEPService = inject(ViaCEPService);

  buscandoCEP = false;
  erroCEP = '';

  form = new FormGroup({
    nome: new FormControl('', [Validators.required]),
    sobrenome: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    cep: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{5}-\d{3}$/), /** XXXXX-XXX */
    ]),
    endereco: new FormControl('', [Validators.required]),
    numero: new FormControl('', [Validators.required]),
    complemento: new FormControl(''),
    telefone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/), /** (XX) XXXXX-XXXX */
    ]),
    cpf: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/), /** XXX.XXX.XXX-XX */
    ]),
  });

  buscarCEP(): void {
    const CEPControl = this.form.get('cep');
    this.erroCEP = '';

    if (CEPControl?.invalid) {
      CEPControl.markAsTouched();
      return;
    }

    this.buscandoCEP = true;

    this.viaCEPService.buscar(CEPControl?.value ?? '').subscribe({
      next: (endereco) => {
        this.buscandoCEP = false;

        if (!endereco) {
          this.erroCEP = 'CEP não encontrado.';
          return;
        }

        this.form.patchValue({
          endereco: `${endereco.logradouro}, ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`,
        });
      },
      error: () => {
        this.buscandoCEP = false;
        this.erroCEP = 'Não foi possível buscar o CEP agora.';
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const nomeCompleto = `${this.form.value.nome} ${this.form.value.sobrenome}`;

    this.authService.fazerRegistro({
      nome: nomeCompleto,
      email: this.form.value.email!,
      cpf: this.form.value.cpf!,
      telefone: this.form.value.telefone!,
      cep: this.form.value.cep!,
    });

    this.router.navigate(['/']);
  }
}