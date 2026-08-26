<script>
  /// Cabeçalho de busca de uma página: título, descrição, canônica, os dois
  /// idiomas declarados um ao outro e os dados estruturados.
  ///
  /// `caminho` é sempre o caminho **sem** prefixo de idioma (`/orcamento`);
  /// as URLs dos dois idiomas saem daqui, e não do endereço atual, para que
  /// canônica e `hreflang` nunca dependam de como o visitante chegou.
  import { textos, urlAbsoluta } from '$lib/conteudo/index.js';
  import { demonstracao, empresa } from '$lib/identidade.js';

  let {
    lang = 'pt',
    caminho = '/',
    titulo,
    descricao,
    palavras = '',
    // Cada idioma tem a sua imagem de compartilhamento; `null` pede a do
    // idioma da página, e um caminho explícito manda nela.
    imagem = null,
    imagemAlt = null,
    tipo = 'website',
    jsonld = [],
    // A versão pública de demonstração nunca deve competir com o site real
    // pela mesma busca: conteúdo duplicado divide o sinal das duas.
    indexar = !demonstracao
  } = $props();

  const canonica = $derived(urlAbsoluta(caminho, lang));
  const emPt = $derived(urlAbsoluta(caminho, 'pt'));
  const emEn = $derived(urlAbsoluta(caminho, 'en'));
  const arquivoImagem = $derived(imagem ?? (lang === 'en' ? '/og-en.png' : '/og.png'));
  const alt = $derived(imagemAlt ?? textos(lang).meta.imagemAlt);
  const imagemAbs = $derived(
    arquivoImagem.startsWith('http') ? arquivoImagem : `${empresa.url}${arquivoImagem}`
  );
</script>

<svelte:head>
  <title>{titulo}</title>
  <meta name="description" content={descricao} />
  {#if palavras}<meta name="keywords" content={palavras} />{/if}

  <link rel="canonical" href={canonica} />
  <link rel="alternate" hreflang="pt-BR" href={emPt} />
  <link rel="alternate" hreflang="en" href={emEn} />
  <link rel="alternate" hreflang="x-default" href={emPt} />

  {#if indexar}
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  {:else}
    <meta name="robots" content="noindex, follow" />
  {/if}

  <meta property="og:type" content={tipo} />
  <meta property="og:site_name" content="Garioli Labs" />
  <meta property="og:locale" content={lang === 'en' ? 'en_US' : 'pt_BR'} />
  <meta property="og:locale:alternate" content={lang === 'en' ? 'pt_BR' : 'en_US'} />
  <meta property="og:title" content={titulo} />
  <meta property="og:description" content={descricao} />
  <meta property="og:url" content={canonica} />
  <meta property="og:image" content={imagemAbs} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content={alt} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={titulo} />
  <meta name="twitter:description" content={descricao} />
  <meta name="twitter:image" content={imagemAbs} />
  <meta name="twitter:image:alt" content={alt} />

  {#each jsonld as d}
    {@html `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}<\/script>`}
  {/each}
</svelte:head>
