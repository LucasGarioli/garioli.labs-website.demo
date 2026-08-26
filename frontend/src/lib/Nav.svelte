<script>
  import { page } from '$app/stores';
  import { IDIOMAS, ancora, caminhoBase, rota, textos } from '$lib/conteudo/index.js';

  let { cta = true, lang = 'pt' } = $props();

  const t = $derived(textos(lang));

  // As âncoras são absolutas (/#id, /en#id) para o menu funcionar também em
  // /conta e /entrar, onde as seções não existem — ali o link leva para a home
  // do idioma em que a pessoa está.
  const SECOES = $derived(t.nav.secoes);

  // O caminho sem o prefixo de idioma: é ele que o seletor traduz, para trocar
  // de idioma sem tirar ninguém da página em que está.
  const base = $derived(caminhoBase($page.url.pathname));

  let barra = $state(null);
  let trilho = $state(null);
  let traco = $state(null);

  const naHome = $derived(base === '/');

  // Marca a seção que está sob o cabeçalho e desliza o traço até ela. Só roda
  // onde as seções existem; nas outras páginas o traço nunca aparece.
  $effect(() => {
    if (!naHome || !trilho || !traco) return;

    const links = Array.from(trilho.querySelectorAll('a[data-secao]'));
    const alvos = links.map((a) => document.getElementById(a.dataset.secao));

    const medir = () => {
      // O cabeçalho é grudento: sem isto, clicar numa âncora esconde o título
      // da seção atrás dele.
      if (barra) {
        const altura = Math.round(barra.getBoundingClientRect().height);
        document.documentElement.style.setProperty('--altura-chrome', `${altura}px`);
      }

      const limite = (barra?.getBoundingClientRect().bottom ?? 120) + 12;
      let atual = -1;
      alvos.forEach((sec, i) => {
        if (!sec) return;
        const r = sec.getBoundingClientRect();
        if (r.top <= limite && r.bottom > limite) atual = i;
      });

      if (!traco) return;
      if (atual < 0) {
        traco.style.opacity = '0';
        traco.style.width = '0px';
        return;
      }
      const link = links[atual].getBoundingClientRect();
      const base = trilho.getBoundingClientRect();
      traco.style.opacity = '1';
      traco.style.left = `${link.left - base.left}px`;
      traco.style.width = `${link.width}px`;
    };

    medir();
    window.addEventListener('scroll', medir, { passive: true });
    window.addEventListener('resize', medir);
    return () => {
      window.removeEventListener('scroll', medir);
      window.removeEventListener('resize', medir);
    };
  });
</script>

