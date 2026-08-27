<script>
  import { rotulos } from './rotulos.js';

  /// Prancha em tela cheia.
  ///
  /// A folha inteira cabe na largura de um telefone, e nessa escala um rótulo
  /// cotado em 10 px vira 3 px: o desenho aparece, mas não se lê. O visor não
  /// redesenha nada e não mantém uma segunda versão do desenho — ele leva a
  /// mesma folha para a escala em que foi cotada e deixa percorrê-la, que é o
  /// que se faz com papel grande em cima da mesa.
  let { nome, lang = 'pt', children } = $props();

  const r = $derived(rotulos(lang));

  const NATURAL = 1;

  let aberto = $state(false);
  let escala = $state(NATURAL);
  let palco = $state(null);
  let janela = $state(0);

  // Escala natural é uma unidade do desenho por pixel de tela: nela o rótulo
  // cotado em 10 px mede 10 px. Quanto isso dá em largura depende da folha —
  // a planta tem 1200 unidades, o visor do mapa tem 642 —, então quem
  // responde é o viewBox, não um número escrito aqui.
  let unidades = $state(1200);
  const ESCALAS = $derived([
    '100%',
    `${unidades}px`,
    `${Math.round(unidades * 1.5)}px`,
    `${Math.round(unidades * 2.2)}px`
  ]);

  // O convite só existe onde resolve alguma coisa: no desktop a prancha já
  // está na escala de leitura, e um botão ali seria enfeite.
  const estreito = $derived(janela > 0 && janela < 900);

  function centralizar() {
    if (!palco) return;
    palco.scrollLeft = (palco.scrollWidth - palco.clientWidth) / 2;
    palco.scrollTop = 0;
  }

  function abrir() {
    unidades = palco?.querySelector('svg')?.viewBox?.baseVal?.width || 1200;
    aberto = true;
    escala = NATURAL;
    requestAnimationFrame(centralizar);
  }

  // Aproximar e afastar em torno do que está no meio da tela: quem apertou
  // "+" quer ver mais de perto o que já estava olhando, não voltar ao começo
  // da folha.
  function mudar(passo) {
    const alvo = Math.min(ESCALAS.length - 1, Math.max(0, escala + passo));
    if (alvo === escala) return;
    const fx = palco ? (palco.scrollLeft + palco.clientWidth / 2) / palco.scrollWidth : 0.5;
    const fy = palco ? (palco.scrollTop + palco.clientHeight / 2) / palco.scrollHeight : 0;
    escala = alvo;
    requestAnimationFrame(() => {
      if (!palco) return;
      palco.scrollLeft = fx * palco.scrollWidth - palco.clientWidth / 2;
      palco.scrollTop = fy * palco.scrollHeight - palco.clientHeight / 2;
    });
  }

  function ajustar() {
    escala = 0;
    requestAnimationFrame(centralizar);
  }

  // No toque a rolagem nativa já percorre a folha. O arrasto é para o mouse,
  // onde não há inércia nenhuma e barras de rolagem são um jeito ruim de
  // andar por um desenho.
  let arrastando = false;
  let x0 = 0, y0 = 0, l0 = 0, t0 = 0;

  function pegar(e) {
    if (!aberto || !palco || e.pointerType === 'touch' || e.button !== 0) return;
    arrastando = true;
    x0 = e.clientX;
    y0 = e.clientY;
    l0 = palco.scrollLeft;
    t0 = palco.scrollTop;
    palco.setPointerCapture(e.pointerId);
  }

  function mover(e) {
    if (!arrastando || !palco) return;
    palco.scrollLeft = l0 - (e.clientX - x0);
    palco.scrollTop = t0 - (e.clientY - y0);
  }

  function soltar(e) {
    if (!arrastando) return;
    arrastando = false;
    if (palco?.hasPointerCapture(e.pointerId)) palco.releasePointerCapture(e.pointerId);
  }

  // Com o visor aberto, a página atrás dele não rola.
  $effect(() => {
    if (!aberto) return;
    const antes = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = antes;
    };
  });
</script>

<svelte:window
  bind:innerWidth={janela}
  onkeydown={(e) => {
    if (aberto && e.key === 'Escape') aberto = false;
  }}
/>

<div
  class="visor"
  class:aberto
  style="--folha:{ESCALAS[escala]}"
  role={aberto ? 'dialog' : undefined}
  aria-modal={aberto ? 'true' : undefined}
  aria-label={aberto ? nome : undefined}
