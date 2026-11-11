import { Component, OnInit, inject, signal } from '@angular/core';
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

  funcionarios = signal<Funcionario[]>([]);
  carregando = signal(false);
  erro = signal('');
  aba = signal<'ATIVOS' | 'INATIVOS'>('ATIVOS');

  ngOnInit(): void {
    this.carregar();
  }

  selecionarAba(aba: 'ATIVOS' | 'INATIVOS'): void {
    if (this.aba() === aba) {
      return;
    }

    this.aba.set(aba);
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set('');

    const requisicao =
      this.aba() === 'ATIVOS'
        ? this.funcionarioService.listar()
        : this.funcionarioService.listarInativos();

    requisicao.subscribe({
      next: (funcionarios) => {
        this.funcionarios.set(funcionarios);
        this.carregando.set(false);
      },
      error: (erro) => {
        console.error('Erro ao carregar funcionários:', erro);
        this.erro.set('Não foi possível carregar os funcionários.');
        this.carregando.set(false);
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
        this.erro.set(
          erro.error?.message ?? 'Não foi possível remover o funcionário.',
        );
      },
    });
  }

  reativar(funcionario: Funcionario): void {
    this.funcionarioService.reativar(funcionario.id).subscribe({
      next: () => {
        this.carregar();
      },
      error: (erro) => {
        console.error('Erro ao reativar funcionário:', erro);
        this.erro.set(
          erro.error?.message ?? 'Não foi possível reativar o funcionário.',
        );
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