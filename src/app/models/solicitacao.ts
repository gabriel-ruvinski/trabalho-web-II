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
  clienteNome: string;
  clienteCpf: string;
  clienteEmail: string;
  clienteTelefone: string;
  clienteEndereco: string;
  valorOrcamento: number | null;
  descricaoManutencao: string | null;
  orientacoesCliente: string | null;
  funcionarioDestinoId: number | null;
}
