import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoApiService } from '../../services/solicitacao-api.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  solicitacoes: Solicitacao[] = [];
  erro = '';

  ngOnInit(): void {
    const funcionarioId = this.authService.getUsuario()?.id;

    if (!funcionarioId) {
      this.erro = 'Não foi possível identificar o funcionário logado. Faça login novamente.';
      return;
    }

    this.solicitacaoApi.listarAbertas(funcionarioId).subscribe({
      next: (solicitacoes) => {
        this.solicitacoes = solicitacoes;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        console.error('Erro ao carregar solicitações abertas:', erro);
        this.erro = erro.error?.message ?? 'Não foi possível carregar as solicitações.';
        this.cdr.markForCheck();
      },
    });
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
}