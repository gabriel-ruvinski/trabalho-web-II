import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { ROTULO_ESTADO } from '../../models/estado-solicitacao';
import { Solicitacao } from '../../models/solicitacao';
import { Funcionario } from '../../models/funcionario';
import { SolicitacaoApiService } from '../../services/solicitacao-api.service';
import { FuncionarioService } from '../../services/funcionario.service';
import { formatarDataHora } from '../../shared/utils/formatacao';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-redirecionar-manutencao',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './redirecionar-manutencao.html',
  styleUrl: './redirecionar-manutencao.css',
})
export class RedirecionarManutencao implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly funcionarioService = inject(FuncionarioService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(DialogService);

  carregandoFuncionarios = true;
  erroFuncionarios = '';
  enviando = false;

  solicitacao: Solicitacao | undefined;
  funcionarios: Funcionario[] = [];
  erro = '';

  form = new FormGroup({
    funcionarioDestinoId: new FormControl<number | null>(null, [Validators.required]),
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const funcionarioLogadoId = this.authService.getUsuario()?.id;

    if (!funcionarioLogadoId) {
      this.erro = 'Não foi possível identificar o funcionário logado. Faça login novamente.';
      return;
    }

    this.solicitacaoApi.obterPorId(id, funcionarioLogadoId).subscribe({
      next: (solicitacao) => {
        this.solicitacao = solicitacao;

        if (solicitacao.estado !== 'APROVADA' && solicitacao.estado !== 'REDIRECIONADA') {
          this.erro = 'Só é possível redirecionar solicitações APROVADA ou REDIRECIONADA.';
        }

        this.cdr.markForCheck();
      },
      error: (erro) => {
        console.error('Erro ao carregar solicitação:', erro);
        this.erro = erro.error?.message ?? 'Solicitação não encontrada.';
        this.cdr.markForCheck();
      },
    });

    this.funcionarioService.listar().subscribe({
      next: (funcionarios) => {
        this.funcionarios = funcionarios.filter((f) => f.id !== funcionarioLogadoId);
        this.carregandoFuncionarios = false;
        this.cdr.markForCheck();
      },
      error: (erro) => {
        console.error('Erro ao carregar funcionários:', erro);
        this.erroFuncionarios = 'Não foi possível carregar os funcionários.';
        this.carregandoFuncionarios = false;
        this.cdr.markForCheck();
      },
    });
  }

  rotuloEstado(solicitacao: Solicitacao): string {
    return ROTULO_ESTADO[solicitacao.estado];
  }

  formatarDataHora = formatarDataHora;

  onSubmit(): void {
    if (!this.solicitacao || this.erro || this.enviando) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const origemId = this.authService.getUsuario()?.id;
    if (!origemId) {
      this.dialog.erro('Não foi possível identificar o funcionário logado.');
      return;
    }

    const destinoId = this.form.controls.funcionarioDestinoId.value!;
    const destino = this.funcionarios.find((f) => f.id === destinoId);
    if (!destino) {
      this.dialog.erro('Funcionário selecionado inválido.');
      return;
    }

    this.enviando = true;

    this.solicitacaoApi
      .redirecionar(this.solicitacao.id, origemId, destinoId)
      .subscribe({
        next: async () => {
          await this.dialog.avisar(`Solicitação redirecionada para ${destino.nome}.`);
          this.router.navigate(['/lista-solicitacoes']);
        },
        error: (erro) => {
          console.error('Erro ao redirecionar:', erro);
          this.enviando = false;
          this.dialog.erro(erro.error?.message ?? 'Não foi possível redirecionar.');
        },
      });
  }

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}