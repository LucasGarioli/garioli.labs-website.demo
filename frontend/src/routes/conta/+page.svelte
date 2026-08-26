<script>
  import { onMount } from 'svelte';
  import Nav from '$lib/Nav.svelte';
  import { goto } from '$app/navigation';
  import { api, exigeSessao } from '$lib/api.js';

  const TABS = [
    { id: 'projetos', label: 'Projetos' },
    { id: 'cursos', label: 'Cursos' },
    { id: 'licencas', label: 'Licenças' },
    { id: 'docs', label: 'Documentos' }
  ];

  const FASES = ['Solicitação', 'Proposta', 'Contrato', 'Levantamento', 'Projeto', 'Entrega'];

  let tab = $state('projetos');
  let conta = $state(null);
  let erro = $state('');

  onMount(() => {
    api
      .minhaConta()
      .then((c) => (conta = c))
      .catch((e) => {
        if (!exigeSessao(e, goto, '/conta')) erro = e.message;
      });
  });

  function barra(i, done) {
    if (i < done) return 'var(--color-accent-600)';
    if (i === done) return 'var(--color-accent-300)';
    return 'var(--color-neutral-300)';
  }
</script>

<svelte:head><title>Minha conta — Garioli Labs</title></svelte:head>

<Nav cta={false} />

