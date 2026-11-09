import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-recuperar-senha',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.css',
})
export class RecuperarSenha {
  form = new FormGroup({
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ])
  });

  enviando = signal(false);
  mensagem = signal('');
  erro = signal('');

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  get email(): string {
    return this.form.get('email')?.value || '';
  }

  onSubmit() {
    this.mensagem.set('');
    this.erro.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.enviando.set(true);

    this.authService.recuperarSenha(this.email).subscribe({
      next: () => {
        this.enviando.set(false);
        this.mensagem.set(
          'Se o e-mail estiver cadastrado, uma nova senha de 4 dígitos foi enviada. Use-a para entrar.'
        );
      },
      error: () => {
        this.enviando.set(false);
        this.erro.set('Não foi possível enviar a nova senha agora. Tente novamente.');
      },
    });
  }
}