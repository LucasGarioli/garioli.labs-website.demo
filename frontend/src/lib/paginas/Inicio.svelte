<script>
  /// A home inteira, em um idioma só — qual deles vem por `lang`.
  ///
  /// As rotas `/` e `/en` são duas linhas cada, apontando para cá. Não há
  /// bifurcação por idioma no meio do markup: o componente lê o objeto de
  /// textos que recebeu e desenha sempre a mesma página.
  import Nav from '$lib/Nav.svelte';
  import Seo from '$lib/Seo.svelte';
  import AntesDepois from '$lib/desenhos/AntesDepois.svelte';
  import PlantaBaixa from '$lib/desenhos/PlantaBaixa.svelte';
  import CorteLongitudinal from '$lib/desenhos/CorteLongitudinal.svelte';
  import Axonometria from '$lib/desenhos/Axonometria.svelte';
  import MapaCobertura from '$lib/desenhos/MapaCobertura.svelte';
  import FolhaResultados from '$lib/desenhos/FolhaResultados.svelte';
  import ModeloInterativo from '$lib/desenhos/ModeloInterativo.svelte';
  import LegendaTecnica from '$lib/desenhos/LegendaTecnica.svelte';
  import VisorPrancha from '$lib/desenhos/VisorPrancha.svelte';
  import Footer from '$lib/Footer.svelte';
  import { empresa } from '$lib/identidade.js';
  import { rota, textos } from '$lib/conteudo/index.js';
  import { rotulos } from '$lib/desenhos/rotulos.js';
  import { inicio } from '$lib/seo.js';

  let { lang = 'pt' } = $props();
  const t = $derived(textos(lang));
  /// O glossário das pranchas mora com os rótulos delas, não com o texto
  /// da página: quem edita a prancha edita o verbete no mesmo arquivo.
  const rv = $derived(rotulos(lang).visor);
  const g = $derived(rotulos(lang).glossario);
</script>

<Seo
  {lang}
  caminho="/"
  titulo={t.meta.titulo}
  descricao={t.meta.descricao}
  palavras={t.meta.palavras}
  jsonld={inicio(t)} />

<Nav {lang} />

<div class="rule faixa faixa-hero">
  <div class="dentro">
    <div style="height:8px;width:96px;background:var(--color-accent-600);margin-bottom:34px"></div>
    <h1 class="display h1-hero">{t.hero.titulo}</h1>
    <p style="font-size:19px;line-height:1.55;color:var(--color-neutral-800);margin:0 0 38px;max-width:58ch;text-wrap:pretty">
      {t.hero.sub}
    </p>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <a class="btn-solid" href={rota('/orcamento', lang)}>{t.hero.cta}</a>
      <a class="btn-outline" href="#processo">{t.hero.ctaSecundario}</a>
    </div>
  </div>
</div>

<!-- O comparador vem logo abaixo da chamada, de ponta a ponta: é a primeira
     coisa que o visitante vê depois de ler o que a casa faz. -->
<AntesDepois {lang} />