>
  {#if aberto}
    <div class="barra">
      <span class="nome">{nome}</span>
      <button type="button" class="fechar" onclick={() => (aberto = false)}>{r.visor.fechar}</button>
      <div class="botoes">
        <button type="button" class="passo" onclick={() => mudar(-1)}
                disabled={escala === 0} aria-label={r.visor.afastar}>−</button>
        <button type="button" onclick={ajustar} disabled={escala === 0}>{r.visor.ajustar}</button>
        <button type="button" class="passo" onclick={() => mudar(1)}
                disabled={escala === ESCALAS.length - 1} aria-label={r.visor.aproximar}>+</button>
      </div>
    </div>
  {:else if estreito}
    <button type="button" class="abrir-visor" onclick={abrir}>
      <span class="abrir-nome">{nome}</span>
      <span class="abrir-acao">{r.visor.ampliar} ↗</span>
      <span class="abrir-dica">{r.visor.dica}</span>
    </button>
  {/if}

  <!-- Painel rolável: com o visor aberto ele é uma região navegável, e o
       teclado precisa poder entrar nela para percorrer a prancha. A regra do
       compilador não abre exceção para região rolável; a WAI-ARIA abre, e é
       ela que manda aqui — sem o foco, quem não usa mouse não sai do canto
       superior esquerdo da folha. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div
    class="palco"
    role="region"
    aria-label={nome}
    tabindex={aberto ? 0 : -1}
    bind:this={palco}
    onpointerdown={pegar}
    onpointermove={mover}
    onpointerup={soltar}
    onpointercancel={soltar}
  >
    {@render children()}
  </div>

  {#if aberto}
    <p class="rodape">{r.visor.arraste}</p>
  {/if}
</div>

<style>
  .visor { display: flex; flex-direction: column; }

  /* — a chamada, só no telefone —
     Uma tarja de prancha: o código do desenho de um lado, o convite do
     outro, encostada em cima da folha como a aba de uma pasta. */
  .abrir-visor {
    /* Duas linhas, e nao uma: o nome da prancha e o convite juntos passam de
       390 px, e uma tarja que estoura a tela e' justamente o defeito que este
       visor existe para corrigir. */
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 3px 12px;
    width: 100%;
    margin: 0 0 8px;
    padding: 9px 20px;
    box-sizing: border-box;
    border: 0;
    border-top: 2px solid var(--color-neutral-100);
    background: transparent;
    color: var(--color-neutral-100);
    font-family: var(--font-tecnica);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-align: left;
    cursor: pointer;
  }
  /* Mesmo respiro lateral da coluna de texto da página, que abre em 760 px. */
  @media (min-width: 761px) {
    .abrir-visor { padding-left: 24px; padding-right: 24px; }
  }
  .abrir-nome { font-weight: 700; }
  .abrir-acao { color: var(--color-accent-400); white-space: nowrap; font-weight: 700; }
  .abrir-dica {
    grid-column: 1 / -1;
    color: var(--color-neutral-500);
    text-transform: none;
    letter-spacing: 0.02em;
  }

  /* — o visor aberto — */
  .visor.aberto {
    position: fixed;
    inset: 0;
    z-index: 90;
    background: var(--color-text);
    color: var(--color-neutral-100);
  }

  .barra {
    /* O nome da prancha em uma linha só com os quatro botões deixava dois
       caracteres visíveis: "AC-01 · …". Fechar fica no alto à direita, onde
       se procura por ele, e o zoom desce para a linha de baixo. */
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px 12px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-neutral-800);
    font-family: var(--font-tecnica);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .nome { font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .botoes { grid-column: 1 / -1; display: flex; gap: 6px; }
  .botoes button, .fechar {
    min-width: 40px;
    min-height: 36px;
    padding: 0 11px;
    border: 1px solid var(--color-neutral-700);
    background: transparent;
    color: var(--color-neutral-100);
    font-family: inherit;
    font-size: 11px;
    letter-spacing: inherit;
    text-transform: inherit;
    cursor: pointer;
  }
  .botoes button:disabled { color: var(--color-neutral-700); cursor: default; }
  .passo { font-size: 15px; }
  .fechar { border-color: var(--color-neutral-100); font-weight: 700; }

  .palco { min-width: 0; }
  .palco:focus-visible { outline: 2px solid var(--color-accent-500); outline-offset: -2px; }
  .visor.aberto .palco {
    flex: 1;
    overflow: auto;
    overscroll-behavior: contain;
    padding: 12px;
    box-sizing: border-box;
    cursor: grab;
    /* Ajustada à tela, a folha deixava meia tela preta embaixo. Centrar é
       `safe` de propósito: com a folha maior que o painel, o centramento
       comum empurra o topo para fora do alcance da rolagem. */
    display: flex;
    align-items: safe center;
    justify-content: safe center;
  }
  .visor.aberto .palco :global(.prancha) { flex: 0 0 auto; max-width: 100%; }
  /* A folha assume a largura escolhida; o `width: 100%` que ela usa na
     página é justamente o que precisa sair do caminho aqui. */
  .visor.aberto .palco :global(.prancha) :global(svg) {
    width: var(--folha);
    max-width: none;
    height: auto;
  }
  /* A legenda é texto da página, não da prancha: dentro do visor ela só
     ocuparia altura. O mesmo vale para o que a folha traz marcado como texto
     de página — no visor, ele viria em 1200 px de largura, que é a única
     largura em que texto não se lê num telefone. */
  .visor.aberto .palco :global(figcaption),
  .visor.aberto .palco :global([data-fora-do-visor]) { display: none; }

  .rodape {
    margin: 0;
    padding: 8px 12px 10px;
    border-top: 1px solid var(--color-neutral-800);
    font-family: var(--font-tecnica);
    font-size: 10.5px;
    letter-spacing: 0.05em;
    color: var(--color-neutral-500);
  }
  /* O arrasto é do mouse; no toque a rolagem é nativa e o aviso mente. */
  @media (pointer: coarse) {
    .rodape { display: none; }
  }
</style>
