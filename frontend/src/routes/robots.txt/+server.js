/// Instruções para os robôs de busca.
///
/// As áreas logadas ficam fora do índice — não porque sejam secretas (a API
/// exige autenticação de qualquer forma), mas porque uma tela de conta vazia
/// na busca só gasta orçamento de rastreio.
///
/// Na versão pública de demonstração o arquivo bloqueia tudo: as duas cópias
/// do site não podem disputar a mesma busca.
import { empresa, demonstracao } from '$lib/identidade.js';

export const prerender = true;

export function GET() {
  const linhas = demonstracao
    ? ['User-agent: *', 'Disallow: /']
    : [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /conta',
        'Disallow: /proposta',
        'Disallow: /en/admin',
        'Disallow: /en/conta',
        'Disallow: /en/proposta',
        '',
        `Sitemap: ${empresa.url}/sitemap.xml`
      ];

  return new Response(`${linhas.join('\n')}\n`, {
    headers: { 'content-type': 'text/plain; charset=utf-8' }
  });
}
