<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Nav from '$lib/Nav.svelte';
  import Seo from '$lib/Seo.svelte';
  import { api } from '$lib/api.js';
  import { empresa } from '$lib/identidade.js';
  import { rota, textos } from '$lib/conteudo/index.js';

  let { lang = 'pt' } = $props();

  // O painel e a área do cliente são a mesma porta: quem entra é levado ao
  // lugar certo pelo papel devolvido pela API, não pelo formulário.
  const t = $derived(textos(lang).paginas.entrar);

  let modo = $state('entrar');
  let email = $state('');
  let nome = $state('');
  let senha = $state('');
  let senhaVisivel = $state(false);
  let capsLock = $state(false);
  let tocouEmail = $state(false);
  let enviando = $state(false);
  let erro = $state('');

  const copy = $derived(t.modos[modo]);
  const alvo = $derived(email.trim().toLowerCase());
  const emailValido = $derived(/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(alvo));
  const emailInvalido = $derived(tocouEmail && alvo.length > 0 && !emailValido);
  const senhaCurta = $derived(modo !== 'recuperar' && senha.length > 0 && senha.length < 8);
  const faltaNome = $derived(modo === 'criar' && nome.trim().length < 3);
  const pronto = $derived(
    emailValido && !faltaNome && (modo === 'recuperar' || senha.length >= 8)
  );

  // A lista diz o que falta antes de a pessoa apertar o botão desabilitado e
  // ficar sem saber por quê.
  const pendencias = $derived(
    [
      !emailValido && t.pendencias.email,
      faltaNome && t.pendencias.nome,
      modo !== 'recuperar' && senha.length < 8 && t.pendencias.senha
    ].filter(Boolean)
  );

  const avisoSenha = $derived(capsLock ? t.capsLock : senhaCurta ? t.senhaCurta : '');

  // Sessão viva já responde por si: mandar para o lugar certo em vez de
  // pedir de novo uma senha que o navegador já tem.
  onMount(() => {
    api.eu()
      .then((u) =>
        goto(
          $page.url.searchParams.get('volta') ||
            rota(u.papel === 'dono' ? '/admin' : '/conta', lang)
        )
      )
      .catch(() => {});
  });

  function trocarModo(novo) {
    modo = novo;
    erro = '';
    senha = '';
    capsLock = false;
  }

  function marcarCaps(e) {
    if (e.getModifierState) capsLock = e.getModifierState('CapsLock');
  }

  async function enviar(e) {
    e.preventDefault();
    if (modo === 'recuperar' || enviando || !pronto) {
      tocouEmail = true;
      return;
    }
    enviando = true;
    erro = '';
    try {
      const usuario =
        modo === 'criar'
          ? await api.criarConta(nome.trim(), alvo, senha)
          : await api.entrar(alvo, senha);
      const volta = $page.url.searchParams.get('volta');
      goto(volta || rota(usuario.papel === 'dono' ? '/admin' : '/conta', lang));
    } catch (err) {
      erro = err.message;
      senha = '';
    } finally {
      enviando = false;
    }
  }
</script>

<Seo
  {lang}
  caminho="/entrar"
  titulo={t.titulo}
  descricao={t.descricao}
  indexar={false} />

<Nav cta={false} {lang} />

