
import { Component, OnInit, inject } from '@angular/core';
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
export class Lista implements OnInit {
  private readonly funcionarioService = inject(FuncionarioService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  funcionarios: Funcionario[] = [];
  carregando = false;
  erro = '';

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.erro = '';

    this.funcionarioService.listar().subscribe({
      next: (funcionarios) => {
        this.funcionarios = funcionarios;
        this.carregando = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar funcionários:', erro);
        this.erro = 'Não foi possível carregar os funcionários.';
        this.carregando = false;
      },
    });
  }

  remover(funcionario: Funcionario): void {
    const emailLogado = this.authService.getUsuario()?.email ?? '';

    if (funcionario.email === emailLogado) {
      alert('Você não pode remover seu próprio cadastro.');
      return;
    }

    const confirmou = confirm(
      `Tem certeza que deseja remover o funcionário "${funcionario.nome}"?`,
    );

    if (!confirmou) {
      return;
    }

    this.funcionarioService.remover(funcionario.id).subscribe({
      next: () => {
        this.carregar();
      },
      error: (erro) => {
        console.error('Erro ao remover funcionário:', erro);
        this.erro = 'Não foi possível remover o funcionário.';
      },
    });
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
