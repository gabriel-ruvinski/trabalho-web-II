import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoApiService } from '../../services/solicitacao-api.service';
import { formatarDataHora, formatarMoeda } from '../../shared/utils/formatacao';

@Component({
  selector: 'app-efetuar-manutencao',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './efetuar-manutencao.html',
  styleUrl: './efetuar-manutencao.css',
})
export class EfetuarManutencao implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  solicitacao: Solicitacao | undefined;
  erro = '';
  enviando = false;

  form = new FormGroup({
    descricaoManutencao: new FormControl('', [Validators.required, Validators.minLength(5)]),
    orientacoesCliente: new FormControl('', [Validators.required, Validators.minLength(5)]),
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const funcionarioId = this.authService.getUsuario()?.id;

    if (!funcionarioId) {
      this.erro = 'Não foi possível identificar o funcionário logado. Faça login novamente.';
      return;
    }

    this.solicitacaoApi.obterPorId(id, funcionarioId).subscribe({
      next: (solicitacao) => {
        this.solicitacao = solicitacao;

        if (solicitacao.estado !== 'APROVADA' && solicitacao.estado !== 'REDIRECIONADA') {
          this.erro = 'Só é possível efetuar manutenção em solicitações APROVADA ou REDIRECIONADA.';
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

    const funcionarioId = this.authService.getUsuario()?.id;
    if (!funcionarioId) {
      alert('Não foi possível identificar o funcionário logado.');
      return;
    }

    this.enviando = true;

    this.solicitacaoApi
      .registrarManutencao(
        this.solicitacao.id,
        funcionarioId,
        (this.form.controls.descricaoManutencao.value ?? '').trim(),
        (this.form.controls.orientacoesCliente.value ?? '').trim(),
      )
      .subscribe({
        next: () => {
          alert('Manutenção registrada. A solicitação está ARRUMADA.');
          this.router.navigate(['/lista-solicitacoes']);
        },
        error: (erro) => {
          console.error('Erro ao registrar manutenção:', erro);
          alert(erro.error?.message ?? 'Não foi possível registrar a manutenção.');
          this.enviando = false;
        },
      });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}