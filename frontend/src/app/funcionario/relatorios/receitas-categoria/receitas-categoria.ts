import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ReceitaPorCategoria } from '../../../models/receita';
import { RelatorioService } from '../../../services/relatorio.service';
import { formatarMoeda } from '../../../shared/utils/formatacao';
import { baixarRelatorioPdf } from '../../../shared/utils/pdf-relatorio';

@Component({
  selector: 'app-receitas-categoria',
  templateUrl: './receitas-categoria.html',
  styleUrl: './receitas-categoria.css',
})
export class ReceitasCategoria {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly relatorioService = inject(RelatorioService);

  linhas: ReceitaPorCategoria[] = [];
  formatarMoeda = formatarMoeda;

  constructor() {
    this.linhas = this.relatorioService.receitaPorCategoria();
  }

  get total(): number {
    return this.relatorioService.total(this.linhas);
  }

  async gerarPdf(): Promise<void> {
    await baixarRelatorioPdf({
      titulo: 'Relatório de receitas por categoria',
      subtitulo: 'Receita desde sempre, agrupada por categoria de equipamento.',
      nomeArquivo: 'relatorio-receitas-categoria.pdf',
      colunas: ['Categoria', 'Receita'],
      linhas: this.linhas.map((linha) => [linha.categoriaNome, formatarMoeda(linha.valor)]),
      rodape: ['Total', formatarMoeda(this.total)],
    });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
