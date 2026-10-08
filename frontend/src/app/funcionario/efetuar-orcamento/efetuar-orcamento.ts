import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { formatarDataHora, formatarMoeda, parseMoedaBr } from '../../shared/utils/formatacao';

@Component({
  selector: 'app-efetuar-orcamento',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './efetuar-orcamento.html',
  styleUrl: './efetuar-orcamento.css',
})
export class EfetuarOrcamento {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  solicitacao: Solicitacao | undefined;
  erro = '';

  form = new FormGroup({
    valor: new FormControl('', [Validators.required]),
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.solicitacao = this.solicitacaoService.obterPorId(id);
    if (!this.solicitacao) {
      this.erro = 'Solicitação não encontrada.';
    } else if (this.solicitacao.estado !== 'ABERTA') {
      this.erro = 'Só é possível orçar solicitações no estado ABERTA.';
    }
  }

  rotuloEstado(solicitacao: Solicitacao): string {
    return ROTULO_ESTADO[solicitacao.estado];
  }

  formatarDataHora = formatarDataHora;
  formatarMoeda = formatarMoeda;

  onSubmit(): void {
    if (!this.solicitacao || this.erro) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valor = parseMoedaBr(this.form.controls.valor.value ?? '');
    if (valor === null || valor <= 0) {
      this.form.controls.valor.setErrors({ moeda: true });
      return;
    }

    const funcionario = this.authService.getUsuario()?.nome ?? 'Funcionário';
    this.solicitacaoService.efetuarOrcamento(this.solicitacao.id, valor, funcionario);
    alert(`Orçamento registrado: ${formatarMoeda(valor)}`);
    this.router.navigate(['/lista-solicitacoes']);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
