import { EstadoSolicitacao } from './estado-solicitacao';
import { HistoricoSolicitacao } from './historico-solicitacao';

export interface Solicitacao {
  id: number;
  descricaoEquipamento: string;
  categoriaId: number;
  categoriaNome: string;
  descricaoDefeito: string;
  dataHoraAbertura: Date;
  estado: EstadoSolicitacao;
  historico: HistoricoSolicitacao[];
}
