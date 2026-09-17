import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Solicitacao } from '../../models/solicitacao';
import { SolicitacaoService } from '../../services/solicitacao.service';

@Component({
  selector: 'app-rejeitar-servico',
  imports: [ReactiveFormsModule],
  templateUrl: './rejeitar-servico.html',
  styleUrl: './rejeitar-servico.css',
})
export class RejeitarServico {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly solicitacaoService = inject(SolicitacaoService);

  solicitacao: Solicitacao | null = null;
  private id!: number;

  form = new FormGroup({
    motivo: new FormControl('', [Validators.required, Validators.minLength(10)]),
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.solicitacao = this.solicitacaoService.obterPorId(this.id) ?? null;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.solicitacaoService.rejeitar(this.id, this.form.value.motivo!);
    alert('Serviço Rejeitado.');
    this.router.navigate(['/dashboard']);
  }

  cancelar(): void {
    this.router.navigate(['/dashboard']);
  }
}