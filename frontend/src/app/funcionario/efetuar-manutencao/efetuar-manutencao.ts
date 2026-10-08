import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoService } from '../../services/solicitacao.service';
import { formatarDataHora, formatarMoeda } from '../../shared/utils/formatacao';

@Component({
  selector: 'app-efetuar-manutencao',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './efetuar-manutencao.html',
  styleUrl: './efetuar-manutencao.css',
})
export class EfetuarManutencao {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoService = inject(SolicitacaoService);

  solicitacao: Solicitacao | undefined;
  erro = '';

  form = new FormGroup({
    descricaoManutencao: new FormControl('', [Validators.required, Validators.minLength(5)]),
    orientacoesCliente: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.solicitacao = this.solicitacaoService.obterPorId(id);
    if (!this.solicitacao) {
      this.erro = 'Solicitação não encontrada.';
    } else if (this.solicitacao.estado !== 'APROVADA' && this.solicitacao.estado !== 'REDIRECIONADA') {
      this.erro = 'Só é possível efetuar manutenção em solicitações APROVADA ou REDIRECIONADA.';
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

    const funcionario = this.authService.getUsuario()?.nome ?? 'Funcionário';
    this.solicitacaoService.efetuarManutencao(
      this.solicitacao.id,
      this.form.controls.descricaoManutencao.value ?? '',
      this.form.controls.orientacoesCliente.value ?? '',
      funcionario,
    );
    alert('Manutenção registrada. A solicitação está ARRUMADA.');
    this.router.navigate(['/lista-solicitacoes']);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
