/// Seleção de idioma e construção de URL.
///
/// O idioma **está na URL**, não num estado do cliente: `/` é português e
/// `/en` é inglês. Isso é o que permite ao Google indexar as duas versões,
/// declarar `hreflang` entre elas e servir a certa em cada busca — um botão
/// que só troca o texto na tela seria invisível para o buscador.
import pt from './pt.js';
import en from './en.js';
import { empresa } from '../identidade.js';

export const PADRAO = 'pt';

const TEXTOS = { pt, en };

/// Ordem fixa: é a ordem em que os dois idiomas aparecem no seletor.
export const IDIOMAS = [pt, en].map((t) => ({
  codigo: t.codigo,
  htmlLang: t.htmlLang,
  nome: t.nome,
  rotulo: t.rotulo,
  trocarPara: t.trocarPara
}));

export function textos(idioma) {
  return TEXTOS[idioma] ?? TEXTOS[PADRAO];
}

/// Qual idioma uma URL representa. `/en` e tudo abaixo dele é inglês.
export function idiomaDaRota(pathname) {
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : PADRAO;
}

/// O caminho sem o prefixo de idioma — a chave que identifica a página nas
/// duas versões (`/en/orcamento` e `/orcamento` viram ambos `/orcamento`).
export function caminhoBase(pathname) {
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3);
  return pathname || '/';
}

/// O caminho base traduzido para um idioma.
export function rota(caminho, idioma) {
  const limpo = caminho.startsWith('/') ? caminho : `/${caminho}`;
  if (idioma === PADRAO) return limpo;
  return limpo === '/' ? '/en' : `/en${limpo}`;
}

/// Âncora de seção da home, válida a partir de qualquer página.
export function ancora(id, idioma) {
  return idioma === PADRAO ? `/#${id}` : `/en#${id}`;
}

/// URL absoluta — canônica, `hreflang` e Open Graph precisam dela completa.
export function urlAbsoluta(caminho, idioma) {
  return `${empresa.url}${rota(caminho, idioma)}`;
}
