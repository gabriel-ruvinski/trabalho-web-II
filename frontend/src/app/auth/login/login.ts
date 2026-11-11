import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DialogService } from '../../shared/dialog/dialog.service';

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
    private router: Router,
    private dialog: DialogService
  ) { }

  // Getters para email e senha
  get email(): string {
    return this.form.get('email')?.value || '';
  }
  get senha(): string {
    return this.form.get('senha')?.value || '';
  }

  enviando = false;

  // Envia o form para AuthService
  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando = true;

    this.authService.fazerLogin(this.email, this.senha).subscribe({
      next: (usuario) => {
        this.enviando = false;
        this.router.navigate([
          usuario.perfil === 'funcionario' ? '/funcionario/home' : '/dashboard',
        ]);
      },
      error: (erro) => {
        this.enviando = false;
        if (erro.status === 401) {
          this.dialog.erro('E-mail ou senha incorretos. Por favor, tente novamente.', 'Falha no login');
        } else {
          this.dialog.erro(
            'Não foi possível conectar ao servidor. Verifique se o backend está no ar.',
            'Falha no login',
          );
        }
      },
    });
  }
}