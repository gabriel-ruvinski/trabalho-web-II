export function formatarDataHora(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) {
    return '—';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

export function parseMoedaBr(valor: string): number | null {
  const limpo = valor.replace(/\s/g, '').replace(/R\$/gi, '').trim();
  if (!limpo) {
    return null;
  }

  const normalizado = limpo.includes(',')
    ? limpo.replace(/\./g, '').replace(',', '.')
    : limpo.replace(/[^\d.]/g, '');
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}
