import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ReceitaPorCategoria } from '../../../models/receita';
import { RelatorioService } from '../../../services/relatorio.service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { formatarMoeda } from '../../../shared/utils/formatacao';
import { baixarRelatorioPdf } from '../../../shared/utils/pdf-relatorio';

@Component({
  selector: 'app-receitas-categoria',
  imports: [ConfirmDialog],
  templateUrl: './receitas-categoria.html',
  styleUrl: './receitas-categoria.css',
})
export class ReceitasCategoria implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly relatorioService = inject(RelatorioService);

  linhas: ReceitaPorCategoria[] = [];
  formatarMoeda = formatarMoeda;
  confirmandoPdf = false;

  ngOnInit(): void {
    this.relatorioService.receitaPorCategoria().subscribe({
      next: (linhas) => {
        this.linhas = linhas;
      },
      error: (erro) => {
        console.error('Erro ao carregar receitas por categoria:', erro);
      },
    });
  }

  get total(): number {
    return this.relatorioService.total(this.linhas);
  }

  pedirPdf(): void {
    this.confirmandoPdf = true;
  }

  cancelarPdf(): void {
    this.confirmandoPdf = false;
  }

  async confirmarPdf(): Promise<void> {
    this.confirmandoPdf = false;
    await this.gerarPdf();
  }

  async gerarPdf(): Promise<void> {
    await baixarRelatorioPdf({
      titulo: 'Relatório de receitas por categoria',
      subtitulo: 'Receita desde sempre, agrupada por categoria de equipamento.',
      nomeArquivo: 'relatorio-receitas-categoria.pdf',
      colunas: ['Categoria', 'Receita'],
      linhas: this.linhas.map((linha) => [
        linha.categoriaNome,
        formatarMoeda(linha.valor),
      ]),
      rodape: ['Total', formatarMoeda(this.total)],
    });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
