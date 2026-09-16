export function imprimirRelatorioPdf(titulo: string, corpoHtml: string): void {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    window.print();
    return;
  }

  doc.open();
  doc.write(`<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <title>${titulo}</title>
    <style>
      body { font-family: Arial, Helvetica, sans-serif; color: #111; padding: 24px; }
      h1 { font-size: 20px; margin-bottom: 4px; }
      p { color: #444; margin-top: 0; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th, td { border: 1px solid #333; padding: 8px 10px; text-align: left; font-size: 13px; }
      th { background: #eee; }
      td.num, th.num { text-align: right; }
      tfoot td { font-weight: bold; }
    </style>
  </head>
  <body>
    ${corpoHtml}
  </body>
</html>`);
  doc.close();

  const janela = iframe.contentWindow;
  const limpar = () => iframe.remove();

  if (!janela) {
    limpar();
    return;
  }

  janela.addEventListener('afterprint', limpar);
  setTimeout(() => {
    janela.focus();
    janela.print();
  }, 50);
}
