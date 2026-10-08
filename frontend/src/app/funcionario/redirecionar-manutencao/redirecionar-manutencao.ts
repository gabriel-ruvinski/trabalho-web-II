import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { Funcionario } from '../../models/funcionario';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { formatarDataHora } from '../../shared/utils/formatacao';

@Component({
  selector: 'app-redirecionar-manutencao',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './redirecionar-manutencao.html',
  styleUrl: './redirecionar-manutencao.css',
})
export class RedirecionarManutencao {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoService);
  private readonly funcionarioService = inject(FuncionarioService);

  solicitacao: Solicitacao | undefined;
  funcionarios: Funcionario[] = [];
  erro = '';

  form = new FormGroup({
    funcionarioDestinoId: new FormControl<number | null>(null, [Validators.required]),
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.solicitacao = this.solicitacaoService.obterPorId(id);

    if (!this.solicitacao) {
      this.erro = 'Solicitação não encontrada.';
    } else if (this.solicitacao.estado !== 'APROVADA' && this.solicitacao.estado !== 'REDIRECIONADA') {
      this.erro = 'Só é possível redirecionar solicitações APROVADA ou REDIRECIONADA.';
    }

    const emailLogado = this.authService.getUsuario()?.email ?? '';
    this.funcionarios = this.funcionarioService
      .listarAtivos()
      .filter(f => f.email !== emailLogado);
  }

  rotuloEstado(solicitacao: Solicitacao): string {
    return ROTULO_ESTADO[solicitacao.estado];
  }

  formatarDataHora = formatarDataHora;

  onSubmit(): void {
  if (!this.solicitacao || this.erro) {
    return;
  }
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const destinoId = this.form.controls.funcionarioDestinoId.value!;
  const destino = this.funcionarios.find(f => f.id === destinoId);
  if (!destino) {
    alert('Funcionário selecionado inválido.');
    return;
  }

  const emailLogado = this.authService.getUsuario()?.email ?? '';
  const funcionarioOrigem = this.funcionarioService
    .listarAtivos()
    .find(f => f.email === emailLogado);

  if (!funcionarioOrigem) {
    alert('Não foi possível identificar o funcionário logado.');
    return;
  }

  try {
    this.solicitacaoService.redirecionar(
      this.solicitacao.id,
      destino,
      funcionarioOrigem.id,
      funcionarioOrigem.nome,
    );
    alert(`Solicitação redirecionada para ${destino.nome}.`);
    this.router.navigate(['/lista-solicitacoes']);
  } catch (e) {
    alert(e instanceof Error ? e.message : 'Não foi possível redirecionar.');
  }
}
  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
