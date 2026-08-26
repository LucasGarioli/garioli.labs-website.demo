<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import Seo from '$lib/Seo.svelte';
  import { api, exigeSessao } from '$lib/api.js';
  import { rota, textos } from '$lib/conteudo/index.js';

  let { lang = 'pt' } = $props();
  const t = $derived(textos(lang).paginas.admin);
  const VIEWS = $derived(t.vistas);

  let view = $state('home');
  let resumo = $state(null);
  let logs = $state([]);
  let tributos = $state(null);
  let erro = $state('');
  let dono = $state(null);

  onMount(() => {
    api
      .adminResumo()
      .then((r) => (resumo = r))
      .catch((e) => {
        // 404 aqui não é rota errada: é a API dizendo que esta conta não é dona.
        if (exigeSessao(e, goto, rota('/admin', lang))) return;
        erro = e.status === 404 ? t.semAcesso : e.message;
      });
    api.auditoria().then((l) => (logs = l)).catch(() => {});
    api.impostos().then((t) => (tributos = t)).catch(() => {});
    api.eu().then((u) => (dono = u)).catch(() => {});
  });

  async function sair() {
    await api.sair().catch(() => {});
    goto(rota('/entrar', lang));
  }

  const atual = $derived(VIEWS.find((v) => v.id === view) ?? VIEWS[0]);

  // Textos com um trecho em negrito no meio: a tradução devolve as partes e a
  // marcação fica no markup.
  const mei = $derived(
    resumo
      ? t.notaMei(
          brl(resumo.financeiro.mei_faturado / 100),
          brl(resumo.financeiro.mei_limite / 100),
          resumo.financeiro.ano
        )
      : []
  );
  const fatorR = $derived(
    tributos
      ? t.notaFatorR(
          tributos.fator_r_minimo.toFixed(0),
          brl(tributos.pro_labore_sugerido_centavos / 100)
        )
      : []
  );

  // O faturamento é em real e os regimes são brasileiros: a moeda não muda
  // com o idioma da interface, só o separador de milhar acompanha a leitura.
  const brl = (n) => 'R$ ' + n.toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR');

  async function aprovar(id) {
    await api.aprovarSolicitacao(id);
    resumo = await api.adminResumo();
    logs = await api.auditoria();
  }
</script>

<Seo {lang} caminho="/admin" titulo={t.titulo} descricao={t.titulo} indexar={false} />

