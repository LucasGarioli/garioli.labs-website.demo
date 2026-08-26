<script>
  import Nav from '$lib/Nav.svelte';
  import Footer from '$lib/Footer.svelte';
  import { stats, servicos, processo, produtos } from '$lib/content.js';
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

<div id="produtos" class="rule" style="padding:76px 48px">
  <div style="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px">
    {#each produtos as p}
      <div style="border:2px solid var(--color-text);padding:34px 36px;display:flex;flex-direction:column;gap:14px">
        <span class="label" style="color:var(--color-accent-700);letter-spacing:0.14em">{p.tag}</span>
        <span class="display" style="font-size:26px;font-weight:700;line-height:1.1;letter-spacing:-0.025em">{p.t}</span>
        <span style="font-size:14.5px;line-height:1.6;color:var(--color-neutral-700)">{p.d}</span>
        <a href={p.href} style="font-size:11.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;margin-top:8px">{p.cta} →</a>
      </div>
    {/each}
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
