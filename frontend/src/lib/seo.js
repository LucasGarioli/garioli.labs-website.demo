/// Dados estruturados (schema.org) montados a partir do mesmo conteúdo que a
/// página mostra.
///
/// Nada aqui é escrito duas vezes: o que o Google lê no JSON-LD é o que o
/// visitante lê na tela. Um FAQ que diverge da página é motivo de perda do
/// rich result, então a única fonte é `conteudo/<idioma>.js`.
import { empresa } from './identidade.js';
import { urlAbsoluta } from './conteudo/index.js';

const ID_ORG = `${empresa.url}/#organizacao`;

/// A empresa. Repetida em toda página por `@id`, para o Google entender que
/// as páginas pertencem à mesma entidade.
export function organizacao(t) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': ID_ORG,
    name: 'Garioli Labs',
    legalName: empresa.razao,
    description: t.meta.descricao,
    url: empresa.url,
    logo: `${empresa.url}/favicon-512.png`,
    image: `${empresa.url}/og.png`,
    telephone: empresa.foneE164,
    email: empresa.email,
    founder: { '@type': 'Person', name: empresa.responsavel },
    address: {
      '@type': 'PostalAddress',
      addressLocality: empresa.cidadeSimples,
      addressRegion: empresa.estado,
      addressCountry: empresa.pais
    },
    areaServed: { '@type': 'Country', name: 'Brasil' },
    availableLanguage: ['pt-BR', 'en'],
    knowsAbout: t.sobre.especialidades,
    makesOffer: t.servicos.itens.map((s) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        name: s.t,
        description: s.d,
        serviceType: s.t,
        provider: { '@id': ID_ORG }
      }
    }))
  };
}

/// As dúvidas da home, no formato que rende o bloco de perguntas na busca.
export function perguntas(t) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.duvidas.itens.map((d) => ({
      '@type': 'Question',
      name: d.p,
      acceptedAnswer: { '@type': 'Answer', text: d.r }
    }))
  };
}

/// A página em si, amarrada à empresa.
export function paginaWeb(t, caminho, titulo, descricao) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${urlAbsoluta(caminho, t.codigo)}#pagina`,
    url: urlAbsoluta(caminho, t.codigo),
    name: titulo,
    description: descricao,
    inLanguage: t.htmlLang,
    isPartOf: { '@id': ID_ORG },
    about: { '@id': ID_ORG }
  };
}

/// O conjunto que vai na home.
export function inicio(t) {
  return [organizacao(t), paginaWeb(t, '/', t.meta.titulo, t.meta.descricao), perguntas(t)];
}
