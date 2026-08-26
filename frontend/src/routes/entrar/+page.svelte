<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Nav from '$lib/Nav.svelte';
  import { api } from '$lib/api.js';

  // Copy por modo. O painel e a área do cliente são a mesma porta: quem entra
  // é levado ao lugar certo pelo papel devolvido pela API, não pelo formulário.
  const COPY = {
    entrar: {
      kicker: 'Acesso',
      titulo: 'Entrar na sua conta',
      sub: 'Use o e-mail cadastrado no seu projeto ou na sua matrícula.',
      botao: 'Entrar'
    },
    criar: {
      kicker: 'Nova conta',
      titulo: 'Criar sua conta',
      sub: 'Leva menos de um minuto. A conta já nasce ligada às suas solicitações.',
      botao: 'Criar conta'
    },
    recuperar: {
      kicker: 'Recuperação',
      titulo: 'Recuperar acesso',
      sub: 'A redefinição automática ainda não está no ar.',
      botao: 'Entendi'
    }
  };

  let modo = $state('entrar');
  let email = $state('');
  let nome = $state('');
  let senha = $state('');
  let senhaVisivel = $state(false);
  let capsLock = $state(false);
  let tocouEmail = $state(false);
  let enviando = $state(false);
  let erro = $state('');

  const copy = $derived(COPY[modo]);
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
      !emailValido && 'e-mail válido',
      faltaNome && 'nome completo',
      modo !== 'recuperar' && senha.length < 8 && 'senha com 8+ caracteres'
    ].filter(Boolean)
  );

  const avisoSenha = $derived(
    capsLock
      ? 'Caps Lock está ativado.'
      : senhaCurta
        ? 'A senha precisa de ao menos 8 caracteres.'
        : ''
  );

  // Sessão viva já responde por si: mandar para o lugar certo em vez de
  // pedir de novo uma senha que o navegador já tem.
  onMount(() => {
    api.eu()
      .then((u) => goto($page.url.searchParams.get('volta') || (u.papel === 'dono' ? '/admin' : '/conta')))
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
      goto(volta || (usuario.papel === 'dono' ? '/admin' : '/conta'));
    } catch (err) {
      erro = err.message;
      senha = '';
    } finally {
      enviando = false;
    }
  }
</script>

<svelte:head><title>Entrar — Garioli Labs</title></svelte:head>

<Nav cta={false} />

<div class="tela">
  <div style="padding:70px 48px 90px;max-width:560px">
    <div class="kicker" style="margin-bottom:14px">{copy.kicker}</div>
    <h1 class="display" style="font-size:40px;line-height:1.03;margin:0 0 14px">{copy.titulo}</h1>
    <p style="font-size:15px;line-height:1.6;color:var(--color-neutral-700);margin:0 0 32px;max-width:46ch">{copy.sub}</p>

    <div style="display:flex;border:2px solid var(--color-text);margin-bottom:30px">
      {#each [['entrar', 'Entrar'], ['criar', 'Criar conta']] as [id, rotulo]}
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
        Escreva para <a href="mailto:demo@exemplo.com">demo@exemplo.com</a> do e-mail
        cadastrado e devolvemos o acesso no mesmo dia útil. Quando a redefinição por link entrar
        no ar, ela aparece aqui.
      </p>
      <button type="button" class="btn-outline" onclick={() => trocarModo('entrar')}>Voltar ao acesso</button>
    {:else}
      <form onsubmit={enviar} style="display:flex;flex-direction:column;gap:20px">
        {#if modo === 'criar'}
          <div class="field">
            <label for="nome">Nome completo</label>
            <input id="nome" class="input" autocomplete="name" bind:value={nome} />
          </div>
        {/if}

        <div class="field">
          <label for="email">E-mail</label>
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
            <span style="display:block;margin-top:6px;font-size:12.5px;color:var(--color-accent-700)">Confira o e-mail: falta o @ ou o domínio.</span>
          {/if}
        </div>

        <div class="field">
          <div style="display:flex;justify-content:space-between;align-items:baseline;gap:12px">
            <label for="senha">Senha</label>
            <button
              type="button"
              onclick={() => (senhaVisivel = !senhaVisivel)}
              style="font-family:var(--font-body);font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;background:transparent;border:0;padding:0;cursor:pointer;color:var(--color-accent-700)"
            >{senhaVisivel ? 'ocultar' : 'mostrar'}</button>
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
          {enviando ? 'Enviando…' : copy.botao}
        </button>

        {#if !pronto}
          <span style="font-size:12.5px;color:var(--color-neutral-700)">Para continuar, informe: {pendencias.join(' · ')}</span>
        {/if}

        <button
          type="button"
          onclick={() => trocarModo('recuperar')}
          style="align-self:flex-start;font-family:var(--font-body);font-size:12.5px;background:transparent;border:0;padding:0;cursor:pointer;color:var(--color-accent-700);text-decoration:underline"
        >Esqueci minha senha</button>
      </form>
    {/if}
  </div>

  <aside class="vitrine">
    <span class="kicker" style="color:var(--color-accent-400)">O que fica do outro lado</span>
    <p class="display" style="font-size:27px;line-height:1.2;margin:0;max-width:22ch">Cada etapa do seu projeto, com data e responsável.</p>
    <div style="border-top:1px solid var(--color-neutral-700)">
      {#each [
        ['Projetos', 'Da triagem à entrega, com o que está pendente de quem.'],
        ['Documentos', 'Propostas, contratos e recibos no mesmo lugar.'],
        ['Cursos e licenças', 'Progresso, chaves e vencimentos.']
      ] as [titulo, texto]}
        <div style="padding:18px 0;border-bottom:1px solid var(--color-neutral-700)">
          <div style="font-size:14.5px;font-weight:600;margin-bottom:4px">{titulo}</div>
          <div style="font-size:13.5px;line-height:1.5;color:var(--color-neutral-400)">{texto}</div>
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
