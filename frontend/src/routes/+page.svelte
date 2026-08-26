<script>
  import Nav from '$lib/Nav.svelte';
  import Footer from '$lib/Footer.svelte';
  import {
    stats, servicos, processo, caso, entregas, softwares, ensino, sobre, duvidas, empresa
  } from '$lib/content.js';
</script>

<svelte:head><title>Garioli Labs — engenharia acústica e audiovisual</title></svelte:head>

<Nav />

<div class="rule" style="padding:88px 48px 72px">
  <div style="max-width:1180px;margin:0 auto">
    <div style="height:8px;width:96px;background:var(--color-accent-600);margin-bottom:34px"></div>
    <h1 class="display" style="font-size:68px;line-height:0.98;letter-spacing:-0.04em;margin:0 0 26px;max-width:18ch;text-wrap:pretty">Som que se entende. Luz que faz sentido.</h1>
    <p style="font-size:19px;line-height:1.55;color:var(--color-neutral-800);margin:0 0 38px;max-width:58ch;text-wrap:pretty">
      Projetos de acústica, sonorização, iluminação e vídeo para igrejas, auditórios e estúdios.
      Cálculo antes da compra — para você investir uma vez, no que resolve.
    </p>
    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <a class="btn-solid" href="/orcamento">Solicitar orçamento</a>
      <a class="btn-outline" href="#processo">Como funciona</a>
    </div>
  </div>
</div>

