import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ReceitaPorDia } from '../../../models/receita';
import { RelatorioService } from '../../../services/relatorio.service';
import { formatarData, formatarMoeda } from '../../../shared/utils/formatacao';
import { baixarRelatorioPdf } from '../../../shared/utils/pdf-relatorio';

@Component({
  selector: 'app-receitas',
  imports: [FormsModule],
  templateUrl: './receitas.html',
  styleUrl: './receitas.css',
})
export class Receitas implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly relatorioService = inject(RelatorioService);

  dataInicio = '';
  dataFim = '';
  erro = '';
  linhas: ReceitaPorDia[] = [];

  ngOnInit(): void {
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

  async gerarPdf(): Promise<void> {
    if (this.erro) {
      return;
    }

    const periodo =
      !this.dataInicio && !this.dataFim
        ? 'Período: todas as datas'
        : `Período: ${this.dataInicio ? formatarData(new Date(`${this.dataInicio}T00:00:00`)) : 'início'} até ${this.dataFim ? formatarData(new Date(`${this.dataFim}T00:00:00`)) : 'hoje'}`;

    const linhasTabela =
      this.linhas.length > 0
        ? this.linhas.map((linha) => [formatarData(linha.data), formatarMoeda(linha.valor)])
        : [['Nenhuma receita no período.', '']];

    await baixarRelatorioPdf({
      titulo: 'Relatório de receitas',
      subtitulo: periodo,
      nomeArquivo: 'relatorio-receitas.pdf',
      colunas: ['Dia', 'Receita'],
      linhas: linhasTabela,
      rodape: ['Total', formatarMoeda(this.total)],
    });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
