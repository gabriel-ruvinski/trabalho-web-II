import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { Funcionario } from '../../../models/funcionario';
import { FuncionarioService } from '../../../services/funcionario.service';

@Component({
  selector: 'app-lista',
  imports: [RouterLink],
  templateUrl: './lista.html',
  styleUrl: './lista.css',
})
export class Lista {
  private readonly funcionarioService = inject(FuncionarioService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  funcionarios: Funcionario[] = [];

  constructor() {
    this.carregar();
  }

  private carregar(): void {
    this.funcionarios = this.funcionarioService.listarAtivos();
  }

  remover(funcionario: Funcionario): void {
    const confirmou = confirm(
      `Tem certeza que deseja remover o funcionário "${funcionario.nome}"?`,
    );

    if (!confirmou) {
      return;
    }

    const emailLogado = this.authService.getUsuario()?.email ?? '';
    const sucesso = this.funcionarioService.remover(funcionario.id, emailLogado);

    if (!sucesso) {
      if (funcionario.email === emailLogado) {
        alert('Você não pode remover seu próprio cadastro.');
      } else {
        alert('Não é possível remover o único funcionário do sistema.');
      }
      return;
    }

    this.carregar();
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}