<div class="rule">
  <div style="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr)">
    {#each stats as s}
      <div style="padding:28px 30px;border-right:1px solid var(--color-divider);display:flex;flex-direction:column;gap:6px">
        <span class="display" style="font-size:32px">{s.v}</span>
        <span style="font-size:12.5px;line-height:1.45;color:var(--color-neutral-700)">{s.t}</span>
      </div>
    {/each}
  </div>
</div>

<div id="servicos" class="rule" style="padding:76px 48px">
  <div style="max-width:1180px;margin:0 auto">
    <div class="kicker" style="margin-bottom:14px">Serviços</div>
    <h2 class="display" style="font-size:40px;line-height:1.05;margin:0 0 42px;max-width:20ch">Engenharia aplicada ao que se ouve e se vê</h2>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:2px solid var(--color-text)">
      {#each servicos as s}
        <div class="row" style="padding:28px 30px 32px 0;display:flex;flex-direction:column;gap:10px">
          <span class="display" style="font-size:11px;font-weight:700;letter-spacing:0.08em;color:var(--color-accent-700)">{s.n}</span>
          <span class="display" style="font-size:20px;font-weight:700;line-height:1.15;letter-spacing:-0.02em">{s.t}</span>
          <span style="font-size:14px;line-height:1.6;color:var(--color-neutral-700);max-width:34ch">{s.d}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<div id="processo" class="rule" style="padding:76px 48px;background:var(--color-surface)">
  <div style="max-width:1180px;margin:0 auto">
    <div class="kicker" style="margin-bottom:14px">Processo</div>
    <h2 class="display" style="font-size:40px;line-height:1.05;margin:0 0 42px;max-width:22ch">Do primeiro contato à obra pronta</h2>
    <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:18px">
      {#each processo as p}
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
  <div class="dentro">
    <div class="kicker" style="color:var(--color-accent-400);margin-bottom:14px">Estudo de caso</div>
    <h2 class="display titulo-caso">{caso.titulo}</h2>
    <p class="resumo-caso">{caso.resumo}</p>

    <div class="numeros">
      {#each caso.numeros as n}
        <div class="numero">
          <span class="display valor">{n.v}</span>
          <span class="rotulo">{n.t}</span>
        </div>
      {/each}
    </div>

    <div class="colunas-caso">
      <div>
        <div class="label rotulo-bloco">A sala</div>
        <dl class="ficha">
          {#each caso.sala as d}
            <div class="linha-ficha">
              <dt>{d.k}</dt>
              <dd>{d.v}</dd>
            </div>
          {/each}
        </dl>
      </div>

      <div>
        <div class="label rotulo-bloco">Verificações que decidiram o projeto</div>
        {#each caso.analises as a}
          <div class="analise">
            <span class="norma">{a.norma}</span>
            <span class="analise-t">{a.t}</span>
            <span class="analise-d">{a.d}</span>
          </div>
        {/each}
      </div>
    </div>

    <p class="nota-caso">{caso.nota}</p>
  </div>
</section>

<div class="rule" style="padding:76px 48px">
  <div style="max-width:1180px;margin:0 auto">
    <div class="kicker" style="margin-bottom:14px">Entrega</div>
    <h2 class="display" style="font-size:40px;line-height:1.05;margin:0 0 42px;max-width:24ch">O projeto pronto — e o que fica com você</h2>
    <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px">
      {#each entregas as e}
        <div style="border-top:3px solid var(--color-text);padding-top:14px;display:flex;flex-direction:column;gap:10px">
          <span class="label" style="color:var(--color-accent-700)">{e.tipo}</span>
          <span style="font-size:17px;font-weight:700;line-height:1.2">{e.t}</span>
          <span style="font-size:13.5px;line-height:1.55;color:var(--color-neutral-700)">{e.d}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<div id="software" class="rule" style="padding:76px 48px;background:var(--color-surface)">
  <div style="max-width:1180px;margin:0 auto">
    <div class="kicker" style="margin-bottom:14px">Software</div>
    <h2 class="display" style="font-size:40px;line-height:1.05;margin:0 0 16px;max-width:24ch">Todo projeto difícil deixa uma ferramenta atrás de si</h2>
    <p style="font-size:16px;line-height:1.6;color:var(--color-neutral-800);margin:0 0 42px;max-width:62ch">
      O que começa como planilha de socorro num projeto real termina como programa.
      Cada software nasce de um problema que apareceu primeiro aqui dentro — e sai com
      documentação e licença próprias.
    </p>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px">
      {#each softwares as s}
        <div style="border:2px solid var(--color-text);padding:28px 30px;display:flex;flex-direction:column;gap:12px">
          <span class="display" style="font-size:24px;font-weight:700;line-height:1.1;letter-spacing:-0.025em">{s.nome}</span>
          <span class="estado">{s.estado}</span>
          <span style="font-size:14px;line-height:1.6;color:var(--color-neutral-700)">{s.d}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<div id="ensino" class="rule" style="padding:76px 48px">
  <div style="max-width:1180px;margin:0 auto">
    <div class="kicker" style="margin-bottom:14px">Ensino</div>
    <h2 class="display" style="font-size:40px;line-height:1.05;margin:0 0 16px;max-width:22ch">{ensino.titulo}</h2>
    <p style="font-size:16px;line-height:1.6;color:var(--color-neutral-800);margin:0 0 42px;max-width:56ch">{ensino.sub}</p>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-bottom:34px">
      {#each ensino.itens as e}
        <div style="border-top:3px solid var(--color-text);padding-top:14px;display:flex;flex-direction:column;gap:10px">
          <span class="label" style="color:var(--color-accent-700)">{e.tipo}</span>
          <span style="font-size:17px;font-weight:700;line-height:1.2">{e.t}</span>
          <span style="font-size:13.5px;line-height:1.55;color:var(--color-neutral-700)">{e.d}</span>
        </div>
      {/each}
    </div>
    <a class="btn-outline" href="/entrar">Criar minha conta</a>
  </div>
</div>

<div id="sobre" class="rule" style="padding:76px 48px;background:var(--color-surface)">
  <div style="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:56px">
    <div>
      <div class="kicker" style="margin-bottom:14px">Sobre</div>
      <h2 class="display" style="font-size:40px;line-height:1.05;margin:0 0 26px;max-width:16ch">{sobre.titulo}</h2>
      {#each sobre.paragrafos as p}
        <p style="font-size:16px;line-height:1.65;color:var(--color-neutral-800);margin:0 0 18px;max-width:56ch">{p}</p>
      {/each}

      <!-- A independência é o argumento comercial mais forte da página; fica
           destacada em vez de diluída num parágrafo. -->
      <p class="independencia">{sobre.independencia}</p>

      <div style="margin-top:26px">
        <div style="font-size:16px;font-weight:700">{empresa.fundador}</div>
        <div style="font-size:13px;color:var(--color-neutral-700);margin-top:3px">{empresa.papelFundador}</div>
      </div>
    </div>

    <div>
      <div class="label rotulo-bloco" style="color:var(--color-neutral-700)">Trajetória</div>
      {#each sobre.marcos as m}
        <div class="marco">
          <span class="marco-quando">{m.quando}</span>
          <span class="marco-o-que">{m.o_que}</span>
        </div>
      {/each}
      <div style="font-size:12.5px;line-height:1.55;color:var(--color-neutral-700);margin-top:22px">{empresa.atuacao}</div>
    </div>
  </div>
</div>

<div id="duvidas" class="rule" style="padding:76px 48px">
  <div style="max-width:1180px;margin:0 auto">
    <div class="kicker" style="margin-bottom:14px">Dúvidas</div>
    <h2 class="display" style="font-size:40px;line-height:1.05;margin:0 0 34px;max-width:20ch">O que perguntam antes de contratar</h2>
    <div style="max-width:860px">
    {#each duvidas as d}
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

<div style="background:var(--color-accent-600);color:var(--color-neutral-100);padding:84px 48px">
  <div style="max-width:1180px;margin:0 auto">
    <h2 class="display" style="font-size:52px;line-height:1.02;letter-spacing:-0.035em;margin:0 0 22px;max-width:20ch;text-wrap:pretty">Engenharia na base, propósito no centro, mensagem no fim.</h2>
    <p style="font-size:17px;line-height:1.6;margin:0 0 34px;max-width:54ch;opacity:0.92">
      Comece pela triagem: três minutos, sem compromisso e sem valor automático.
      Um engenheiro analisa e responde em até dois dias úteis.
    </p>
    <a href="/orcamento" style="display:inline-block;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;padding:17px 34px;background:var(--color-neutral-900);color:var(--color-neutral-100);text-decoration:none">Solicitar orçamento</a>
  </div>
</div>

<Footer />

<style>
  /* — estudo de caso — */
  .caso {
    background: var(--color-text);
    color: var(--color-neutral-100);
    padding: 84px 48px;
  }
  .dentro { max-width: 1180px; margin: 0 auto; }
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
    .caso { padding: 60px 24px; }
    .numeros { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .numero { padding-right: 18px; }
    .colunas-caso { grid-template-columns: minmax(0, 1fr); gap: 38px; }
    .analise { grid-template-columns: minmax(0, 1fr); }
    .norma { grid-row: auto; }
  }
</style>