<div class="rule">
  <div class="dentro stats">
    {#each t.stats as s}
      <div style="padding:28px 30px;border-right:1px solid var(--color-divider);display:flex;flex-direction:column;gap:6px">
        <span class="display" style="font-size:32px">{s.v}</span>
        <span style="font-size:12.5px;line-height:1.45;color:var(--color-neutral-700)">{s.t}</span>
      </div>
    {/each}
  </div>
</div>

<div id="servicos" class="rule faixa">
  <div class="dentro">
    <div class="kicker" style="margin-bottom:14px">{t.servicos.kicker}</div>
    <h2 class="display h2-faixa" style="max-width:20ch">{t.servicos.titulo}</h2>
    <div class="grade-3 topo-forte">
      {#each t.servicos.itens as s}
        <div class="row" style="padding:28px 30px 32px 0;display:flex;flex-direction:column;gap:10px">
          <span class="display" style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:var(--color-accent-700)">{s.n}</span>
          <span class="display" style="font-size:20px;font-weight:700;line-height:1.15;letter-spacing:-0.02em">{s.t}</span>
          <span style="font-size:14px;line-height:1.6;color:var(--color-neutral-700);max-width:34ch">{s.d}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<div id="processo" class="rule faixa clara">
  <div class="dentro">
    <div class="kicker" style="margin-bottom:14px">{t.processo.kicker}</div>
    <h2 class="display h2-faixa" style="max-width:22ch">{t.processo.titulo}</h2>
    <div class="grade-5">
      {#each t.processo.itens as p}
        <div style="display:flex;flex-direction:column;gap:11px;border-top:3px solid var(--color-text);padding-top:14px">
          <span class="display" style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:var(--color-accent-700)">{p.n}</span>
          <span style="font-size:16px;font-weight:700;line-height:1.2">{p.t}</span>
          <span style="font-size:13.5px;line-height:1.55;color:var(--color-neutral-700)">{p.d}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- Estudo de caso. Banda escura de propósito: é o único momento da página em
     que o site fala de resultado medido, e ele precisa parar a rolagem. -->
<section id="caso" class="caso">
  <div class="dentro dentro-caso">
    <div class="kicker" style="color:var(--color-accent-400);margin-bottom:14px">{t.caso.kicker}</div>
    <h2 class="display titulo-caso">{t.caso.titulo}</h2>
    <p class="resumo-caso">{t.caso.resumo}</p>

    <div class="numeros">
      {#each t.caso.numeros as n}
        <div class="numero">
          <span class="display valor">{n.v}</span>
          <span class="rotulo">{n.t}</span>
        </div>
      {/each}
    </div>

    <div class="colunas-caso">
      <div>
        <div class="label rotulo-bloco">{t.caso.salaRotulo}</div>
        <dl class="ficha">
          {#each t.caso.sala as d}
            <div class="linha-ficha">
              <dt>{d.k}</dt>
              <dd>{d.v}</dd>
            </div>
          {/each}
        </dl>
      </div>

      <div>
        <div class="label rotulo-bloco">{t.caso.analisesRotulo}</div>
        {#each t.caso.analises as a}
          <div class="analise">
            <span class="norma">{a.norma}</span>
            <span class="analise-t">{a.t}</span>
            <span class="analise-d">{a.d}</span>
          </div>
        {/each}
      </div>
    </div>

  </div>

  <!-- As pranchas saem da coluna de texto e ocupam a página inteira: elas são
       desenho de engenharia, e desenho pequeno não se lê. O que continua na
       coluna é o que é texto — a legenda da figura e o glossário. -->
  <div class="pranchas">
    <div class="dentro dentro-caso">
      <div class="label rotulo-bloco cabeca-pranchas">{t.caso.pranchasRotulo}</div>
    </div>

    <div class="bloco-prancha">
      <VisorPrancha nome={rv.nomes.planta} {lang}>
        <PlantaBaixa {lang} />
      </VisorPrancha>
      <div class="dentro dentro-caso">
        <LegendaTecnica titulo={g.titulo} termos={g.planta} />
      </div>
    </div>

    <div class="bloco-prancha">
      <VisorPrancha nome={rv.nomes.corte} {lang}>
        <CorteLongitudinal {lang} />
      </VisorPrancha>
      <div class="dentro dentro-caso">
        <LegendaTecnica titulo={g.titulo} termos={g.corte} />
      </div>
    </div>

    <div class="bloco-prancha">
      <VisorPrancha nome={rv.nomes.axo} {lang}>
        <Axonometria {lang} />
      </VisorPrancha>
      <div class="dentro dentro-caso">
        <LegendaTecnica titulo={g.titulo} termos={g.axo} />
      </div>
    </div>

    <div class="bloco-prancha">
      <VisorPrancha nome={rv.nomes.mapa} {lang}>
        <MapaCobertura {lang} />
      </VisorPrancha>
      <div class="dentro dentro-caso">
        <LegendaTecnica titulo={g.titulo} termos={g.mapa} />
      </div>
    </div>

    <div class="bloco-prancha">
      <VisorPrancha nome={rv.nomes.resultados} {lang}>
        <FolhaResultados {lang} />
      </VisorPrancha>
      <div class="dentro dentro-caso">
        <LegendaTecnica titulo={g.titulo} termos={g.resultados} />
      </div>
    </div>

    <div class="bloco-prancha">
      <ModeloInterativo {lang} />
    </div>
  </div>

  <div class="dentro dentro-caso">
    <p class="nota-caso">{t.caso.nota}</p>
  </div>
</section>

<div class="rule faixa">
  <div class="dentro">
    <div class="kicker" style="margin-bottom:14px">{t.entregas.kicker}</div>
    <h2 class="display h2-faixa" style="max-width:24ch">{t.entregas.titulo}</h2>
    <div class="grade-4">
      {#each t.entregas.itens as e}
        <div style="border-top:3px solid var(--color-text);padding-top:14px;display:flex;flex-direction:column;gap:10px">
          <span class="label" style="color:var(--color-accent-700)">{e.tipo}</span>
          <span style="font-size:17px;font-weight:700;line-height:1.2">{e.t}</span>
          <span style="font-size:13.5px;line-height:1.55;color:var(--color-neutral-700)">{e.d}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<div id="software" class="rule faixa clara">
  <div class="dentro">
    <div class="kicker" style="margin-bottom:14px">{t.software.kicker}</div>
    <h2 class="display h2-faixa" style="max-width:24ch;margin-bottom:16px">{t.software.titulo}</h2>
    <p style="font-size:16px;line-height:1.6;color:var(--color-neutral-800);margin:0 0 42px;max-width:62ch">
      {t.software.sub}
    </p>
    <div class="grade-3 vao-22">
      {#each t.software.itens as s}
        <div style="border:2px solid var(--color-text);padding:28px 30px;display:flex;flex-direction:column;gap:12px">
          <span class="display" style="font-size:24px;font-weight:700;line-height:1.1;letter-spacing:-0.025em">{s.nome}</span>
          <span class="estado">{s.estado}</span>
          <span style="font-size:14px;line-height:1.6;color:var(--color-neutral-700)">{s.d}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<div id="ensino" class="rule faixa">
  <div class="dentro">
    <div class="kicker" style="margin-bottom:14px">{t.ensino.kicker}</div>
    <h2 class="display h2-faixa" style="max-width:22ch;margin-bottom:16px">{t.ensino.titulo}</h2>
    <p style="font-size:16px;line-height:1.6;color:var(--color-neutral-800);margin:0 0 42px;max-width:56ch">{t.ensino.sub}</p>
    <div class="grade-3 vao-22" style="margin-bottom:34px">
      {#each t.ensino.itens as e}
        <div style="border-top:3px solid var(--color-text);padding-top:14px;display:flex;flex-direction:column;gap:10px">
          <span class="label" style="color:var(--color-accent-700)">{e.tipo}</span>
          <span style="font-size:17px;font-weight:700;line-height:1.2">{e.t}</span>
          <span style="font-size:13.5px;line-height:1.55;color:var(--color-neutral-700)">{e.d}</span>
        </div>
      {/each}
    </div>
    <a class="btn-outline" href={rota('/entrar', lang)}>{t.ensino.cta}</a>
  </div>
</div>

<div id="sobre" class="rule faixa clara">
  <div class="dentro sobre">
    <div>
      <div class="kicker" style="margin-bottom:14px">{t.sobre.kicker}</div>
      <h2 class="display h2-faixa" style="max-width:16ch;margin-bottom:26px">{t.sobre.titulo}</h2>
      {#each t.sobre.paragrafos as p}
        <p style="font-size:16px;line-height:1.65;color:var(--color-neutral-800);margin:0 0 18px;max-width:56ch">{p}</p>
      {/each}

      <!-- A independência é o argumento comercial mais forte da página; fica
           destacada em vez de diluída num parágrafo. -->
      <p class="independencia">{t.sobre.independencia}</p>

      <div style="margin-top:26px">
        <div style="font-size:16px;font-weight:700">{empresa.responsavel}</div>
        <div style="font-size:13px;color:var(--color-neutral-700);margin-top:3px">{t.sobre.papelResponsavel}</div>
        <div style="font-size:13px;color:var(--color-neutral-700);margin-top:3px">{t.sobre.formacao}</div>
      </div>
    </div>

    <div>
      <div class="label rotulo-bloco" style="color:var(--color-neutral-700)">{t.sobre.trajetoriaRotulo}</div>
      {#each t.sobre.marcos as m}
        <div class="marco">
          <span class="marco-quando">{m.quando}</span>
          <span class="marco-o-que">{m.o_que}</span>
        </div>
      {/each}
      <div class="label rotulo-bloco" style="color:var(--color-neutral-700);margin-top:30px">{t.sobre.especialidadesRotulo}</div>
      {#each t.sobre.especialidades as e}
        <div class="especialidade">{e}</div>
      {/each}
      <div style="font-size:12.5px;line-height:1.55;color:var(--color-neutral-700);margin-top:22px">{t.sobre.atuacao}</div>
    </div>
  </div>
</div>

<div id="duvidas" class="rule faixa">
  <div class="dentro">
    <div class="kicker" style="margin-bottom:14px">{t.duvidas.kicker}</div>
    <h2 class="display h2-faixa" style="max-width:20ch;margin-bottom:34px">{t.duvidas.titulo}</h2>
    <div style="max-width:860px">
    {#each t.duvidas.itens as d}
      <details class="duvida">
        <summary>
          <span>{d.p}</span>
          <span class="sinal" aria-hidden="true"></span>
        </summary>
        <p>{d.r}</p>
      </details>
    {/each}
    </div>
  </div>
</div>

<div class="faixa chamada">
  <div class="dentro">
    <h2 class="display h2-chamada">{t.chamada.titulo}</h2>
    <p style="font-size:17px;line-height:1.6;margin:0 0 34px;max-width:54ch;opacity:0.92">
      {t.chamada.sub}
    </p>
    <a href={rota('/orcamento', lang)} style="display:inline-block;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;padding:17px 34px;background:var(--color-neutral-900);color:var(--color-neutral-100);text-decoration:none">{t.chamada.cta}</a>
  </div>
</div>

<Footer {lang} />

<style>
  /* — estudo de caso — */
  .caso {
    background: var(--color-text);
    color: var(--color-neutral-100);
    /* Sem respiro lateral na seção: quem o dá agora é a coluna de texto, para
       que a prancha possa encostar nas duas bordas da janela. */
    padding: 84px 0;
  }
  /* A mesma largura útil das outras faixas (1180 px), só que o respiro vem de
     dentro — assim a coluna e as faixas de cima continuam alinhadas. */
  .dentro-caso {
    max-width: calc(1180px + 96px);
    padding: 0 48px;
    box-sizing: border-box;
  }
  .dentro { max-width: 1180px; margin: 0 auto; }

  /* — casca das faixas —
     Tudo isto era estilo inline, que nao aceita media query: a pagina inteira
     mantinha quatro e cinco colunas em 390 px e empurrava a barra horizontal. */
  .faixa { padding: 76px 48px; }
  .faixa-hero { padding: 88px 48px 72px; }
  .clara { background: var(--color-surface); }
  .chamada {
    background: var(--color-accent-600);
    color: var(--color-neutral-100);
    padding: 84px 48px;
  }
  .h1-hero {
    /* A manchete afirma uma coisa inteira, entao ela e' longa: 18ch a punham
       em cinco linhas. Tres linhas cheias leem como paragrafo curto, que e'
       o que ela e'. */
    font-size: 58px;
    line-height: 1;
    letter-spacing: -0.035em;
    margin: 0 0 26px;
    max-width: 24ch;
    text-wrap: pretty;
  }
  .h2-faixa { font-size: 40px; line-height: 1.05; margin: 0 0 42px; }
  .h2-chamada {
    font-size: 52px;
    line-height: 1.02;
    letter-spacing: -0.035em;
    margin: 0 0 22px;
    max-width: 20ch;
    text-wrap: pretty;
  }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); }
  .grade-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .grade-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 22px; }
  .grade-5 { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 18px; }
  .vao-22 { gap: 22px; }
  .topo-forte { border-top: 2px solid var(--color-text); }
  .sobre {
    display: grid;
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
    gap: 56px;
  }
  .titulo-caso {
    font-size: 40px;
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0 0 20px;
    max-width: 22ch;
    text-wrap: pretty;
  }
  .resumo-caso {
    font-size: 16.5px;
    line-height: 1.65;
    color: var(--color-neutral-400);
    margin: 0 0 44px;
    max-width: 62ch;
    text-wrap: pretty;
  }

  .pranchas {
    margin-top: 68px;
    display: flex;
    flex-direction: column;
    gap: 76px;
  }
  .bloco-prancha { display: flex; flex-direction: column; }
  /* A legenda da figura é texto, e texto largo não se lê: ela volta para a
     coluna mesmo com o desenho ocupando a janela inteira. */
  .bloco-prancha :global(figcaption) {
    max-width: calc(1180px + 96px);
    margin: 16px auto 0;
    padding: 0 48px;
    box-sizing: border-box;
  }
  .cabeca-pranchas { color: var(--color-neutral-600); margin-bottom: -34px; }

  .numeros {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    border-top: 2px solid var(--color-neutral-700);
    border-bottom: 1px solid var(--color-neutral-800);
  }
  .numero {
    display: flex;
    flex-direction: column;
    gap: 7px;
    padding: 24px 24px 26px 0;
    border-right: 1px solid var(--color-neutral-800);
  }
  .numero:last-child { border-right: 0; }
  .valor { font-size: 30px; letter-spacing: -0.02em; }
  .rotulo {
    font-size: 12px;
    line-height: 1.45;
    color: var(--color-neutral-400);
  }

  .colunas-caso {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.4fr);
    gap: 56px;
    margin-top: 46px;
  }
  .rotulo-bloco {
    color: var(--color-accent-400);
    margin-bottom: 16px;
    display: block;
  }

  .ficha { margin: 0; }
  .linha-ficha {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 11px 0;
    border-bottom: 1px solid var(--color-neutral-800);
  }
  .linha-ficha dt { font-size: 13px; color: var(--color-neutral-400); }
  .linha-ficha dd { margin: 0; font-size: 13.5px; font-weight: 600; }

  .analise {
    display: grid;
    grid-template-columns: 132px minmax(0, 1fr);
    gap: 4px 20px;
    padding: 16px 0;
    border-bottom: 1px solid var(--color-neutral-800);
  }
  .norma {
    grid-row: span 2;
    font-family: var(--font-body);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-accent-400);
    padding-top: 2px;
  }
  .analise-t { font-size: 15.5px; font-weight: 700; }
  .analise-d { font-size: 13.5px; line-height: 1.55; color: var(--color-neutral-400); }

  .nota-caso {
    margin: 30px 0 0;
    font-size: 12.5px;
    color: var(--color-neutral-500);
    border-left: 2px solid var(--color-accent);
    padding-left: 14px;
  }

  /* — software — */
  .estado {
    align-self: flex-start;
    font-family: var(--font-body);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    background: var(--color-text);
    color: var(--color-neutral-100);
    padding: 4px 10px;
  }

  /* — sobre — */
  .independencia {
    font-size: 15.5px;
    line-height: 1.6;
    margin: 26px 0 0;
    max-width: 56ch;
    border-left: 3px solid var(--color-accent);
    padding-left: 18px;
    font-weight: 600;
  }
  .marco {
    display: grid;
    grid-template-columns: 92px minmax(0, 1fr);
    gap: 14px;
    padding: 13px 0;
    border-bottom: 1px solid var(--color-divider);
  }
  .especialidade {
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--color-neutral-800);
    padding: 9px 0 9px 15px;
    border-left: 2px solid var(--color-accent-600);
    margin-bottom: 2px;
  }

  .marco-quando {
    font-family: var(--font-body);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--color-accent-700);
    padding-top: 2px;
  }
  .marco-o-que { font-size: 14px; line-height: 1.5; }

  /* — dúvidas — */
  .duvida { border-bottom: 1px solid var(--color-divider); }
  .duvida:first-of-type { border-top: 2px solid var(--color-text); }
  .duvida summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 0;
    cursor: pointer;
    font-size: 17px;
    font-weight: 600;
    line-height: 1.35;
    list-style: none;
  }
  .duvida summary::-webkit-details-marker { display: none; }
  .duvida summary:hover { color: var(--color-accent-700); }

  /* Cruz que vira traço quando abre — sem depender de fonte de ícone. */
  .sinal {
    position: relative;
    flex: 0 0 auto;
    width: 14px;
    height: 14px;
  }
  .sinal::before,
  .sinal::after {
    content: '';
    position: absolute;
    background: var(--color-accent);
    transition: transform 0.25s ease;
  }
  .sinal::before { top: 6px; left: 0; width: 14px; height: 2px; }
  .sinal::after { top: 0; left: 6px; width: 2px; height: 14px; }
  .duvida[open] .sinal::after { transform: scaleY(0); }

  .duvida p {
    margin: 0 0 22px;
    font-size: 15px;
    line-height: 1.65;
    color: var(--color-neutral-800);
    max-width: 68ch;
  }

  @media (prefers-reduced-motion: reduce) {
    .sinal::before, .sinal::after { transition: none; }
  }

  @media (max-width: 1080px) {
    .faixa { padding: 60px 32px; }
    .faixa-hero { padding: 66px 32px 54px; }
    .chamada { padding: 66px 32px; }
    .h1-hero { font-size: 44px; }
    .h2-faixa { font-size: 32px; margin-bottom: 32px; }
    .h2-chamada { font-size: 40px; }
    .grade-5 { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
    .grade-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .sobre { grid-template-columns: minmax(0, 1fr); gap: 34px; }
    .caso { padding: 60px 0; }
    .dentro-caso { max-width: calc(1180px + 48px); padding: 0 24px; }
    .bloco-prancha :global(figcaption) {
      max-width: calc(1180px + 48px);
      padding: 0 24px;
    }
    .numeros { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .numero { padding-right: 18px; }
    .colunas-caso { grid-template-columns: minmax(0, 1fr); gap: 38px; }
    .analise { grid-template-columns: minmax(0, 1fr); }
    .norma { grid-row: auto; }
  }

  @media (max-width: 760px) {
    .faixa { padding: 48px 20px; }
    .faixa-hero { padding: 52px 20px 42px; }
    .chamada { padding: 54px 20px; }
    .caso { padding: 48px 0; }
    .dentro-caso { max-width: calc(1180px + 40px); padding: 0 20px; }
    .bloco-prancha :global(figcaption) {
      max-width: calc(1180px + 40px);
      padding: 0 20px;
    }
    .pranchas { gap: 56px; }
    .h1-hero { font-size: 38px; letter-spacing: -0.03em; }
    .h2-faixa { font-size: 27px; margin-bottom: 24px; }
    .h2-chamada { font-size: 31px; }
    /* Quatro numeros em 390 px dao 85 px de coluna, e o menor deles e' mais
       largo do que isso: era a quarta celula que abria a barra horizontal. */
    .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grade-3, .grade-4, .grade-5 { grid-template-columns: minmax(0, 1fr); }
    .numeros { grid-template-columns: minmax(0, 1fr); }
  }
</style>
