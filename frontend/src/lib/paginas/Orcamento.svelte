<script>
  import Seo from '$lib/Seo.svelte';
  import { api } from '$lib/api.js';
  import { rota, textos } from '$lib/conteudo/index.js';

  let { lang = 'pt' } = $props();
  const t = $derived(textos(lang).paginas.orcamento);
  const CAMPOS = $derived(t.campos);

  let schema = $state([]);
  let step = $state(0);
  let respostas = $state({});
  let contato = $state({});
  let criarConta = $state(true);
  let enviado = $state(null);
  let erro = $state('');

  // O questionário é servido no idioma da página: perguntas, dicas e rótulos
  // de opção vêm traduzidos da API, com as chaves de resposta inalteradas.
  $effect(() => {
    api.triagemSchema(lang).then((s) => (schema = s)).catch((e) => (erro = e.message));
  });

  const q = $derived(schema[step]);
  const total = $derived(schema.length);
  const respondido = $derived.by(() => {
    if (!q) return false;
    if (q.kind === 'contato') return !!(contato.nome && contato.email);
    if (q.kind === 'revisao') return true;
    const v = respostas[q.key];
    return q.multi ? Array.isArray(v) && v.length > 0 : !!v;
  });

  function marcar(val) {
    if (q.multi) {
      const cur = Array.isArray(respostas[q.key]) ? [...respostas[q.key]] : [];
      const i = cur.indexOf(val);
      if (i >= 0) cur.splice(i, 1);
      else cur.push(val);
      respostas = { ...respostas, [q.key]: cur };
    } else {
      respostas = { ...respostas, [q.key]: val };
      setTimeout(() => (step = Math.min(step + 1, total - 1)), 160);
    }
  }

  function marcado(val) {
    const v = respostas[q.key];
    return q.multi ? Array.isArray(v) && v.includes(val) : v === val;
  }

  async function avancar() {
    if (!respondido) return;
    if (step < total - 1) { step += 1; return; }
    try {
      enviado = await api.criarSolicitacao({ respostas, contato, criar_conta: criarConta });
    } catch (e) { erro = e.message; }
  }

  const resumo = $derived(
    schema
      .filter((x) => !x.kind)
      .map((x) => ({
        i: schema.indexOf(x),
        label: x.rail,
        value: Array.isArray(respostas[x.key]) ? respostas[x.key].join(' · ') : respostas[x.key] || '—'
      }))
      .concat([{ i: total - 2, label: t.contatoRotulo, value: [contato.nome, contato.email, contato.cidade].filter(Boolean).join(' · ') || '—' }])
  );

  const ETAPAS = $derived(t.recebido.etapas);
</script>

<Seo {lang} caminho="/orcamento" titulo={t.titulo} descricao={t.descricao} />

