import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ReceitaPorDia } from '../../../models/receita';
import { RelatorioService } from '../../../services/relatorio.service';
import { formatarData, formatarMoeda } from '../../../shared/utils/formatacao';
import { imprimirRelatorioPdf } from '../../../shared/utils/pdf-relatorio';

@Component({
  selector: 'app-receitas',
  imports: [FormsModule],
  templateUrl: './receitas.html',
  styleUrl: './receitas.css',
})
export class Receitas {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly relatorioService = inject(RelatorioService);

  dataInicio = '';
  dataFim = '';
  erro = '';
  linhas: ReceitaPorDia[] = [];

  constructor() {
    this.aplicarFiltro();
  }

  formatarData = formatarData;
  formatarMoeda = formatarMoeda;

  get total(): number {
    return this.relatorioService.total(this.linhas);
  }

  aplicarFiltro(): void {
    this.erro = '';
    if (this.dataInicio && this.dataFim && this.dataInicio > this.dataFim) {
      this.erro = 'A data inicial não pode ser posterior à data final.';
      this.linhas = [];
      return;
    }
    this.linhas = this.relatorioService.receitaPorDia(this.dataInicio || undefined, this.dataFim || undefined);
  }

  limparFiltros(): void {
    this.dataInicio = '';
    this.dataFim = '';
    this.aplicarFiltro();
  }

  gerarPdf(): void {
    if (this.erro) {
      return;
    }

    const periodo =
      !this.dataInicio && !this.dataFim
        ? 'Período: todas as datas'
        : `Período: ${this.dataInicio ? formatarData(new Date(`${this.dataInicio}T00:00:00`)) : 'início'} até ${this.dataFim ? formatarData(new Date(`${this.dataFim}T00:00:00`)) : 'hoje'}`;

    const linhasHtml = this.linhas
      .map(
        (linha) =>
          `<tr><td>${formatarData(linha.data)}</td><td class="num">${formatarMoeda(linha.valor)}</td></tr>`,
      )
      .join('');

    const corpo = `
      <h1>Relatório de receitas</h1>
      <p>${periodo}</p>
      <table>
        <thead><tr><th>Dia</th><th class="num">Receita</th></tr></thead>
        <tbody>${linhasHtml || '<tr><td colspan="2">Nenhuma receita no período.</td></tr>'}</tbody>
        <tfoot><tr><td>Total</td><td class="num">${formatarMoeda(this.total)}</td></tr></tfoot>
      </table>
    `;

    imprimirRelatorioPdf('Relatório de receitas', corpo);
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
