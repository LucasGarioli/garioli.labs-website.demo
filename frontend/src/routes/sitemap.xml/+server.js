/// Mapa do site, gerado no build a partir da lista de páginas públicas.
///
/// Cada URL declara a sua irmã no outro idioma (`xhtml:link`), que é como o
/// Google entende que `/` e `/en` são a mesma página em duas línguas em vez de
/// conteúdo duplicado.
import { IDIOMAS, urlAbsoluta } from '$lib/conteudo/index.js';
import { demonstracao } from '$lib/identidade.js';

export const prerender = true;

/// Só entra aqui o que faz sentido alguém encontrar pela busca. Conta,
/// proposta e administração ficam de fora de propósito.
const PAGINAS = [
  { caminho: '/', prioridade: '1.0', frequencia: 'monthly' },
  { caminho: '/orcamento', prioridade: '0.8', frequencia: 'yearly' },
  { caminho: '/entrar', prioridade: '0.3', frequencia: 'yearly' }
];

export function GET() {
  const data = new Date().toISOString().slice(0, 10);

  const urls = demonstracao
    ? []
    : PAGINAS.flatMap((p) =>
        IDIOMAS.map((i) => {
          const alternativas = IDIOMAS.map(
            (j) =>
              `    <xhtml:link rel="alternate" hreflang="${j.htmlLang}" href="${urlAbsoluta(p.caminho, j.codigo)}" />`
          ).join('\n');
          return [
            '  <url>',
            `    <loc>${urlAbsoluta(p.caminho, i.codigo)}</loc>`,
            alternativas,
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlAbsoluta(p.caminho, 'pt')}" />`,
            `    <lastmod>${data}</lastmod>`,
            `    <changefreq>${p.frequencia}</changefreq>`,
            `    <priority>${p.prioridade}</priority>`,
            '  </url>'
          ].join('\n');
        })
      );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    ''
  ].join('\n');

  return new Response(xml, {
    headers: { 'content-type': 'application/xml; charset=utf-8' }
  });
}
