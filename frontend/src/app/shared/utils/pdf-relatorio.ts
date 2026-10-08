import type { jsPDF } from 'jspdf';

export interface RelatorioPdf {
  titulo: string;
  subtitulo: string;
  nomeArquivo: string;
  colunas: string[];
  linhas: string[][];
  rodape?: string[];
}

function arrayBufferParaBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binario = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binario += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binario);
}

async function carregarFonte(
  doc: jsPDF,
  caminho: string,
  nomeArquivo: string,
  estilo: 'normal' | 'bold',
): Promise<boolean> {
  try {
    const resposta = await fetch(caminho);
    if (!resposta.ok) {
      return false;
    }
    const base64 = arrayBufferParaBase64(await resposta.arrayBuffer());
    doc.addFileToVFS(nomeArquivo, base64);
    doc.addFont(nomeArquivo, 'RelatorioSans', estilo);
    return true;
  } catch {
    return false;
  }
}

export async function baixarRelatorioPdf(relatorio: RelatorioPdf): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const regular = await carregarFonte(doc, '/fonts/DejaVuSans.ttf', 'DejaVuSans.ttf', 'normal');
  const negrito = await carregarFonte(doc, '/fonts/DejaVuSans-Bold.ttf', 'DejaVuSans-Bold.ttf', 'bold');
  const fonte = regular ? 'RelatorioSans' : 'helvetica';
  const estiloTitulo = negrito ? 'bold' : 'normal';

  doc.setFont(fonte, estiloTitulo);
  doc.setFontSize(16);
  doc.text(relatorio.titulo, 14, 18);

  doc.setFont(fonte, 'normal');
  doc.setFontSize(10);
  doc.text(relatorio.subtitulo, 14, 26);

  autoTable(doc, {
    startY: 32,
    head: [relatorio.colunas],
    body: relatorio.linhas,
    foot: relatorio.rodape ? [relatorio.rodape] : undefined,
    theme: 'grid',
    styles: { font: fonte, fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [8, 38, 45], textColor: 255, fontStyle: estiloTitulo, font: fonte },
    footStyles: {
      fillColor: [230, 230, 230],
      textColor: 20,
      fontStyle: estiloTitulo,
      font: fonte,
    },
    columnStyles: { 1: { halign: 'right' } },
    margin: { left: 14, right: 14 },
  });

  doc.save(relatorio.nomeArquivo);
}
