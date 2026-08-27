export const ESTADOS_SOLICITACAO = [
  'ABERTA',
  'ORCADA',
  'APROVADA',
  'REJEITADA',
  'REDIRECIONADA',
  'ARRUMADA',
  'PAGA',
  'FINALIZADA',
] as const;

export type EstadoSolicitacao = (typeof ESTADOS_SOLICITACAO)[number];

export const ROTULO_ESTADO: Record<EstadoSolicitacao, string> = {
  ABERTA: 'ABERTA',
  ORCADA: 'ORÇADA',
  APROVADA: 'APROVADA',
  REJEITADA: 'REJEITADA',
  REDIRECIONADA: 'REDIRECIONADA',
  ARRUMADA: 'ARRUMADA',
  PAGA: 'PAGA',
  FINALIZADA: 'FINALIZADA',
};
