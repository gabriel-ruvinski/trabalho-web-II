import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ReceitaPorCategoria } from '../../../models/receita';
import { RelatorioService } from '../../../services/relatorio.service';
import { formatarMoeda } from '../../../shared/utils/formatacao';
import { imprimirRelatorioPdf } from '../../../shared/utils/pdf-relatorio';

@Component({
  selector: 'app-receitas-categoria',
  imports: [RouterLink],
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

  gerarPdf(): void {
    const linhasHtml = this.linhas
      .map(
        (linha) =>
          `<tr><td>${linha.categoriaNome}</td><td class="num">${formatarMoeda(linha.valor)}</td></tr>`,
      )
      .join('');

    const corpo = `
      <h1>Relatório de receitas por categoria</h1>
      <p>Receita desde sempre, agrupada por categoria de equipamento.</p>
      <table>
        <thead><tr><th>Categoria</th><th class="num">Receita</th></tr></thead>
        <tbody>${linhasHtml}</tbody>
        <tfoot><tr><td>Total</td><td class="num">${formatarMoeda(this.total)}</td></tr></tfoot>
      </table>
    `;

    imprimirRelatorioPdf('Relatório de receitas por categoria', corpo);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
