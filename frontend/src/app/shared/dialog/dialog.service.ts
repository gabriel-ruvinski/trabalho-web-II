import { Injectable, signal } from '@angular/core';

export type TipoDialog = 'aviso' | 'erro' | 'confirmacao';

export interface EstadoDialog {
  tipo: TipoDialog;
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  resolver: (confirmado: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  readonly estado = signal<EstadoDialog | null>(null);

  avisar(mensagem: string, titulo = 'Aviso'): Promise<void> {
    return this.abrir('aviso', titulo, mensagem, 'OK').then(() => undefined);
  }

  erro(mensagem: string, titulo = 'Erro'): Promise<void> {
    return this.abrir('erro', titulo, mensagem, 'OK').then(() => undefined);
  }

  confirmar(
    mensagem: string,
    titulo = 'Confirmação',
    textoConfirmar = 'Confirmar',
  ): Promise<boolean> {
    return this.abrir('confirmacao', titulo, mensagem, textoConfirmar);
  }

  fechar(confirmado: boolean): void {
    const atual = this.estado();
    if (!atual) {
      return;
    }
    this.estado.set(null);
    atual.resolver(confirmado);
  }

  private abrir(
    tipo: TipoDialog,
    titulo: string,
    mensagem: string,
    textoConfirmar: string,
  ): Promise<boolean> {
    this.estado()?.resolver(false);

    return new Promise<boolean>((resolve) => {
      this.estado.set({ tipo, titulo, mensagem, textoConfirmar, resolver: resolve });
    });
  }
}