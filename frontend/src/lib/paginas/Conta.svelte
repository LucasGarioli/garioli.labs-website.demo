<script>
  import { onMount } from 'svelte';
  import Nav from '$lib/Nav.svelte';
  import Seo from '$lib/Seo.svelte';
  import { goto } from '$app/navigation';
  import ContaPerfil from '$lib/paginas/ContaPerfil.svelte';
  import { api, exigeSessao, PERFIL, SEGUNDO_FATOR } from '$lib/api.js';
  import { rota, textos } from '$lib/conteudo/index.js';

  let { lang = 'pt' } = $props();
  const t = $derived(textos(lang).paginas.conta);
  const sg = $derived(t.seguranca);

  let tab = $state('projetos');
  let conta = $state(null);
  let erro = $state('');

  // A aba só existe onde o backend responde por ela: uma aba que devolve 404
  // é pior do que uma aba a menos.
  const ATENDIDA = { seguranca: () => SEGUNDO_FATOR, perfil: () => PERFIL };
  const abas = $derived(t.abas.filter((a) => (ATENDIDA[a.id] ?? (() => true))()));

  // --- segundo fator ---
  // `passo` é o que a tela mostra; se o segundo fator está ativo quem diz é o
  // backend, não esta página.
  let fator = $state(null);
  let passo = $state('resumo');
  let cadastro = $state(null);
  let codigosNovos = $state([]);
  let codigo2fa = $state('');
  let ocupado = $state(false);
  let erro2fa = $state('');
  let copiado = $state(false);

  const pronto2fa = $derived(codigo2fa.replace(/[\s-]/g, '').length >= 6);

  // A data de ativação chega em ISO, que é o que um backend devolve. Quem
  // escolhe o formato é a página, porque é ela que sabe o idioma.
  const dia = (iso) => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
  };

  async function carregarFator() {
    try {
      fator = await api.segundoFator();
    } catch (e) {
      erro2fa = e.message;
    }
  }

  // Só busca quando a aba é aberta: quem nunca entra nela não paga a chamada.
  $effect(() => {
    if (tab === 'seguranca' && SEGUNDO_FATOR && !fator && !erro2fa) carregarFator();
  });

  async function tentar(acao) {
    if (ocupado) return;
    ocupado = true;
    erro2fa = '';
    try {
      await acao();
    } catch (e) {
      // Mesma razão da tela de acesso: o backend fala um idioma só, e a recusa
      // de um código é o erro que mais aparece aqui.
      erro2fa = e.motivo === 'codigo_invalido' ? sg.recusado : e.message;
    } finally {
      ocupado = false;
    }
  }

  const iniciar = () =>
    tentar(async () => {
      cadastro = await api.iniciarSegundoFator();
      codigo2fa = '';
      copiado = false;
      passo = 'cadastro';
    });

  const confirmar = () =>
    tentar(async () => {
      const { codigos } = await api.confirmarSegundoFator(codigo2fa);
      codigosNovos = codigos;
      cadastro = null;
      codigo2fa = '';
      passo = 'codigos';
      await carregarFator();
    });

  const desativar = () =>
    tentar(async () => {
      await api.desativarSegundoFator(codigo2fa);
      codigo2fa = '';
      passo = 'resumo';
      await carregarFator();
    });

  function cancelar() {
    cadastro = null;
    codigosNovos = [];
    codigo2fa = '';
    erro2fa = '';
    passo = 'resumo';
  }

  // Copiar é conveniência; onde a área de transferência não existe (contexto
  // não seguro), o segredo continua na tela para ser digitado.
  async function copiarSegredo() {
    try {
      await navigator.clipboard.writeText(cadastro.segredo);
      copiado = true;
      setTimeout(() => (copiado = false), 2000);
    } catch {
      copiado = false;
    }
  }

  onMount(() => {
    api
      .minhaConta()
      .then((c) => (conta = c))
      .catch((e) => {
        if (!exigeSessao(e, goto, rota('/conta', lang))) erro = e.message;
      });
  });

  function barra(i, done) {
    if (i < done) return 'var(--color-accent-600)';
    if (i === done) return 'var(--color-accent-300)';
    return 'var(--color-neutral-300)';
  }
</script>