<div class="rule" style="display:flex;align-items:center;gap:24px;padding:14px 40px;flex-wrap:wrap">
  {#each TABS as t}
    <button
      type="button"
      onclick={() => (tab = t.id)}
      style="font-family:var(--font-body);font-size:11.5px;letter-spacing:0.1em;text-transform:uppercase;font-weight:{tab === t.id ? 700 : 500};background:transparent;border:0;border-bottom:2px solid {tab === t.id ? 'var(--color-accent-600)' : 'transparent'};padding:6px 0;cursor:pointer;color:{tab === t.id ? 'var(--color-text)' : 'var(--color-neutral-600)'}"
    >{t.label}</button>
  {/each}
  <span style="flex:1"></span>
  {#if conta}
    <span style="display:flex;align-items:center;gap:10px">
      <span class="display" style="width:30px;height:30px;background:var(--color-neutral-900);color:var(--color-neutral-100);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700">{conta.iniciais}</span>
      <span style="font-size:13px;font-weight:600">{conta.nome}</span>
    </span>
  {/if}
</div>

{#if erro}
  <p style="padding:60px 40px;color:var(--color-accent-700)">{erro}</p>
{:else if !conta}
  <p style="padding:60px 40px;color:var(--color-neutral-700)">Carregando…</p>
{:else}
  <div style="padding:44px 40px 90px;max-width:1100px;margin:0 auto">
    {#if tab === 'projetos'}
      <div class="kicker" style="margin-bottom:12px">Meus projetos</div>
      <h1 class="display" style="font-size:36px;line-height:1.05;margin:0 0 34px">Acompanhe cada etapa</h1>

      {#each conta.projetos as p}
        <div style="border:2px solid var(--color-text);background:var(--color-surface);padding:28px 30px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:20px;flex-wrap:wrap;margin-bottom:6px">
            <span class="display" style="font-size:21px;font-weight:700;letter-spacing:-0.02em">{p.titulo}</span>
            <span style="font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;padding:5px 11px;background:{p.destaque ? 'var(--color-accent-600)' : 'var(--color-neutral-900)'};color:var(--color-neutral-100)">{p.status}</span>
          </div>
          <div style="font-size:13px;color:var(--color-neutral-700);margin-bottom:22px">{p.meta}</div>
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">
            {#each FASES as f, i}
              <div style="display:flex;flex-direction:column;gap:8px">
                <div style="height:6px;background:{barra(i, p.fase)}"></div>
                <span style="font-size:10.5px;line-height:1.35;color:{i <= p.fase ? 'var(--color-text)' : 'var(--color-neutral-600)'};font-weight:{i === p.fase ? 700 : 400}">{f}</span>
              </div>
            {/each}
          </div>
          <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-top:22px;padding-top:20px;border-top:1px solid var(--color-divider)">
            <a class="btn-solid" style="padding:12px 22px" href="/proposta?id={p.id}">{p.cta}</a>
            <span style="font-size:13px;color:var(--color-neutral-700)">{p.pendencia}</span>
          </div>
        </div>
      {/each}

      <div style="border:2px dashed var(--color-neutral-400);padding:26px 30px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap">
        <span style="font-size:14.5px;line-height:1.5;max-width:52ch">Precisa de outro projeto? A triagem leva cerca de três minutos e não gera compromisso.</span>
        <a class="btn-outline" href="/orcamento">Solicitar orçamento</a>
      </div>

    {:else if tab === 'cursos'}
      <div class="kicker" style="margin-bottom:12px">Meus cursos</div>
      <h1 class="display" style="font-size:36px;line-height:1.05;margin:0 0 34px">Continue de onde parou</h1>
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px">
        {#each conta.cursos as c}
          <div style="border:2px solid var(--color-divider);background:var(--color-surface);padding:24px 26px;display:flex;flex-direction:column;gap:12px">
            <span class="label" style="color:var(--color-accent-700);letter-spacing:0.12em">{c.tag}</span>
            <span class="display" style="font-size:19px;font-weight:700;line-height:1.15;letter-spacing:-0.02em">{c.titulo}</span>
            <span style="font-size:13.5px;line-height:1.55;color:var(--color-neutral-700)">{c.descricao}</span>
            <div style="height:6px;background:var(--color-neutral-300);margin-top:6px">
              <div style="height:6px;background:var(--color-accent-600);width:{c.progresso}%"></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:12.5px;color:var(--color-neutral-700)">
              <span>{c.situacao}</span>
              <a href="/conta" style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700">{c.cta}</a>
            </div>
          </div>
        {/each}
      </div>

    {:else if tab === 'licencas'}
      <div class="kicker" style="margin-bottom:12px">Minhas licenças</div>
      <h1 class="display" style="font-size:36px;line-height:1.05;margin:0 0 34px">Softwares e ferramentas</h1>
      <div style="border-top:2px solid var(--color-text)">
        {#each conta.licencas as l}
          <div class="row" style="display:grid;grid-template-columns:minmax(0,1fr) 220px 150px 110px;gap:20px;align-items:center;padding:18px 0">
            <span style="display:flex;flex-direction:column;gap:3px">
              <span style="font-size:15.5px;font-weight:600">{l.titulo}</span>
              <span style="font-size:12.5px;color:var(--color-neutral-700)">{l.descricao}</span>
            </span>
            <span class="display" style="font-size:13px;font-weight:600;letter-spacing:0.04em;color:var(--color-neutral-700)">{l.chave}</span>
            <span style="font-size:13px">{l.vencimento}</span>
            <span style="font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;padding:5px 10px;text-align:center;background:{l.ativa ? 'var(--color-neutral-900)' : 'var(--color-accent-600)'};color:var(--color-neutral-100)">{l.situacao}</span>
          </div>
        {/each}
      </div>

    {:else}
      <div class="kicker" style="margin-bottom:12px">Meus documentos</div>
      <h1 class="display" style="font-size:36px;line-height:1.05;margin:0 0 34px">Propostas, contratos e recibos</h1>
      <div style="border-top:2px solid var(--color-text)">
        {#each conta.documentos as d}
          <div class="row" style="display:grid;grid-template-columns:200px minmax(0,1fr) 130px 100px;gap:20px;align-items:center;padding:16px 0">
            <span class="label">{d.tipo}</span>
            <span style="font-size:14.5px;font-weight:500">{d.titulo}</span>
            <span style="font-size:13px;color:var(--color-neutral-700)">{d.data}</span>
            <a href={d.url} style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700">Baixar PDF</a>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}