<div class="tela">
  <div style="padding:70px 48px 90px;max-width:560px">
    <div class="kicker" style="margin-bottom:14px">{copy.kicker}</div>
    <h1 class="display" style="font-size:40px;line-height:1.03;margin:0 0 14px">{copy.titulo}</h1>
    <p style="font-size:15px;line-height:1.6;color:var(--color-neutral-700);margin:0 0 32px;max-width:46ch">{copy.sub}</p>

    <div style="display:flex;border:2px solid var(--color-text);margin-bottom:30px">
      {#each [['entrar', t.abas.entrar], ['criar', t.abas.criar]] as [id, rotulo]}
        <button
          type="button"
          aria-pressed={modo === id}
          onclick={() => trocarModo(id)}
          style="flex:1;font-family:var(--font-body);font-size:11.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;padding:13px 10px;border:0;cursor:pointer;background:{modo === id ? 'var(--color-text)' : 'transparent'};color:{modo === id ? 'var(--color-neutral-100)' : 'var(--color-text)'}"
        >{rotulo}</button>
      {/each}
    </div>

    {#if modo === 'recuperar'}
      <p style="font-size:15px;line-height:1.6;max-width:46ch;border-left:2px solid var(--color-accent);padding-left:18px;margin:0 0 28px">
        {t.recuperarTexto[0]}<a href="mailto:{empresa.email}">{empresa.email}</a>{t.recuperarTexto[1]}
      </p>
      <button type="button" class="btn-outline" onclick={() => trocarModo('entrar')}>{t.voltarAcesso}</button>
    {:else}
      <form onsubmit={enviar} style="display:flex;flex-direction:column;gap:20px">
        {#if modo === 'criar'}
          <div class="field">
            <label for="nome">{t.campos.nome}</label>
            <input id="nome" class="input" autocomplete="name" bind:value={nome} />
          </div>
        {/if}

        <div class="field">
          <label for="email">{t.campos.email}</label>
          <input
            id="email"
            class="input"
            type="email"
            autocomplete="email"
            aria-invalid={emailInvalido}
            style={emailInvalido ? 'border-color:var(--color-accent)' : ''}
            bind:value={email}
            onblur={() => (tocouEmail = true)}
          />
          {#if emailInvalido}
            <span style="display:block;margin-top:6px;font-size:12.5px;color:var(--color-accent-700)">{t.emailInvalido}</span>
          {/if}
        </div>

        <div class="field">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
            <label for="senha">{t.campos.senha}</label>
            <button
              type="button"
              onclick={() => (senhaVisivel = !senhaVisivel)}
              style="font-family:var(--font-body);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;background:transparent;border:0;padding:0;cursor:pointer;color:var(--color-accent-700)"
            >{senhaVisivel ? t.ocultar : t.mostrar}</button>
          </div>
          <input
            id="senha"
            class="input"
            type={senhaVisivel ? 'text' : 'password'}
            autocomplete={modo === 'criar' ? 'new-password' : 'current-password'}
            bind:value={senha}
            onkeyup={marcarCaps}
            onkeydown={marcarCaps}
          />
          {#if avisoSenha}
            <span style="display:block;margin-top:6px;font-size:12.5px;color:var(--color-neutral-700)">{avisoSenha}</span>
          {/if}
        </div>

        {#if erro}
          <p role="alert" style="margin:0;font-size:14px;line-height:1.5;color:var(--color-neutral-100);background:var(--color-accent-700);padding:12px 16px">{erro}</p>
        {/if}

        <button type="submit" class="btn-solid" disabled={!pronto || enviando} style="align-self:flex-start">
          {enviando ? t.enviando : copy.botao}
        </button>

        {#if !pronto}
          <span style="font-size:12.5px;color:var(--color-neutral-700)">{t.informe} {pendencias.join(' · ')}</span>
        {/if}

        <button
          type="button"
          onclick={() => trocarModo('recuperar')}
          style="align-self:flex-start;font-family:var(--font-body);font-size:12.5px;background:transparent;border:0;padding:0;cursor:pointer;color:var(--color-accent-700);text-decoration:underline"
        >{t.esqueci}</button>
      </form>
    {/if}
  </div>

  <aside class="vitrine">
    <span class="kicker" style="color:var(--color-accent-400)">{t.vitrine.kicker}</span>
    <p class="display" style="font-size:27px;line-height:1.2;margin:0;max-width:22ch">{t.vitrine.frase}</p>
    <div style="border-top:1px solid var(--color-neutral-700)">
      {#each t.vitrine.itens as item}
        <div style="padding:18px 0;border-bottom:1px solid var(--color-neutral-700)">
          <div style="font-size:14.5px;font-weight:600;margin-bottom:4px">{item.t}</div>
          <div style="font-size:13.5px;line-height:1.5;color:var(--color-neutral-400)">{item.d}</div>
        </div>
      {/each}
    </div>
  </aside>
</div>

<style>
  .tela {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    min-height: calc(100vh - 61px);
  }
  .vitrine {
    background: var(--color-text);
    color: var(--color-neutral-100);
    padding: 70px 48px 90px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 26px;
  }
  @media (max-width: 860px) {
    .tela { grid-template-columns: minmax(0, 1fr); }
    .vitrine { padding: 46px 40px 60px; }
  }
</style>
