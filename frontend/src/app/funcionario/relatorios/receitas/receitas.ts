import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ReceitaPorDia } from '../../../models/receita';
import { RelatorioService } from '../../../services/relatorio.service';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';
import { formatarData, formatarMoeda } from '../../../shared/utils/formatacao';
import { baixarRelatorioPdf } from '../../../shared/utils/pdf-relatorio';

@Component({
  selector: 'app-receitas',
  imports: [FormsModule, ConfirmDialog],
  templateUrl: './receitas.html',
  styleUrl: './receitas.css',
})
export class Receitas implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly relatorioService = inject(RelatorioService);

  dataInicio = '';
  dataFim = '';
  erro = signal('');
  carregando = signal(false);
  linhas = signal<ReceitaPorDia[]>([]);
  total = computed(() => this.relatorioService.total(this.linhas()));
  confirmandoPdf = false;

  formatarData = formatarData;
  formatarMoeda = formatarMoeda;

  ngOnInit(): void {
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    this.erro.set('');

    if (this.dataInicio && this.dataFim && this.dataInicio > this.dataFim) {
      this.erro.set('A data inicial não pode ser posterior à data final.');
      this.linhas.set([]);
      return;
    }

    this.carregando.set(true);

    this.relatorioService
      .receitaPorDia(this.dataInicio || undefined, this.dataFim || undefined)
      .subscribe({
        next: (linhas) => {
          this.linhas.set(linhas);
          this.carregando.set(false);
        },
        error: (erro) => {
          console.error('Erro ao carregar receitas por período:', erro);
          this.linhas.set([]);
          this.erro.set(
            erro.error?.message ?? 'Não foi possível carregar o relatório.',
          );
          this.carregando.set(false);
        },
      });
  }

  limparFiltros(): void {
    this.dataInicio = '';
    this.dataFim = '';
    this.aplicarFiltro();
  }

  pedirPdf(): void {
    if (this.erro()) {
      return;
    }
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
    if (this.erro()) {
      return;
    }

    const periodo =
      !this.dataInicio && !this.dataFim
        ? 'Período: todas as datas'
        : `Período: ${this.dataInicio ? formatarData(new Date(`${this.dataInicio}T00:00:00`)) : 'início'} até ${this.dataFim ? formatarData(new Date(`${this.dataFim}T00:00:00`)) : 'hoje'}`;

    const linhasTabela =
      this.linhas().length > 0
        ? this.linhas().map((linha) => [formatarData(linha.data), formatarMoeda(linha.valor)])
        : [['Nenhuma receita no período.', '']];

    await baixarRelatorioPdf({
      titulo: 'Relatório de receitas',
      subtitulo: periodo,
      nomeArquivo: 'relatorio-receitas.pdf',
      colunas: ['Dia', 'Receita'],
      linhas: linhasTabela,
      rodape: ['Total', formatarMoeda(this.total())],
    });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}