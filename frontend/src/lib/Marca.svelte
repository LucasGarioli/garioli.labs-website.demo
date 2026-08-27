<script>
  import { rota, textos } from '$lib/conteudo/index.js';

  /// A marca da empresa, em um lugar só.
  ///
  /// Antes cada página escrevia a sua: a barra do site tinha o símbolo e o
  /// logotipo em duas forças; o painel, o orçamento e a proposta tinham
  /// "GARIOLI LABS" em texto puro, sem símbolo, em três tamanhos diferentes.
  /// Quatro versões da mesma coisa divergem no primeiro ajuste — e todas
  /// levam para a mesma página, então são um componente só.
  let { lang = 'pt', tamanho = 'media', tom = 'claro' } = $props();

  const t = $derived(textos(lang));
</script>

<a
  href={rota('/', lang)}
  class="marca"
  data-tamanho={tamanho}
  data-tom={tom}
  title={t.nav.inicio}
>
  <img src="/assets/garioli-mark.png" alt="" width="32" height="32" />
  <span class="logotipo">
    <span class="nome">Garioli</span>
    <span class="sobrenome">Labs</span>
  </span>
</a>

<style>
  .marca {
    display: inline-flex;
    align-items: center;
    color: var(--color-text);
  }
  .marca:hover { text-decoration: none; }

  .marca img {
    display: block;
    object-fit: contain;
    /* Centraliza pela altura de caixa alta, não pela caixa de linha: o centro
       da tinta de GARIOLI fica 1px acima do centro do bloco. */
    position: relative;
    top: -1px;
  }

  .logotipo {
    display: flex;
    align-items: baseline;
    font-family: var(--font-body);
    font-weight: 600;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  /* — tamanhos — */
  .marca[data-tamanho='grande'] img { width: 32px; height: 32px; margin-right: 14px; }
  .marca[data-tamanho='grande'] .logotipo { gap: 6px; }
  .marca[data-tamanho='grande'] .nome { font-size: 18px; }
  .marca[data-tamanho='grande'] .sobrenome { font-size: 13px; opacity: 0.72; }

  .marca[data-tamanho='media'] img { width: 26px; height: 26px; margin-right: 11px; }
  .marca[data-tamanho='media'] .logotipo { gap: 5px; }
  .marca[data-tamanho='media'] .nome { font-size: 15px; }
  .marca[data-tamanho='media'] .sobrenome { font-size: 11px; opacity: 0.72; }

  .marca[data-tamanho='pequena'] img { width: 22px; height: 22px; margin-right: 9px; }
  .marca[data-tamanho='pequena'] .logotipo { gap: 4px; }
  .marca[data-tamanho='pequena'] .nome { font-size: 13px; }
  .marca[data-tamanho='pequena'] .sobrenome { font-size: 10px; opacity: 0.72; }

  /* — sobre fundo escuro —
     O símbolo é tinta quase preta sobre transparente: no painel ele sumiria.
     `brightness(0)` achata para preto puro e `invert(1)` devolve branco puro,
     que é previsível — inverter o cinza original daria um branco sujo. */
  .marca[data-tom='escuro'] { color: var(--color-neutral-100); }
  .marca[data-tom='escuro'] img { filter: brightness(0) invert(1); opacity: 0.92; }
</style>