<div class="chrome" bind:this={barra}>
  <div class="aviso">
    <div class="aviso-interno">
      <a href={ancora('software', lang)} class="anuncio">
        <span class="ponto" aria-hidden="true"></span>
        {t.nav.aviso}
      </a>
      <span class="idiomas" aria-label={t.nav.idiomaRotulo}>
        {#each IDIOMAS as i, n}
          {#if n > 0}<span class="risco" aria-hidden="true">/</span>{/if}
          <a
            href={rota(base, i.codigo)}
            class="idioma"
            class:ativo={i.codigo === lang}
            hreflang={i.htmlLang}
            lang={i.htmlLang}
            title={i.trocarPara}
            aria-current={i.codigo === lang ? 'true' : undefined}>{i.rotulo}</a
          >
        {/each}
      </span>
      <a href={ancora('contato', lang)} class="aviso-link">{t.nav.avisoLink}</a>
    </div>
  </div>

  <div class="rule barra">
    <a href={rota('/', lang)} class="marca" title={t.nav.inicio}>
      <img src="/assets/garioli-mark.png" alt="" width="32" height="32" />
      <span class="logotipo">
        <span class="nome">Garioli</span>
        <span class="sobrenome">Labs</span>
      </span>
    </a>

    <nav class="secoes" bind:this={trilho} aria-label={t.nav.secoesRotulo}>
      {#each SECOES as s}
        <a href={ancora(s.id, lang)} data-secao={s.id}>{s.rotulo}</a>
      {/each}
      <span class="traco" aria-hidden="true" bind:this={traco}></span>
    </nav>

    <span class="acoes">
      <a href={rota('/entrar', lang)} class="entrar">{t.nav.entrar}</a>
      {#if cta}
        <a href={rota('/orcamento', lang)} class="proposta">{t.nav.orcamento}</a>
      {/if}
    </span>
  </div>
</div>

<style>
  .chrome {
    position: sticky;
    top: 0;
    z-index: 30;
    background: var(--color-bg);
  }

  /* — faixa de aviso — */
  .aviso {
    background: var(--color-text);
    color: var(--color-neutral-400);
    border-bottom: 2px solid var(--color-neutral-800);
  }
  .aviso-interno {
    display: flex;
    align-items: center;
    gap: 8px clamp(14px, 2vw, 26px);
    flex-wrap: wrap;
    padding: 7px 48px;
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .anuncio {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-right: auto;
    color: var(--color-neutral-400);
  }
  .anuncio:hover,
  .aviso-link:hover {
    color: var(--color-neutral-100);
    text-decoration: none;
  }
  .aviso-link { color: var(--color-neutral-400); }

  /* — seletor de idioma — */
  .idiomas {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 0 0 auto;
  }
  .idioma {
    color: var(--color-neutral-500);
    font-weight: 600;
    letter-spacing: 0.14em;
  }
  .idioma:hover {
    color: var(--color-neutral-100);
    text-decoration: none;
  }
  .idioma.ativo {
    color: var(--color-neutral-100);
    border-bottom: 2px solid var(--color-accent-500);
    padding-bottom: 1px;
  }
  .risco { color: var(--color-neutral-700); }
  .ponto {
    width: 6px;
    height: 6px;
    background: var(--color-accent-500);
    flex: 0 0 auto;
    animation: pulsa 3.4s ease-in-out infinite;
  }

  /* — barra principal — */
  .barra {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px clamp(16px, 2.4vw, 32px);
    flex-wrap: wrap;
    padding: 10px 48px;
  }
  .marca {
    display: flex;
    align-items: center;
    margin-right: auto;
    color: var(--color-text);
  }
  .marca:hover { text-decoration: none; }
  .marca img {
    display: block;
    width: 32px;
    height: 32px;
    object-fit: contain;
    margin-right: 14px;
    /* Centraliza pela altura de caixa alta, não pela caixa de linha: o centro
       da tinta de GARIOLI fica 1px acima do centro do bloco. */
    position: relative;
    top: -1px;
  }
  .logotipo {
    display: flex;
    align-items: baseline;
    gap: 6px;
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
  .nome { font-size: 18px; }
  .sobrenome { font-size: 13px; opacity: 0.72; }

  .secoes {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2px;
  }
  /* A fonte do menu é a da identidade oficial, não a do protótipo antigo. */
  .secoes a {
    font-family: var(--font-body);
    font-size: 11.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text);
    padding: 12px 13px;
  }
  .secoes a:hover {
    background: var(--color-surface);
    text-decoration: none;
  }
  .traco {
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 0;
    opacity: 0;
    height: 3px;
    background: var(--color-accent);
    pointer-events: none;
    transition: left 0.5s cubic-bezier(0.22, 1, 0.28, 1),
      width 0.5s cubic-bezier(0.22, 1, 0.28, 1), opacity 0.3s ease;
  }

  .acoes {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-left: auto;
  }
  .entrar,
  .proposta {
    font-size: 11.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 11px 18px;
  }
  .entrar {
    color: var(--color-text);
    border: 2px solid var(--color-text);
  }
  .entrar:hover {
    background: var(--color-text);
    color: var(--color-neutral-100);
    text-decoration: none;
  }
  .proposta {
    background: var(--color-accent-600);
    color: var(--color-neutral-100);
    border: 2px solid var(--color-accent-600);
  }
  .proposta:hover {
    background: var(--color-accent-700);
    border-color: var(--color-accent-700);
    color: var(--color-neutral-100);
    text-decoration: none;
  }

  @keyframes pulsa {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Oito seções mais as duas ações não cabem em uma linha entre 1280 e 1400;
     aperta o menu antes de deixar a barra quebrar em duas alturas. */
  @media (max-width: 1400px) {
    .aviso-interno, .barra { padding-left: 28px; padding-right: 28px; }
    .secoes a { padding-left: 9px; padding-right: 9px; }
  }

  @media (max-width: 1080px) {
    .aviso-interno, .barra { padding-left: 24px; padding-right: 24px; }
    .secoes { order: 3; width: 100%; justify-content: flex-start; }
    .traco { bottom: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ponto { animation: none; }
    .traco { transition: opacity 0.3s ease; }
  }
</style>
