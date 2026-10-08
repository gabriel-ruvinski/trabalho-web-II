import { EstadoSolicitacao } from './estado-solicitacao';

export interface HistoricoSolicitacao {
  dataHora: Date;
  estado: EstadoSolicitacao;
  funcionarioNome: string | null;
  observacao: string;
}
