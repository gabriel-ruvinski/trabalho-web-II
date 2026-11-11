import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoApiService } from '../../services/solicitacao-api.service';
import { formatarDataHora, formatarMoeda, parseMoedaBr } from '../../shared/utils/formatacao';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-efetuar-orcamento',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './efetuar-orcamento.html',
  styleUrl: './efetuar-orcamento.css',
})
export class EfetuarOrcamento implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(DialogService);

  solicitacao: Solicitacao | undefined;
  erro = '';
  enviando = false;

  form = new FormGroup({
    valor: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const funcionarioId = this.authService.getUsuario()?.id;

    if (!funcionarioId) {
      this.dialog.erro('Não foi possível identificar o funcionário logado.');
      return;
    }

    this.solicitacaoApi.obterPorId(id, funcionarioId).subscribe({
      next: (solicitacao) => {
        this.solicitacao = solicitacao;

        if (solicitacao.estado !== 'ABERTA') {
          this.erro = 'Só é possível orçar solicitações no estado ABERTA.';
        }

        this.cdr.markForCheck();
      },
      error: (erro) => {
        console.error('Erro ao carregar solicitação:', erro);
        this.erro = erro.error?.message ?? 'Solicitação não encontrada.';
        this.cdr.markForCheck();
      },
    });
  }

  rotuloEstado(solicitacao: Solicitacao): string {
    return ROTULO_ESTADO[solicitacao.estado];
  }

  formatarDataHora = formatarDataHora;
  formatarMoeda = formatarMoeda;

  onSubmit(): void {
    if (!this.solicitacao || this.erro || this.enviando) {
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

    const funcionarioId = this.authService.getUsuario()?.id;
    if (!funcionarioId) {
      this.dialog.erro('Não foi possível identificar o funcionário logado.');
      return;
    }

    this.enviando = true;

    this.solicitacaoApi
      .registrarOrcamento(this.solicitacao.id, valor, funcionarioId)
      .subscribe({
        next: async () => {
          await this.dialog.avisar(`Orçamento registrado: ${formatarMoeda(valor)}`);
          this.router.navigate(['/lista-solicitacoes']);
        },
        error: (erro) => {
          console.error('Erro ao registrar orçamento:', erro);
          this.enviando = false;
          this.dialog.erro(erro.error?.message ?? 'Não foi possível registrar o orçamento.');
        },
      });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}