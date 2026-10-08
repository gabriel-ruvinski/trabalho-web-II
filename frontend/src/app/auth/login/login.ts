import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),

    senha: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d{4}$/)
    ])
  });

  // Injeta o AuthService e o Router no construtor da classe
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // Getters para email e senha
  get email(): string {
    return this.form.get('email')?.value || '';
  }
  get senha(): string {
    return this.form.get('senha')?.value || ''; 
  }
  // Envia o form para AuthService
  onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const sucesso = this.authService.fazerLogin(this.email, this.senha);

  if (sucesso) {
    const usuario = this.authService.getUsuario();
    if (usuario?.perfil === 'funcionario') {
      this.router.navigate(['/funcionario/home']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  } else {
    alert('E-mail ou senha incorretos. Por favor, tente novamente.');
  }
}
}