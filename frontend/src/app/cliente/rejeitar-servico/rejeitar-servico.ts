import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../auth/services/auth.service';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoApiService } from '../../services/solicitacao-api.service';
import { DialogService } from '../../shared/dialog/dialog.service';

@Component({
  selector: 'app-rejeitar-servico',
  imports: [ReactiveFormsModule],
  templateUrl: './rejeitar-servico.html',
  styleUrl: './rejeitar-servico.css',
})
export class RejeitarServico implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly solicitacaoApi = inject(SolicitacaoApiService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialog = inject(DialogService);

  solicitacao: Solicitacao | null = null;
  erro = '';
  enviando = false;
  private id!: number;

  form = new FormGroup({
    motivo: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(500),
    ]),
  });

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    const clienteId = this.authService.getUsuario()?.id;

    if (!clienteId) {
      this.dialog.erro('Não foi possível identificar o cliente logado.');
      return;
    }

    this.solicitacaoApi.obterPorId(this.id, clienteId).subscribe({
      next: (solicitacao) => {
        if (solicitacao.estado !== 'ORCADA') {
          this.erro = 'Só é possível rejeitar solicitações no estado ORÇADA.';
        } else {
          this.solicitacao = solicitacao;
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

  onSubmit(): void {
    const clienteId = this.authService.getUsuario()?.id;

    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    if (!clienteId) {
      this.dialog.erro('Não foi possível identificar o cliente logado.');
      return;
    }

    this.enviando = true;

    this.solicitacaoApi
      .rejeitarOrcamento(this.id, clienteId, (this.form.value.motivo ?? '').trim())
      .subscribe({
        next: async () => {
          await this.dialog.avisar('Serviço Rejeitado.');
          this.router.navigate(['/dashboard']);
        },
        error: (erro) => {
          console.error('Erro ao rejeitar serviço:', erro);
          this.enviando = false;
          this.dialog.erro(erro.error?.message ?? 'Não foi possível rejeitar o serviço.');
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}