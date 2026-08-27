<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Nav from '$lib/Nav.svelte';
  import Seo from '$lib/Seo.svelte';
  import { api, PROVEDORES } from '$lib/api.js';
  import MarcaProvedor from '$lib/MarcaProvedor.svelte';
  import { empresa } from '$lib/identidade.js';
  import { rota, textos } from '$lib/conteudo/index.js';

  let { lang = 'pt' } = $props();

  // O painel e a área do cliente são a mesma porta: quem entra é levado ao
  // lugar certo pelo papel devolvido pela API, não pelo formulário.
  const t = $derived(textos(lang).paginas.entrar);

  let modo = $state('entrar');
  // Desafio aberto: a senha (ou o provedor) já passou e falta o segundo fator.
  let desafio = $state('');
  let codigo = $state('');
  let porRecuperacao = $state(false);
  let entrandoCom = $state('');
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

  const f2 = $derived(t.doisFatores);
  const codigoPronto = $derived(
    porRecuperacao ? codigo.trim().length >= 8 : /^\d{6}$/.test(codigo.replace(/\s/g, ''))
  );

  /// Um só lugar decide o que fazer com o que a API devolve: ou é usuário e a
  /// sessão está aberta, ou é desafio e falta uma etapa.
  function seguir(resposta) {
    if (resposta?.segundo_fator) {
      desafio = resposta.desafio;
      codigo = '';
      porRecuperacao = false;
      erro = '';
      return;
    }
    const volta = $page.url.searchParams.get('volta');
    goto(volta || rota(resposta.papel === 'dono' ? '/admin' : '/conta', lang));
  }

  async function entrarComProvedor(provedor) {
    if (entrandoCom) return;
    entrandoCom = provedor;
    erro = '';
    try {
      seguir(await api.entrarCom(provedor));
    } catch (err) {
      erro = err.message;
    } finally {
      entrandoCom = '';
    }
  }

  async function confirmarCodigo(e) {
    e.preventDefault();
    if (enviando || !codigoPronto) return;
    enviando = true;
    erro = '';
    try {
      seguir(await api.concluirSegundoFator(desafio, codigo));
    } catch (err) {
      // O 401 desta etapa tem dois significados, e a tela sabe dizê-los no
      // idioma da página — o backend responde num idioma só.
      if (err.motivo === 'desafio_expirado') {
        erro = f2.expirou;
        // Desafio expirado devolve a pessoa ao começo, senão ela fica digitando
        // código em uma etapa que o servidor já esqueceu.
        desafio = '';
      } else {
        erro = err.motivo === 'codigo_invalido' ? f2.recusado : err.message;
      }
      codigo = '';
    } finally {
      enviando = false;
    }
  }

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
      seguir(
        modo === 'criar'
          ? await api.criarConta(nome.trim(), alvo, senha)
          : await api.entrar(alvo, senha)
      );
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
    <div class="kicker" style="margin-bottom:14px">{desafio ? f2.kicker : copy.kicker}</div>
    <h1 class="display" style="font-size:40px;line-height:1.03;margin:0 0 14px">{desafio ? f2.titulo : copy.titulo}</h1>
    <p style="font-size:15px;line-height:1.6;color:var(--color-neutral-700);margin:0 0 32px;max-width:46ch">{desafio ? f2.sub : copy.sub}</p>

    {#if !desafio}
    <div style="display:flex;border:2px solid var(--color-text);margin-bottom:30px">
      {#each [['entrar', t.abas.entrar], ['criar', t.abas.criar]] as [id, rotulo]}
        <button
          type="button"
          aria-pressed={modo === id}
          onclick={() => trocarModo(id)}
          class="modo"
          data-ativo={modo === id}
        >{rotulo}</button>
      {/each}
    </div>
    {/if}

    <!-- Os provedores só aparecem onde há backend que os atenda: um botão que
         não autentica ninguém é pior do que botão nenhum. -->
    {#if !desafio && modo !== 'recuperar' && PROVEDORES.length}
      <div class="sso">
        <span class="sso-titulo">{t.sso.titulo}</span>
        <div class="sso-botoes">
          {#each PROVEDORES as p}
            <button
              type="button"
              class="provedor"
              disabled={Boolean(entrandoCom)}
              aria-label={t.sso.acao(t.sso.provedores[p])}
              onclick={() => entrarComProvedor(p)}
            >
              <MarcaProvedor provedor={p} />
              <span>{entrandoCom === p ? t.sso.entrando(t.sso.provedores[p]) : t.sso.provedores[p]}</span>
            </button>
          {/each}
        </div>
        <p class="sso-nota">{t.sso.nota}</p>
        <div class="divisor"><span>{t.sso.divisor}</span></div>
      </div>
    {/if}

    {#if desafio}
      <form onsubmit={confirmarCodigo} style="display:flex;flex-direction:column;gap:20px">
        <div class="field">
          <label for="codigo">{porRecuperacao ? f2.recuperacaoCampo : f2.campo}</label>
          <input
            id="codigo"
            class="input codigo"
            inputmode={porRecuperacao ? 'text' : 'numeric'}
            autocomplete={porRecuperacao ? 'off' : 'one-time-code'}
            maxlength={porRecuperacao ? 9 : 7}
            bind:value={codigo}
          />
        </div>

        {#if erro}
          <p role="alert" class="erro">{erro}</p>
        {/if}

        <button type="submit" class="btn-solid" disabled={!codigoPronto || enviando} style="align-self:flex-start">
          {enviando ? f2.conferindo : f2.botao}
        </button>

        <p class="dica-2fa">{f2.ou}</p>
        <button
          type="button"
          class="link-mini esqueci"
          onclick={() => { porRecuperacao = !porRecuperacao; codigo = ''; erro = ''; }}
        >{porRecuperacao ? f2.usarAplicativo : f2.usarRecuperacao}</button>
        <button
          type="button"
          class="link-mini esqueci"
          onclick={() => { desafio = ''; codigo = ''; erro = ''; senha = ''; }}
        >{f2.voltar}</button>
      </form>
    {:else if modo === 'recuperar'}
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
              class="link-mini"
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
          <p role="alert" class="erro">{erro}</p>
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
          class="link-mini esqueci"
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
  /* Estado por atributo, desenho por classe: e' a media query de toque que
     precisa alcancar o respiro destes tres, e regra inline ela nao alcanca. */
  .modo {
    flex: 1;
    font-family: var(--font-body);
    font-size: 11.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 13px 10px;
    border: 0;
    cursor: pointer;
    background: transparent;
    color: var(--color-text);
  }
  .modo[data-ativo='true'] {
    background: var(--color-text);
    color: var(--color-neutral-100);
  }
  .link-mini {
    font-family: var(--font-body);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 700;
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
    color: var(--color-accent-700);
  }
  .esqueci {
    align-self: flex-start;
    font-size: 12.5px;
    letter-spacing: 0;
    text-transform: none;
    font-weight: 400;
    text-decoration: underline;
  }

  /* — provedores de identidade —
     Base e' o telefone: um provedor por linha, alvo inteiro de toque. A
     linha unica so' entra onde ha' largura para os tres caberem sem
     espremer o rotulo. */
  .sso { margin-bottom: 30px; }
  .sso-titulo {
    display: block;
    font-family: var(--font-body);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--color-neutral-700);
    margin-bottom: 12px;
  }
  .sso-botoes { display: flex; flex-direction: column; gap: 10px; }
  .provedor {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 48px;
    padding: 0 16px;
    border: 2px solid var(--color-text);
    background: var(--color-neutral-100);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
  }
  .provedor:hover { background: var(--color-neutral-200); }
  .provedor:disabled { opacity: 0.55; cursor: default; }
  .sso-nota {
    margin: 12px 0 0;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--color-neutral-700);
    max-width: 46ch;
  }
  /* Regra com o rotulo no meio: separa os dois caminhos sem precisar de uma
     frase explicando que sao dois caminhos. */
  .divisor {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 26px;
    font-family: var(--font-body);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--color-neutral-700);
  }
  .divisor::before, .divisor::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--color-neutral-400);
  }
  @media (min-width: 481px) {
    .sso-botoes { flex-direction: row; }
    .provedor { flex: 1; min-width: 0; padding: 0 10px; }
  }

  /* — segundo fator — */
  .codigo {
    font-family: var(--font-tecnica);
    font-size: 22px;
    letter-spacing: 0.3em;
  }
  .dica-2fa {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--color-neutral-700);
    max-width: 46ch;
  }

  .erro {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: var(--color-neutral-100);
    background: var(--color-accent-700);
    padding: 12px 16px;
  }

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

  /* Um botao de texto nao pode virar um bloco de 44 px de altura sem estragar
     a linha em que ele mora. Entao quem cresce e' so' a area de toque: o
     respiro entra e a margem negativa o desconta, de modo que o alvo fica
     grande e o desenho fica igual. */
@media (pointer: coarse), (max-width: 620px) {
    .modo { padding: 16px 10px; }
    .link-mini { padding: 17px 8px; margin: -17px -8px; }
  }
</style>
