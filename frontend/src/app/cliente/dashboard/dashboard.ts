import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { AcaoBotao, SolicitacaoService } from '../../services/solicitacao.service';
import { SolicitacaoApiService } from '../../services/solicitacao-api.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly solicitacaoService = inject(SolicitacaoService);
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  solicitacoes: Solicitacao[] = [];
  erro = '';

  ngOnInit(): void {
    const clienteId = this.authService.getUsuario()?.id;

    if (!clienteId) {
      this.erro = 'Não foi possível identificar o cliente logado. Faça login novamente.';
      return;
    }

    this.solicitacaoApi.listarDoCliente(clienteId).subscribe({
      next: (solicitacoes) => {
        this.solicitacoes = solicitacoes;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        console.error('Erro ao carregar solicitações:', erro);
        this.erro = erro.error?.message ?? 'Não foi possível carregar as solicitações.';
        this.cdr.markForCheck();
      },
    });
  }

  getAcaoBotao(solicitacao: Solicitacao): AcaoBotao | null {
    return this.solicitacaoService.getAcaoBotao(solicitacao);
  }

  rotuloEstado(solicitacao: Solicitacao): string {
    return ROTULO_ESTADO[solicitacao.estado];
  }

  descricaoResumida(texto: string): string {
    return texto.length > 30 ? `${texto.slice(0, 30)}…` : texto;
  }

  formatarDataHora(data: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(data);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  usuario = this.authService.getUsuario();
}