{#if enviado}
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:80px 40px">
    <div style="max-width:660px;width:100%">
      <a href={rota('/', lang)} class="display" title={textos(lang).nav.inicio}
           style="display:block;font-size:16px;color:inherit;text-decoration:none;margin-bottom:26px">GARIOLI LABS</a>
      <div style="height:8px;background:var(--color-accent-600);width:80px;margin-bottom:32px"></div>
      <div class="kicker" style="margin-bottom:14px">{t.recebido.kicker}</div>
      <h1 class="display" style="font-size:42px;line-height:1.05;margin:0 0 18px">{t.recebido.titulo}</h1>
      <p style="font-size:16px;line-height:1.65;color:var(--color-neutral-800);margin:0 0 32px;text-wrap:pretty">
        {t.recebido.texto[0]}<strong>{enviado.protocolo}</strong>{t.recebido.texto[1]}
      </p>
      <div style="border-top:2px solid var(--color-text)">
        {#each ETAPAS as e}
          <div class="row" style="display:grid;grid-template-columns:32px minmax(0,1fr);gap:18px;padding:16px 0">
            <span class="display" style="font-size:12px;font-weight:700;color:var(--color-accent-700)">{e.n}</span>
            <span style="display:flex;flex-direction:column;gap:4px">
              <span style="font-size:15px;font-weight:600">{e.t}</span>
              <span style="font-size:13.5px;line-height:1.55;color:var(--color-neutral-700)">{e.d}</span>
            </span>
          </div>
        {/each}
      </div>
      <div style="margin-top:34px;padding:22px 24px;background:var(--color-neutral-900);color:var(--color-neutral-200);font-size:13.5px;line-height:1.6">
        {t.recebido.conta[0]}<a href={rota('/conta', lang)} style="color:var(--color-accent-400)">{t.recebido.conta[1]}</a>{t.recebido.conta[2]}
      </div>
    </div>
  </div>
{:else if q}
  <div style="min-height:100vh;display:grid;grid-template-columns:300px minmax(0,1fr)">
    <div style="background:var(--color-neutral-900);color:var(--color-neutral-100);padding:40px 32px;display:flex;flex-direction:column;gap:36px">
      <div>
        <a href={rota('/', lang)} class="display" title={textos(lang).nav.inicio}
           style="font-size:18px;color:inherit;text-decoration:none">GARIOLI LABS</a>
        <div style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--color-neutral-500);margin-top:6px">{t.assinatura}</div>
      </div>
      <div style="display:flex;flex-direction:column">
        {#each schema as r, i}
          <div style="display:flex;gap:12px;align-items:baseline;padding:7px 0;font-size:12.5px;line-height:1.35;color:{i === step ? 'var(--color-neutral-100)' : i < step ? 'var(--color-neutral-400)' : 'var(--color-neutral-600)'}">
            <span class="display" style="font-size:10px;font-weight:700;letter-spacing:0.06em;min-width:20px;color:{i === step ? 'var(--color-accent-400)' : 'var(--color-neutral-600)'}">{String(i + 1).padStart(2, '0')}</span>
            <span>{r.rail}</span>
          </div>
        {/each}
      </div>
      <div style="margin-top:auto;font-size:11px;line-height:1.6;color:var(--color-neutral-500);border-top:1px solid var(--color-neutral-700);padding-top:18px">
        {t.notaLateral}
      </div>
    </div>

    <div style="display:flex;flex-direction:column">
      <div style="height:4px;background:var(--color-neutral-300)">
        <div style="height:4px;background:var(--color-accent-600);width:{Math.round((step / Math.max(1, total - 1)) * 100)}%"></div>
      </div>

      <div style="flex:1;padding:52px 56px 32px;max-width:760px;margin:0 auto;width:100%;box-sizing:border-box">
        <div class="kicker" style="margin-bottom:14px">{t.pergunta(step + 1, total)}</div>
        <h1 class="display" style="font-size:34px;line-height:1.08;letter-spacing:-0.025em;margin:0 0 12px;text-wrap:pretty">{q.title}</h1>
        <p style="font-size:14.5px;line-height:1.6;color:var(--color-neutral-700);margin:0 0 30px;max-width:56ch;text-wrap:pretty">{q.hint}</p>

        {#if !q.kind}
          <div style="display:flex;flex-direction:column;gap:10px">
            {#each q.options as o}
              <button
                type="button"
                onclick={() => marcar(o.val)}
                style="display:flex;gap:16px;align-items:flex-start;width:100%;text-align:left;padding:17px 20px;cursor:pointer;font-family:var(--font-body);background:{marcado(o.val) ? 'var(--color-accent-100)' : 'var(--color-surface)'};border:2px solid {marcado(o.val) ? 'var(--color-accent-600)' : 'var(--color-divider)'}"
              >
                <span style="width:18px;height:18px;flex:none;margin-top:2px;border:2px solid {marcado(o.val) ? 'var(--color-accent-600)' : 'var(--color-neutral-400)'};background:{marcado(o.val) ? 'var(--color-accent-600)' : 'transparent'}"></span>
                <span style="display:flex;flex-direction:column;gap:3px">
                  <span style="font-size:15.5px;font-weight:600">{o.label ?? o.val}</span>
                  {#if o.desc}<span style="font-size:13px;line-height:1.5;color:var(--color-neutral-700)">{o.desc}</span>{/if}
                </span>
              </button>
            {/each}
          </div>
        {:else if q.kind === 'contato'}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
            {#each CAMPOS as c}
              <label style="display:flex;flex-direction:column;gap:7px;grid-column:{c.span}">
                <span class="label" style="letter-spacing:0.14em">{c.label}</span>
                <input
                  type="text"
                  placeholder={c.ph}
                  bind:value={contato[c.k]}
                  style="font-size:15px;padding:13px 14px;border:2px solid var(--color-divider);background:var(--color-surface);color:var(--color-text);outline:none;font-family:var(--font-body)"
                />
              </label>
            {/each}
          </div>
          <button
            type="button"
            onclick={() => (criarConta = !criarConta)}
            style="display:flex;gap:14px;align-items:flex-start;width:100%;text-align:left;margin-top:22px;padding:17px 20px;cursor:pointer;font-family:var(--font-body);background:{criarConta ? 'var(--color-accent-100)' : 'var(--color-surface)'};border:2px solid {criarConta ? 'var(--color-accent-600)' : 'var(--color-divider)'}"
          >
            <span style="width:18px;height:18px;flex:none;margin-top:2px;border:2px solid {criarConta ? 'var(--color-accent-600)' : 'var(--color-neutral-400)'};background:{criarConta ? 'var(--color-accent-600)' : 'transparent'}"></span>
            <span style="display:flex;flex-direction:column;gap:3px">
              <span style="font-size:15.5px;font-weight:600">{t.criarConta.titulo}</span>
              <span style="font-size:13px;line-height:1.5;color:var(--color-neutral-700)">{t.criarConta.descricao[0]}<a href={rota('/conta', lang)}>{t.criarConta.descricao[1]}</a>{t.criarConta.descricao[2]}</span>
            </span>
          </button>
        {:else}
          <div style="border:2px solid var(--color-divider);background:var(--color-surface)">
            {#each resumo as r}
              <div class="row" style="display:grid;grid-template-columns:200px minmax(0,1fr) auto;gap:18px;align-items:baseline;padding:14px 20px">
                <span class="label">{r.label}</span>
                <span style="font-size:14.5px;line-height:1.5;font-weight:500">{r.value}</span>
                <button type="button" onclick={() => (step = r.i)} style="font-family:var(--font-body);font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;background:transparent;border:0;cursor:pointer;color:var(--color-accent-700);padding:0">{t.alterar}</button>
              </div>
            {/each}
          </div>
          <p style="font-size:13px;line-height:1.6;color:var(--color-neutral-700);margin:20px 0 0;max-width:60ch">
            {t.semCompromisso}
          </p>
        {/if}

        {#if erro}<p style="color:var(--color-accent-700);font-size:13.5px;margin-top:18px">{erro}</p>{/if}
      </div>

      <div style="display:flex;align-items:center;gap:20px;padding:20px 56px;border-top:2px solid var(--color-divider);max-width:760px;margin:0 auto;width:100%;box-sizing:border-box">
        <button type="button" onclick={() => (step = Math.max(0, step - 1))} style="font-family:var(--font-body);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;background:transparent;border:0;padding:12px 0;cursor:pointer;color:var(--color-neutral-700);visibility:{step === 0 ? 'hidden' : 'visible'}">{t.voltar}</button>
        <span style="flex:1"></span>
        {#if !respondido}
          <span style="font-size:12.5px;color:var(--color-neutral-600)">{q.kind === 'contato' ? t.faltando.contato : q.multi ? t.faltando.multi : t.faltando.unica}</span>
        {/if}
        <button class="btn-solid" type="button" disabled={!respondido} onclick={avancar}>
          {step === total - 1 ? t.enviarSolicitacao : t.continuar}
        </button>
      </div>
    </div>
  </div>
{:else}
  <div style="padding:80px 48px;font-size:14px;color:var(--color-neutral-700)">{t.carregando}</div>
{/if}