<div class="painel">
  <div class="barra">
    <div>
      <a href={rota('/', lang)} class="display" title={textos(lang).nav.inicio}
         style="font-size:16px;color:inherit;text-decoration:none">GARIOLI LABS</a>
      <div style="font-size:9.5px;letter-spacing:0.16em;text-transform:uppercase;color:var(--color-neutral-500);margin-top:5px">{t.rotulo}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:1px">
      {#each VIEWS as m}
        <button
          type="button"
          onclick={() => (view = m.id)}
          style="display:flex;align-items:center;gap:10px;text-align:left;font-family:var(--font-body);font-size:13px;font-weight:{view === m.id ? 700 : 500};background:{view === m.id ? 'var(--color-neutral-800)' : 'transparent'};border:0;border-left:3px solid {view === m.id ? 'var(--color-accent-600)' : 'transparent'};padding:11px 14px;cursor:pointer;color:{view === m.id ? 'var(--color-neutral-100)' : 'var(--color-neutral-400)'}"
        >
          <span style="flex:1">{m.label}</span>
        </button>
      {/each}
    </div>
    <div style="margin-top:auto;display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--color-neutral-700);padding-top:18px;font-size:11.5px">
      <a href={rota('/', lang)} style="color:var(--color-neutral-400)">{t.atalhos.site}</a>
      <a href={rota('/conta', lang)} style="color:var(--color-neutral-400)">{t.atalhos.cliente}</a>
      <a href={rota('/orcamento', lang)} style="color:var(--color-neutral-400)">{t.atalhos.triagem}</a>
      {#if dono}
        <div style="display:flex;align-items:center;gap:9px;margin-top:8px">
          <span class="display" style="width:26px;height:26px;background:var(--color-accent-600);color:var(--color-neutral-100);display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700">{dono.iniciais}</span>
          <span style="flex:1;font-size:11.5px;overflow-wrap:anywhere">{dono.email}</span>
        </div>
        <button
          type="button"
          onclick={sair}
          style="align-self:flex-start;font-family:var(--font-body);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;background:transparent;border:0;padding:0;cursor:pointer;color:var(--color-accent-400)"
        >{t.atalhos.sair}</button>
      {/if}
    </div>
  </div>

  <div class="conteudo">
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:20px;flex-wrap:wrap;margin-bottom:8px">
      <div class="kicker">{atual.kicker}</div>
      <div style="font-size:12.5px;color:var(--color-neutral-700)">{new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</div>
    </div>
    <h1 class="display" style="font-size:34px;line-height:1.05;margin:0 0 30px">{atual.titulo}</h1>

    {#if erro}
      <p style="color:var(--color-accent-700)">{erro}</p>
    {:else if !resumo}
      <p style="color:var(--color-neutral-700)">{t.carregando}</p>
    {:else if view === 'home'}
      <div class="faixa-4">
        {#each resumo.kpis as k}
          <div style="padding:22px 24px;border-right:1px solid var(--color-divider);display:flex;flex-direction:column;gap:6px">
            <span class="label" style="letter-spacing:0.14em;font-size:10px">{k.label}</span>
            <span class="display" style="font-size:28px;color:{k.alerta ? 'var(--color-accent-700)' : 'var(--color-text)'}">{k.valor}</span>
            <span style="font-size:12px;color:var(--color-neutral-700)">{k.sub}</span>
          </div>
        {/each}
      </div>
      <div class="label" style="letter-spacing:0.14em;border-bottom:2px solid var(--color-text);padding-bottom:8px">{t.exigeAcao}</div>
      {#each resumo.acoes as a}
        <div class="row tabela" style="--cols:8px 150px minmax(0,1fr) 130px 120px;gap:18px;align-items:center;padding:15px 0">
          <span style="width:8px;height:8px;background:{a.urgente ? 'var(--color-accent-600)' : 'var(--color-neutral-900)'}"></span>
          <span class="label">{a.tipo}</span>
          <span style="display:flex;flex-direction:column;gap:3px;min-width:0">
            <span style="font-size:14.5px;line-height:1.45">{a.texto}</span>
            {#if a.contato}
              <span style="font-size:12px;color:var(--color-neutral-600);overflow-wrap:anywhere">{a.contato}</span>
            {/if}
          </span>
          <span style="font-size:13px;color:{a.urgente ? 'var(--color-accent-700)' : 'var(--color-neutral-700)'};font-weight:{a.urgente ? 700 : 400}">{a.prazo}</span>
          {#if a.solicitacao_id}
            <button type="button" onclick={() => aprovar(a.solicitacao_id)} style="font-family:var(--font-body);font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;background:transparent;border:0;cursor:pointer;color:var(--color-accent-700);text-align:left;padding:0">{a.cta}</button>
          {:else}
            <span style="font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;color:var(--color-accent-700)">{a.cta}</span>
          {/if}
        </div>
      {/each}

    {:else if view === 'pipeline'}
      <div class="colunas-funil">
        {#each resumo.pipeline as col}
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="border-top:3px solid var(--color-text);padding-top:9px;display:flex;justify-content:space-between;align-items:baseline">
              <span style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700">{col.titulo}</span>
              <span style="font-size:11px;color:var(--color-neutral-700)">{col.cards.length}</span>
            </div>
            {#each col.cards as c}
              <div style="border:2px solid {c.parado ? 'var(--color-accent-600)' : 'var(--color-divider)'};background:var(--color-surface);padding:13px 14px;display:flex;flex-direction:column;gap:7px">
                <span style="font-size:13px;font-weight:600;line-height:1.3">{c.cliente}</span>
                {#if c.contato}
                  <span style="font-size:11px;color:var(--color-neutral-600);overflow-wrap:anywhere">{c.contato}</span>
                {/if}
                <span class="display" style="font-size:14px;font-weight:700;letter-spacing:-0.02em">{c.valor}</span>
                <span style="font-size:11px;color:{c.parado ? 'var(--color-accent-700)' : 'var(--color-neutral-700)'}">{c.idade}</span>
              </div>
            {/each}
          </div>
        {/each}
      </div>
      <p style="font-size:13px;line-height:1.6;color:var(--color-neutral-700);margin:28px 0 0;max-width:66ch">
        {t.notaPipeline}
      </p>

    {:else if view === 'financeiro'}
      <div class="faixa-3">
        {#each resumo.financeiro.kpis as k}
          <div style="padding:22px 24px;border-right:1px solid var(--color-divider);display:flex;flex-direction:column;gap:6px">
            <span class="label" style="letter-spacing:0.14em;font-size:10px">{k.label}</span>
            <span class="display" style="font-size:26px;color:{k.alerta ? 'var(--color-accent-700)' : 'var(--color-text)'}">{k.valor}</span>
            <span style="font-size:12px;color:var(--color-neutral-700)">{k.sub}</span>
          </div>
        {/each}
      </div>
      <div class="label" style="letter-spacing:0.14em;border-bottom:2px solid var(--color-text);padding-bottom:8px">{t.parcelas}</div>
      {#each resumo.financeiro.parcelas as p}
        <div class="row tabela" style="--cols:minmax(0,1fr) 110px 120px 120px 120px;gap:18px;align-items:center;padding:14px 0">
          <span style="font-size:14.5px">{p.cliente}</span>
          <span style="font-size:13px;color:var(--color-neutral-700)">{p.parcela}</span>
          <span class="display" style="font-size:14px;font-weight:700">{brl(p.valor_centavos / 100)}</span>
          <span style="font-size:13px">{p.vencimento}</span>
          <span style="font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;padding:4px 9px;text-align:center;background:{p.situacao === 'Vencida' ? 'var(--color-accent-600)' : p.situacao === 'Recebida' ? 'var(--color-neutral-900)' : 'var(--color-neutral-300)'};color:{p.situacao === 'A vencer' || p.situacao === 'Isento' ? 'var(--color-text)' : 'var(--color-neutral-100)'}">{p.situacao}</span>
        </div>
      {/each}
      <div style="margin-top:26px;padding:20px 24px;background:var(--color-neutral-900);color:var(--color-neutral-200);font-size:13.5px;line-height:1.6;max-width:70ch">
        {mei[0]}<strong style="color:var(--color-neutral-100)">{mei[1]}</strong>{mei[2]}
      </div>

    {:else if view === 'impostos'}
      {#if !tributos}
        <p style="color:var(--color-neutral-700)">{t.carregando}</p>
      {:else}
        <div style="border:2px solid var(--color-accent-600);background:var(--color-accent-100);padding:22px 24px;margin-bottom:30px;max-width:78ch">
          <div class="label" style="color:var(--color-accent-700);letter-spacing:0.14em;margin-bottom:8px">{t.atencao}</div>
          <p style="margin:0 0 14px;font-size:14.5px;line-height:1.6">{tributos.alerta}</p>
          <div style="height:8px;background:var(--color-neutral-300)">
            <div style="height:8px;background:var(--color-accent-600);width:{Math.min(tributos.percentual_do_limite, 100)}%"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--color-neutral-700);margin-top:7px">
            <span>{brl(tributos.acumulado_centavos / 100)} {t.acumulados}</span>
            <span>{t.doTeto(tributos.percentual_do_limite.toFixed(0), brl(tributos.limite_mei_centavos / 100))}</span>
          </div>
        </div>

        <div class="label" style="letter-spacing:0.14em;border-bottom:2px solid var(--color-text);padding-bottom:8px">{t.regimes}</div>
        {#each tributos.regimes as r}
          <div class="row tabela" style="--cols:minmax(0,260px) 110px 130px minmax(0,1fr);gap:18px;align-items:center;padding:16px 0">
            <span style="display:flex;align-items:center;gap:9px">
              <span style="font-size:14.5px;font-weight:{r.recomendado ? 700 : 500}">{r.nome}</span>
              {#if r.recomendado}
                <span style="font-size:9.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;padding:3px 7px;background:var(--color-neutral-900);color:var(--color-neutral-100)">{t.recomendado}</span>
              {/if}
            </span>
            <span class="display" style="font-size:15px;font-weight:700">{lang === 'en' ? r.carga_efetiva.toFixed(1) : r.carga_efetiva.toFixed(1).replace('.', ',')}%</span>
            <span class="display" style="font-size:15px;font-weight:700">{brl(r.imposto_mes_centavos / 100)}</span>
            <span style="font-size:12.5px;line-height:1.5;color:var(--color-neutral-700)">{r.nota}</span>
          </div>
        {/each}

        <div style="margin-top:28px;padding:20px 24px;background:var(--color-neutral-900);color:var(--color-neutral-200);font-size:13.5px;line-height:1.6;max-width:70ch">
          {fatorR[0]}<strong style="color:var(--color-neutral-100)">{fatorR[1]}</strong>{fatorR[2]}<strong
            style="color:var(--color-neutral-100)">{fatorR[3]}</strong>{fatorR[4]}
        </div>
        <p style="font-size:12.5px;line-height:1.6;color:var(--color-neutral-700);margin:18px 0 0;max-width:70ch">
          {t.notaContador}
        </p>
      {/if}

    {:else if view === 'projetos'}
      {#each resumo.execucao as p}
        <div style="border:2px solid var(--color-divider);background:var(--color-surface);padding:24px 26px;margin-bottom:18px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:18px;flex-wrap:wrap;margin-bottom:16px">
            <span class="display" style="font-size:19px;font-weight:700;letter-spacing:-0.02em">{p.titulo}</span>
            <span style="font-size:12.5px;color:var(--color-neutral-700)">{p.prazo}</span>
          </div>
          <div class="cartoes-4">
            {#each p.frentes as f}
              <div style="display:flex;flex-direction:column;gap:7px">
                <span style="font-size:11.5px;font-weight:600">{f.titulo}</span>
                <div style="height:6px;background:var(--color-neutral-300)">
                  <div style="height:6px;background:{f.progresso === 100 ? 'var(--color-neutral-900)' : 'var(--color-accent-600)'};width:{f.progresso}%"></div>
                </div>
                <span style="font-size:11px;color:var(--color-neutral-700)">{f.situacao}</span>
              </div>
            {/each}
          </div>
          <!-- Projeto sem bloqueio não ganha um rótulo "Bloqueio:" vazio: a
               linha inteira some. -->
          {#if p.bloqueio}
            <div style="margin-top:18px;padding-top:16px;border-top:1px solid var(--color-divider);font-size:13px;line-height:1.55;color:var(--color-neutral-700)">
              <strong style="color:var(--color-text)">{t.bloqueio}</strong> {p.bloqueio}
            </div>
          {/if}
        </div>
      {/each}

    {:else if view === 'conteudo'}
      <div class="cartoes-3">
        {#each resumo.produtos as p}
          <div style="border:2px solid var(--color-divider);background:var(--color-surface);padding:22px 24px;display:flex;flex-direction:column;gap:9px">
            <span class="label" style="color:var(--color-accent-700);letter-spacing:0.14em;font-size:10px">{p.tipo}</span>
            <span class="display" style="font-size:17px;font-weight:700;line-height:1.2;letter-spacing:-0.02em">{p.titulo}</span>
            <span style="font-size:13px;line-height:1.5;color:var(--color-neutral-700)">{p.descricao}</span>
            <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:8px;padding-top:12px;border-top:1px solid var(--color-divider)">
              <span class="display" style="font-size:15px;font-weight:700">{p.preco}</span>
              <span style="font-size:11.5px;color:var(--color-neutral-700)">{p.volume}</span>
            </div>
            <!-- Curso e licença também são receita, e também contam para o teto
                 do MEI: a linha existe para o produto digital não ficar fora da
                 conta que decide o enquadramento. -->
            {#if p.no_ano}
              <span style="font-size:11.5px;color:var(--color-neutral-700)">{p.no_ano}</span>
            {/if}
          </div>
        {/each}
      </div>

    {:else if view === 'documentos'}
      <div style="border-top:2px solid var(--color-text)">
        {#each resumo.modelos as m}
          <div class="row tabela" style="--cols:minmax(0,1fr) 90px 130px 190px;gap:18px;align-items:center;padding:16px 0">
            <span style="display:flex;flex-direction:column;gap:3px">
              <span style="font-size:14.5px;font-weight:600">{m.titulo}</span>
              <span style="font-size:12.5px;color:var(--color-neutral-700)">{m.descricao}</span>
            </span>
            <span class="display" style="font-size:13px;font-weight:700">{m.versao}</span>
            <span style="font-size:12.5px;color:var(--color-neutral-700)">{m.data}</span>
            <span style="font-size:12.5px;color:{m.congelado ? 'var(--color-accent-700)' : 'var(--color-neutral-700)'}">{m.uso}</span>
          </div>
        {/each}
      </div>
      <p style="font-size:13px;line-height:1.6;color:var(--color-neutral-700);margin:24px 0 0;max-width:66ch">
        {t.notaModelos}
      </p>

    {:else}
      <div style="border-top:2px solid var(--color-text)">
        {#each logs as l}
          <div class="row tabela" style="--cols:150px 130px minmax(0,1fr) 130px;gap:18px;align-items:baseline;padding:13px 0;font-size:13.5px">
            <span style="color:var(--color-neutral-700);font-size:12.5px">{l.quando}</span>
            <span class="label" style="color:{l.critico ? 'var(--color-accent-700)' : 'var(--color-neutral-700)'};font-weight:700">{l.tipo}</span>
            <span style="line-height:1.45">{l.evento}</span>
            <span class="display" style="font-size:12px;font-weight:600;color:var(--color-neutral-700)">{l.ip}</span>
          </div>
        {/each}
      </div>
      <p style="font-size:13px;line-height:1.6;color:var(--color-neutral-700);margin:24px 0 0;max-width:66ch">
        {t.notaAuditoria}
      </p>
    {/if}
  </div>
</div>

<style>
  /* O painel e' ferramenta de trabalho, nao pagina de leitura: em tela estreita
     a barra vira uma tira de abas que rola na horizontal, os indicadores se
     reempilham, e cada tabela rola dentro de si mesma em vez de espremer
     colunas ate' um numero cair por cima do rotulo do lado. */
  .painel { min-height: 100vh; display: grid; grid-template-columns: 250px minmax(0, 1fr); }
  .barra {
    background: var(--color-neutral-900);
    color: var(--color-neutral-100);
    padding: 30px 24px;
    display: flex;
    flex-direction: column;
    gap: 28px;
  }
  .conteudo { padding: 38px 44px 90px; max-width: 1180px; }

  .faixa-4, .faixa-3 {
    display: grid;
    border: 2px solid var(--color-text);
    margin-bottom: 34px;
  }
  .faixa-4 { grid-template-columns: repeat(4, 1fr); }
  .faixa-3 { grid-template-columns: repeat(3, 1fr); }
  .colunas-funil {
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 12px;
    align-items: start;
  }
  .cartoes-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .cartoes-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }

  .tabela { display: grid; grid-template-columns: var(--cols); gap: 18px; }

  @media (max-width: 900px) {
    .painel { grid-template-columns: minmax(0, 1fr); }
    .barra { padding: 20px 20px 16px; gap: 18px; }
    .conteudo { padding: 30px 20px 72px; }

    .faixa-4, .faixa-3 { grid-template-columns: repeat(2, 1fr); }
    .cartoes-4 { grid-template-columns: repeat(2, 1fr); }
    .cartoes-3 { grid-template-columns: minmax(0, 1fr); }

    /* Uma tabela so' se le com as colunas alinhadas entre as linhas, entao quem
       rola e' a area inteira — nunca cada linha por sua conta. As faixas de
       indicador nao tem largura minima, entao continuam se reempilhando. */
    .conteudo { overflow-x: auto; }
    .tabela { min-width: 680px; }
    .colunas-funil { grid-template-columns: repeat(6, 210px); padding-bottom: 8px; }
  }

  @media (max-width: 520px) {
    .faixa-4, .faixa-3 { grid-template-columns: minmax(0, 1fr); }
    .cartoes-4 { grid-template-columns: minmax(0, 1fr); }
  }
</style>
