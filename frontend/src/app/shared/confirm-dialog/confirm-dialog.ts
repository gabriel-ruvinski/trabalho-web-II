import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  imports: [],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialog {
  @Input() titulo = 'Confirmação';
  @Input() mensagem = 'Tem certeza que deseja continuar?';
  @Input() aberto = false;
  @Input() mostrarCancelar = true;
  @Input() textoConfirmar = 'Confirmar';
  @Input() erro = false;

  @Output() confirmado = new EventEmitter<void>();
  @Output() cancelado = new EventEmitter<void>();

  confirmar(): void {
    this.confirmado.emit();
  }

  cancelar(): void {
    this.cancelado.emit();
  }

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {
    if (this.aberto) {
      this.cancelar();
    }
  }
}