<Seo {lang} caminho="/conta" titulo={t.titulo} descricao={t.titulo} indexar={false} />

<Nav {lang} modo="app" />

<div class="rule abas">
  {#each abas as aba}
    <button
      type="button"
      onclick={() => (tab = aba.id)}
      class="aba"
      data-ativa={tab === aba.id}
    >{aba.label}</button>
  {/each}
</div>

{#if erro}
  <p style="padding:60px 40px;color:var(--color-accent-700)">{erro}</p>
{:else if !conta}
  <p style="padding:60px 40px;color:var(--color-neutral-700)">{t.carregando}</p>
{:else}
  <div class="conteudo">
    {#if tab === 'projetos'}
      <div class="kicker" style="margin-bottom:12px">{t.secoes.projetos.kicker}</div>
      <h1 class="display titulo">{t.secoes.projetos.titulo}</h1>

      {#each conta.projetos as p}
        <div style="border:2px solid var(--color-text);background:var(--color-surface);padding:28px 30px;margin-bottom:20px">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:20px;flex-wrap:wrap;margin-bottom:6px">
            <span class="display" style="font-size:21px;font-weight:700;letter-spacing:-0.02em">{p.titulo}</span>
            <span style="font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;padding:5px 11px;background:{p.destaque ? 'var(--color-accent-600)' : 'var(--color-neutral-900)'};color:var(--color-neutral-100)">{p.status}</span>
          </div>
          <div style="font-size:13px;color:var(--color-neutral-700);margin-bottom:22px">{p.meta}</div>
          <div class="fases">
            {#each t.fases as f, i}
              <div style="display:flex;flex-direction:column;gap:8px">
                <div style="height:6px;background:{barra(i, p.fase)}"></div>
                <span style="font-size:10.5px;line-height:1.35;color:{i <= p.fase ? 'var(--color-text)' : 'var(--color-neutral-600)'};font-weight:{i === p.fase ? 700 : 400}">{f}</span>
              </div>
            {/each}
          </div>
          <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center;margin-top:22px;padding-top:20px;border-top:1px solid var(--color-divider)">
            <a class="btn-solid compacto" href="{rota('/proposta', lang)}?id={p.id}">{p.cta}</a>
            <span style="font-size:13px;color:var(--color-neutral-700)">{p.pendencia}</span>
          </div>
        </div>
      {/each}

      <div style="border:2px dashed var(--color-neutral-400);padding:26px 30px;display:flex;justify-content:space-between;align-items:center;gap:20px;flex-wrap:wrap">
        <span style="font-size:14.5px;line-height:1.5;max-width:52ch">{t.outroProjeto}</span>
        <a class="btn-outline" href={rota('/orcamento', lang)}>{t.solicitar}</a>
      </div>

    {:else if tab === 'cursos'}
      <div class="kicker" style="margin-bottom:12px">{t.secoes.cursos.kicker}</div>
      <h1 class="display titulo">{t.secoes.cursos.titulo}</h1>
      <div class="cartoes-2">
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
              <a href={rota('/conta', lang)} style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700">{c.cta}</a>
            </div>
          </div>
        {/each}
      </div>

    {:else if tab === 'licencas'}
      <div class="kicker" style="margin-bottom:12px">{t.secoes.licencas.kicker}</div>
      <h1 class="display titulo">{t.secoes.licencas.titulo}</h1>
      <div style="border-top:2px solid var(--color-text)">
        {#each conta.licencas as l}
          <div class="row tabela" style="--cols:minmax(0,1fr) 220px 150px 110px;gap:20px;align-items:center;padding:18px 0">
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

    {:else if tab === 'perfil'}
      <ContaPerfil t={t.perfil} />

    {:else if tab === 'seguranca'}
      <div class="kicker" style="margin-bottom:12px">{sg.kicker}</div>
      <h1 class="display titulo">{sg.titulo}</h1>

      <div class="painel">
        {#if !fator && !erro2fa}
          <p class="texto">{t.carregando}</p>
        {:else if passo === 'codigos'}
          <h2 class="sub">{sg.codigosTitulo}</h2>
          <p class="texto">{sg.codigosTexto}</p>
          <ul class="codigos">
            {#each codigosNovos as c}
              <li>{c}</li>
            {/each}
          </ul>
          <button type="button" class="btn-solid compacto" onclick={cancelar}>{sg.codigosOk}</button>

        {:else if passo === 'cadastro' && cadastro}
          <h2 class="sub">{sg.passo1}</h2>
          <p class="texto">{sg.passo1Texto}</p>
          <a class="btn-outline compacto" href={cadastro.uri}>{sg.abrirApp}</a>

          <div class="segredo">
            <span class="rotulo">{sg.segredoRotulo}</span>
            <code>{cadastro.formatado}</code>
            <button type="button" class="link-mini" onclick={copiarSegredo}
              >{copiado ? sg.copiado : sg.copiar}</button>
          </div>

          <h2 class="sub">{sg.passo2}</h2>
          <div class="field">
            <label for="codigo2fa">{sg.campo}</label>
            <input
              id="codigo2fa"
              class="input codigo"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="7"
              bind:value={codigo2fa}
            />
          </div>

          {#if erro2fa}<p role="alert" class="erro">{erro2fa}</p>{/if}

          <div class="acoes">
            <button type="button" class="btn-solid compacto" disabled={!pronto2fa || ocupado} onclick={confirmar}
              >{ocupado ? sg.confirmando : sg.confirmar}</button>
            <button type="button" class="link-mini" onclick={cancelar}>{sg.cancelar}</button>
          </div>

        {:else if passo === 'desativar'}
          <p class="texto">{sg.desativarTexto}</p>
          <div class="field">
            <label for="codigo-off">{sg.campo}</label>
            <input id="codigo-off" class="input codigo" autocomplete="one-time-code" maxlength="9" bind:value={codigo2fa} />
          </div>

          {#if erro2fa}<p role="alert" class="erro">{erro2fa}</p>{/if}

          <div class="acoes">
            <button type="button" class="btn-solid compacto" disabled={!pronto2fa || ocupado} onclick={desativar}
              >{ocupado ? sg.desativando : sg.desativar}</button>
            <button type="button" class="link-mini" onclick={cancelar}>{sg.cancelar}</button>
          </div>

        {:else}
          <span class="selo" data-ativo={Boolean(fator?.ativo)}>{fator?.ativo ? sg.seloAtivo : sg.seloInativo}</span>
          <p class="texto">{fator?.ativo ? sg.resumoAtivo : sg.resumoInativo}</p>

          {#if fator?.ativo}
            <p class="meta">{sg.desde(dia(fator.desde))} · {sg.restantes(fator.codigos_restantes)}</p>
          {/if}

          {#if erro2fa}<p role="alert" class="erro">{erro2fa}</p>{/if}

          {#if fator?.ativo}
            <button type="button" class="btn-outline compacto" onclick={() => { erro2fa = ''; codigo2fa = ''; passo = 'desativar'; }}
              >{sg.desativar}</button>
          {:else}
            <button type="button" class="btn-solid compacto" disabled={ocupado} onclick={iniciar}
              >{ocupado ? sg.preparando : sg.ativar}</button>
          {/if}
        {/if}

        <p class="nota">{sg.nota}</p>
      </div>

    {:else}
      <div class="kicker" style="margin-bottom:12px">{t.secoes.docs.kicker}</div>
      <h1 class="display titulo">{t.secoes.docs.titulo}</h1>
      <div style="border-top:2px solid var(--color-text)">
        {#each conta.documentos as d}
          <div class="row tabela" style="--cols:200px minmax(0,1fr) 130px 100px;gap:20px;align-items:center;padding:16px 0">
            <span class="label">{d.tipo}</span>
            <span style="font-size:14.5px;font-weight:500">{d.titulo}</span>
            <span style="font-size:13px;color:var(--color-neutral-700)">{d.data}</span>
            <a href={d.url} style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700">{t.baixarPdf}</a>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  /* A pagina inteira era estilo inline, e regra inline nao aceita media query:
     as quatro grades de largura fixa viraram classe para poder respirar. */
  .aba {
    font-family: var(--font-body);
    font-size: 11.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 500;
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;
    padding: 6px 0;
    cursor: pointer;
    color: var(--color-neutral-600);
  }
  .aba[data-ativa='true'] {
    font-weight: 700;
    border-bottom-color: var(--color-accent-600);
    color: var(--color-text);
  }
  /* No dedo a aba precisa de 44 px de altura; o sublinhado desce junto, que e'
     o desenho certo — a aba fica com a altura da tira. */
@media (pointer: coarse), (max-width: 620px) {
    .aba { padding: 15px 0; }
  }

  /* — segundo fator —
     Base e' o telefone: uma coluna, alvos inteiros. O painel nao passa da
     largura de leitura porque o que ele tem e' texto e um campo. */
  .painel {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    max-width: 56ch;
    border: 2px solid var(--color-text);
    background: var(--color-surface);
    padding: 26px 22px;
  }
  .painel .sub {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin: 0;
  }
  .painel .texto { margin: 0; font-size: 14.5px; line-height: 1.6; }
  .painel .meta { margin: 0; font-size: 12.5px; color: var(--color-neutral-700); }
  .painel .nota {
    margin: 0;
    padding-top: 16px;
    border-top: 1px solid var(--color-divider);
    width: 100%;
    box-sizing: border-box;
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--color-neutral-700);
  }
  .selo {
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 5px 11px;
    background: var(--color-neutral-900);
    color: var(--color-neutral-100);
  }
  .selo[data-ativo='true'] { background: var(--color-accent-600); }

  .segredo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    width: 100%;
    box-sizing: border-box;
    padding: 14px 16px;
    background: var(--color-neutral-200);
  }
  .segredo .rotulo {
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--color-neutral-700);
  }
  /* O segredo e' longo e nao tem espaco onde quebrar sozinho: sem isto ele
     empurra o painel para fora da tela do telefone. */
  .segredo code {
    font-family: var(--font-tecnica);
    font-size: 14px;
    letter-spacing: 0.08em;
    word-break: break-all;
  }

  .codigo {
    font-family: var(--font-tecnica);
    font-size: 20px;
    letter-spacing: 0.3em;
  }
  .codigos {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px 16px;
    width: 100%;
    font-family: var(--font-tecnica);
    font-size: 14.5px;
    letter-spacing: 0.06em;
  }
  .acoes { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
  .link-mini {
    font-family: var(--font-body);
    font-size: 12.5px;
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
    color: var(--color-accent-700);
    text-decoration: underline;
  }
  .erro {
    margin: 0;
    width: 100%;
    box-sizing: border-box;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-neutral-100);
    background: var(--color-accent-700);
    padding: 12px 16px;
  }
  @media (min-width: 621px) {
    .painel { padding: 30px 32px; gap: 20px; }
  }
  @media (pointer: coarse), (max-width: 620px) {
    .link-mini { padding: 15px 8px; margin: -15px -8px; }
  }

  .abas {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 14px 40px;
    flex-wrap: wrap;
  }
  .conteudo {
    padding: 44px 40px 90px;
    max-width: 1100px;
    margin: 0 auto;
  }
  .titulo {
    font-size: 36px;
    line-height: 1.05;
    margin: 0 0 34px;
  }
  .fases {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 6px;
  }
  .cartoes-2 {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }
  .tabela {
    display: grid;
    grid-template-columns: var(--cols);
  }

  @media (max-width: 860px) {
    .abas {
      padding: 12px 24px;
      gap: 18px;
    }
    /* Uma tabela so' se le com as colunas alinhadas entre as linhas, entao quem
       rola e' a area inteira — nunca cada linha por sua conta. */
    .conteudo {
      padding: 34px 24px 76px;
      overflow-x: auto;
    }
    .cartoes-2 {
      grid-template-columns: minmax(0, 1fr);
    }
    .tabela {
      min-width: 620px;
    }
  }

  @media (max-width: 620px) {
    .abas {
      padding: 12px 20px;
      gap: 16px;
    }
    .conteudo {
      padding: 30px 20px 72px;
    }
    .titulo {
      font-size: 28px;
      margin: 0 0 26px;
    }
    /* Seis fases em 390 px dao 50 px de coluna e o nome da fase quebra letra a
       letra. Duas fileiras de tres cabem inteiras. */
    .fases {
      grid-template-columns: repeat(3, 1fr);
      gap: 12px 8px;
    }
  }
</style>
