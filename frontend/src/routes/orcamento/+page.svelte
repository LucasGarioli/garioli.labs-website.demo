<script>
  import { api } from '$lib/api.js';

  const CAMPOS = [
    { k: 'nome', label: 'Seu nome', ph: 'Nome completo', span: 'span 1' },
    { k: 'org', label: 'Instituição ou empresa', ph: 'Opcional', span: 'span 1' },
    { k: 'email', label: 'E-mail', ph: 'nome@dominio.com', span: 'span 1' },
    { k: 'fone', label: 'WhatsApp', ph: '(00) 00000-0000', span: 'span 1' },
    { k: 'cidade', label: 'Cidade e estado', ph: 'Vila Nova, ES', span: 'span 2' }
  ];

  let schema = $state([]);
  let step = $state(0);
  let respostas = $state({});
  let contato = $state({});
  let criarConta = $state(true);
  let enviado = $state(null);
  let erro = $state('');

  $effect(() => {
    api.triagemSchema().then((s) => (schema = s)).catch((e) => (erro = e.message));
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
      .concat([{ i: total - 2, label: 'Contato', value: [contato.nome, contato.email, contato.cidade].filter(Boolean).join(' · ') || '—' }])
  );

  const ETAPAS = [
    { n: '01', t: 'Análise técnica da solicitação', d: 'Conferimos se as informações são suficientes ou se precisamos de fotos e medidas.' },
    { n: '02', t: 'Visita técnica ou reunião remota', d: 'Quando necessário, agendamos para medir e confirmar as premissas.' },
    { n: '03', t: 'Proposta com escopo e valores', d: 'Você recebe o documento completo, com prazo de validade de 15 dias.' },
    { n: '04', t: 'Aceite e contrato', d: 'Se aceitar, o contrato é gerado com os mesmos termos da proposta.' }
  ];
</script>

<svelte:head><title>Solicitar orçamento — Garioli Labs</title></svelte:head>

{#if enviado}
  <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:80px 40px">
    <div style="max-width:660px;width:100%">
      <div style="height:8px;background:var(--color-accent-600);width:80px;margin-bottom:32px"></div>
      <div class="kicker" style="margin-bottom:14px">Solicitação recebida</div>
      <h1 class="display" style="font-size:42px;line-height:1.05;margin:0 0 18px">Recebemos sua solicitação</h1>
      <p style="font-size:16px;line-height:1.65;color:var(--color-neutral-800);margin:0 0 32px;text-wrap:pretty">
        Protocolo <strong>{enviado.protocolo}</strong>. Um engenheiro analisa as informações e retorna em até
        2 dias úteis. Se o escopo for viável, você recebe a proposta com escopo, prazos e valores por e-mail.
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
        Acesse <a href="/conta" style="color:var(--color-accent-400)">sua conta</a> para acompanhar esta
        solicitação, seus cursos e suas licenças no mesmo lugar.
      </div>
    </div>
  </div>
{:else if q}
  <div style="min-height:100vh;display:grid;grid-template-columns:300px minmax(0,1fr)">
    <div style="background:var(--color-neutral-900);color:var(--color-neutral-100);padding:40px 32px;display:flex;flex-direction:column;gap:36px">
      <div>
        <div class="display" style="font-size:18px">GARIOLI LABS</div>
        <div style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:var(--color-neutral-500);margin-top:6px">Engenharia acústica e audiovisual</div>
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
        Nenhum valor é calculado aqui. Sua solicitação é analisada por um engenheiro antes de virar proposta.
      </div>
    </div>

    <div style="display:flex;flex-direction:column">
      <div style="height:4px;background:var(--color-neutral-300)">
        <div style="height:4px;background:var(--color-accent-600);width:{Math.round((step / Math.max(1, total - 1)) * 100)}%"></div>
      </div>

      <div style="flex:1;padding:52px 56px 32px;max-width:760px;margin:0 auto;width:100%;box-sizing:border-box">
        <div class="kicker" style="margin-bottom:14px">Pergunta {step + 1} de {total}</div>
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
                  <span style="font-size:15.5px;font-weight:600">{o.val}</span>
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
              <span style="font-size:15.5px;font-weight:600">Criar minha conta Garioli Labs</span>
              <span style="font-size:13px;line-height:1.5;color:var(--color-neutral-700)">Acompanhe esta solicitação, cursos e licenças no mesmo login. Já tem conta? <a href="/conta">Entrar</a> — a solicitação será vinculada a ela.</span>
            </span>
          </button>
        {:else}
          <div style="border:2px solid var(--color-divider);background:var(--color-surface)">
            {#each resumo as r}
              <div class="row" style="display:grid;grid-template-columns:200px minmax(0,1fr) auto;gap:18px;align-items:baseline;padding:14px 20px">
                <span class="label">{r.label}</span>
                <span style="font-size:14.5px;line-height:1.5;font-weight:500">{r.value}</span>
                <button type="button" onclick={() => (step = r.i)} style="font-family:var(--font-body);font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;background:transparent;border:0;cursor:pointer;color:var(--color-accent-700);padding:0">Alterar</button>
              </div>
            {/each}
          </div>
          <p style="font-size:13px;line-height:1.6;color:var(--color-neutral-700);margin:20px 0 0;max-width:60ch">
            Ao enviar, você não assume nenhum compromisso e nenhum valor é gerado automaticamente.
            Analisamos as informações e, se o projeto for viável, você recebe uma proposta com escopo e valores.
          </p>
        {/if}

        {#if erro}<p style="color:var(--color-accent-700);font-size:13.5px;margin-top:18px">{erro}</p>{/if}
      </div>

      <div style="display:flex;align-items:center;gap:20px;padding:20px 56px;border-top:2px solid var(--color-divider);max-width:760px;margin:0 auto;width:100%;box-sizing:border-box">
        <button type="button" onclick={() => (step = Math.max(0, step - 1))} style="font-family:var(--font-body);font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:600;background:transparent;border:0;padding:12px 0;cursor:pointer;color:var(--color-neutral-700);visibility:{step === 0 ? 'hidden' : 'visible'}">← Voltar</button>
        <span style="flex:1"></span>
        {#if !respondido}
          <span style="font-size:12.5px;color:var(--color-neutral-600)">{q.kind === 'contato' ? 'Nome e e-mail são obrigatórios' : q.multi ? 'Marque ao menos uma opção' : 'Escolha uma opção'}</span>
        {/if}
        <button class="btn-solid" type="button" disabled={!respondido} onclick={avancar}>
          {step === total - 1 ? 'Enviar solicitação' : 'Continuar'}
        </button>
      </div>
    </div>
  </div>
{:else}
  <div style="padding:80px 48px;font-size:14px;color:var(--color-neutral-700)">Carregando triagem…</div>
{/if}
