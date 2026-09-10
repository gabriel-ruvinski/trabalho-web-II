import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Usuario } from '../../models/usuario';
@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  form = new FormGroup({
    nome: new FormControl('', [Validators.required]),
    sobrenome: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    cep: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{5}-\d{3}$/)
    ]),
    endereco: new FormControl('', [Validators.required]),
    numero: new FormControl('' , [Validators.required]),
    complemento: new FormControl(''),
    telefone: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\(\d{2}\) \d{4,5}-\d{4}$/)
    ]),
    cpf: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    ])
  });

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
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
      cep: this.form.value.cep!
    });

    this.router.navigate(['/']); // volta pro login após cadastro
  }
}