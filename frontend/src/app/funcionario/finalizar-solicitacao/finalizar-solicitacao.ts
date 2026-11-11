import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoApiService } from '../../services/solicitacao-api.service';
import { formatarDataHora, formatarMoeda } from '../../shared/utils/formatacao';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-finalizar-solicitacao',
  imports: [RouterLink],
  templateUrl: './finalizar-solicitacao.html',
  styleUrl: './finalizar-solicitacao.css',
})
export class FinalizarSolicitacao implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(DialogService);

  solicitacao: Solicitacao | undefined;
  erro = '';
  enviando = false;

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

        if (solicitacao.estado !== 'PAGA') {
          this.erro = 'Só é possível finalizar solicitações no estado PAGA.';
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

  confirmar(): void {
    if (!this.solicitacao || this.erro || this.enviando) {
      return;
    }

    const funcionarioId = this.authService.getUsuario()?.id;
    if (!funcionarioId) {
      this.dialog.erro('Não foi possível identificar o funcionário logado.');
      return;
    }

    this.enviando = true;

    this.solicitacaoApi.finalizar(this.solicitacao.id, funcionarioId).subscribe({
      next: async () => {
        await this.dialog.avisar('Solicitação finalizada.');
        this.router.navigate(['/lista-solicitacoes']);
      },
      error: (erro) => {
        console.error('Erro ao finalizar:', erro);
        this.enviando = false;
        this.dialog.erro(erro.error?.message ?? 'Não foi possível finalizar a solicitação.');
      },
    });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}