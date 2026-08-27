<script>
  import { api } from '$lib/api.js';
  import { mascaraCpf, mascaraDocumento } from '$lib/documento.js';
  import { lembrar } from '$lib/sessao.js';

  /// O cadastro da conta: foto, identificação, endereço, faturamento e as
  /// formas de pagamento.
  ///
  /// Vive fora de `Conta.svelte` porque é a única aba com formulário: as
  /// outras quatro só listam o que o backend manda, e misturar as duas coisas
  /// num arquivo faria a página inteira re-renderizar a cada tecla digitada
  /// aqui.
  let { t } = $props();

  let perfil = $state(null);
  let erro = $state('');
  let salvo = $state(false);
  let salvando = $state(false);
  // O aviso "salvo" se apaga sozinho depois de alguns segundos. Sem guardar o
  // relógio, o apagador do primeiro salvamento derruba a confirmação do
  // segundo: a pessoa salva, vê o aviso piscar e some, e fica sem saber se
  // gravou.
  let relogioSalvo = null;

  // A foto tem seu próprio ciclo: ela sai daqui no instante em que é
  // escolhida, sem esperar o "Salvar" do resto do formulário — quem troca de
  // foto espera ver a foto trocar.
  let arquivo = $state(null);
  let enviandoFoto = $state(false);
  let erroFoto = $state('');

  let ocupadoPagamento = $state(false);

  const TIPOS = ['image/png', 'image/jpeg', 'image/webp'];
  const MAXIMO_ARQUIVO = 10 * 1024 * 1024;
  const LADO = 256;

  /// A recusa do backend chega com um motivo estável; a frase é escolhida
  /// aqui, no idioma da página. Sem isto a tela em inglês mostraria a
  /// mensagem em português que o backend fala.
  const frase = (e) => t.erros[e?.motivo] ?? e?.message ?? '';

  async function carregar() {
    try {
      perfil = await api.perfil();
    } catch (e) {
      erro = frase(e);
    }
  }
  carregar();

  async function salvar() {
    if (salvando || !perfil) return;
    salvando = true;
    erro = '';
    salvo = false;
    try {
      perfil = await api.salvarPerfil(perfil);
      // O nome mudou aqui: quem desenha a barra do topo precisa saber.
      await avisarBarra();
      salvo = true;
      clearTimeout(relogioSalvo);
      relogioSalvo = setTimeout(() => (salvo = false), 4000);
    } catch (e) {
      erro = frase(e);
    } finally {
      salvando = false;
    }
  }

  /// A barra de topo lê a sessão anotada; sem este empurrão ela só descobriria
  /// o nome novo e a foto nova na próxima página carregada.
  async function avisarBarra() {
    try {
      lembrar(await api.eu());
    } catch {
      // Sessão caiu no meio: a barra se corrige sozinha na próxima verificação.
    }
  }

  /// Recorta no quadrado central e reduz para 256 px antes de enviar.
  ///
  /// Reduzir no navegador não é economia de rede: é o que impede uma foto de
  /// 12 MP de virar um campo de vários megabytes no cadastro. O corte é
  /// central porque é onde está o rosto em praticamente toda foto de perfil.
  function reduzir(fonte) {
    return new Promise((ok, nok) => {
      const img = new Image();
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        const tela = document.createElement('canvas');
        tela.width = LADO;
        tela.height = LADO;
        const ctx = tela.getContext('2d');
        if (!ctx) return nok(new Error('sem canvas'));
        ctx.drawImage(
          img,
          (img.width - lado) / 2,
          (img.height - lado) / 2,
          lado,
          lado,
          0,
          0,
          LADO,
          LADO
        );
        ok(tela.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => nok(new Error('imagem ilegível'));
      img.src = fonte;
    });
  }

  function lerArquivo(f) {
    return new Promise((ok, nok) => {
      const leitor = new FileReader();
      leitor.onload = () => ok(String(leitor.result));
      leitor.onerror = () => nok(new Error('leitura falhou'));
      leitor.readAsDataURL(f);
    });
  }

  async function escolherFoto(evento) {
    const f = evento.currentTarget.files?.[0];
    // O campo é zerado já: sem isto, escolher o mesmo arquivo de novo depois
    // de um erro não dispara evento nenhum.
    evento.currentTarget.value = '';
    if (!f) return;

    erroFoto = '';
    if (!TIPOS.includes(f.type)) {
      erroFoto = t.foto.tipoInvalido;
      return;
    }
    if (f.size > MAXIMO_ARQUIVO) {
      erroFoto = t.foto.grandeDemais;
      return;
    }

    enviandoFoto = true;
    try {
      const { foto } = await api.enviarFoto(await reduzir(await lerArquivo(f)));
      perfil = { ...perfil, foto };
      await avisarBarra();
    } catch (e) {
      erroFoto = e?.motivo ? frase(e) : t.foto.falhou;
    } finally {
      enviandoFoto = false;
    }
  }

  async function removerFoto() {
    enviandoFoto = true;
    erroFoto = '';
    try {
      await api.removerFoto();
      perfil = { ...perfil, foto: null };
      await avisarBarra();
    } catch (e) {
      erroFoto = frase(e);
    } finally {
      enviandoFoto = false;
    }
  }

  async function comPagamento(acao) {
    if (ocupadoPagamento) return;
    ocupadoPagamento = true;
    erro = '';
    try {
      perfil = await acao();
    } catch (e) {
      erro = frase(e);
    } finally {
      ocupadoPagamento = false;
    }
  }

  const juridica = $derived(perfil?.faturamento?.tipo === 'juridica');

  /// A mesma máscara do passo de qualificação do contrato — o número é o
  /// mesmo, então lê-se do mesmo jeito nas duas telas.
  function formatarDocumento() {
    perfil.faturamento.documento = juridica
      ? mascaraDocumento(perfil.faturamento.documento)
      : mascaraCpf(perfil.faturamento.documento);
  }

  /// 00000-000, que é como o CEP se escreve.
  function formatarCep() {
    const d = perfil.endereco.cep.replace(/\D/g, '').slice(0, 8);
    perfil.endereco.cep = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  }
  const iniciais = $derived(
    (perfil?.nome ?? '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .join('')
  );
</script>

<div class="kicker" style="margin-bottom:12px">{t.kicker}</div>
<h1 class="display titulo">{t.titulo}</h1>

{#if !perfil}
  <p class="texto-solto">{erro || '…'}</p>
{:else}
  <div class="pilha">
    <!-- ————— foto ————— -->
    <section class="painel largo">
      <h2 class="sub">{t.foto.titulo}</h2>
      <div class="retrato">
        {#if perfil.foto}
          <img class="avatar" src={perfil.foto} alt="" width="88" height="88" />
        {:else}
          <span class="avatar vazio" aria-hidden="true">{iniciais}</span>
        {/if}
        <div class="retrato-lado">
          <p class="texto">{perfil.foto ? t.foto.texto : t.foto.semFoto}</p>
          <div class="acoes">
            <button
              type="button"
              class="btn-outline compacto"
              disabled={enviandoFoto}
              onclick={() => arquivo?.click()}
              >{enviandoFoto ? t.foto.enviando : perfil.foto ? t.foto.trocar : t.foto.enviar}</button
            >
            {#if perfil.foto}
              <button type="button" class="link-mini" disabled={enviandoFoto} onclick={removerFoto}
                >{t.foto.remover}</button
              >
            {/if}
          </div>
        </div>
      </div>
      <input
        bind:this={arquivo}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        class="escondido"
        onchange={escolherFoto}
      />
      {#if erroFoto}<p role="alert" class="erro">{erroFoto}</p>{/if}
    </section>

    <!-- ————— identificação ————— -->
    <section class="painel largo">
      <h2 class="sub">{t.identificacao.titulo}</h2>
      <div class="grade">
        <div class="field dois">
          <label for="p-nome">{t.identificacao.nome}</label>
          <input id="p-nome" class="input" autocomplete="name" bind:value={perfil.nome} />
        </div>
        <div class="field">
          <label for="p-email">{t.identificacao.email}</label>
          <!-- Trocar o e-mail é trocar a identidade da conta: passa por
               verificação do endereço novo, não por um campo de formulário. -->
          <input id="p-email" class="input" value={perfil.email} readonly />
        </div>
        <div class="field">
          <label for="p-tel">{t.identificacao.telefone}</label>
          <input
            id="p-tel"
            class="input"
            type="tel"
            inputmode="tel"
            autocomplete="tel"
            bind:value={perfil.telefone}
          />
        </div>
      </div>
      <p class="nota">{t.identificacao.emailNota}</p>
    </section>

    <!-- ————— endereço ————— -->
    <section class="painel largo">
      <h2 class="sub">{t.endereco.titulo}</h2>
      <p class="texto">{t.endereco.texto}</p>
      <div class="grade">
        <div class="field">
          <label for="p-cep">{t.endereco.cep}</label>
          <input
            id="p-cep"
            class="input"
            inputmode="numeric"
            autocomplete="postal-code"
            maxlength="9"
            bind:value={perfil.endereco.cep}
            oninput={formatarCep}
          />
        </div>
        <div class="field">
          <label for="p-num">{t.endereco.numero}</label>
          <input id="p-num" class="input" bind:value={perfil.endereco.numero} />
        </div>
        <div class="field dois">
          <label for="p-rua">{t.endereco.logradouro}</label>
          <input
            id="p-rua"
            class="input"
            autocomplete="address-line1"
            bind:value={perfil.endereco.logradouro}
          />
        </div>
        <div class="field">
          <label for="p-compl">{t.endereco.complemento}</label>
          <input
            id="p-compl"
            class="input"
            autocomplete="address-line2"
            bind:value={perfil.endereco.complemento}
          />
        </div>
        <div class="field">
          <label for="p-bairro">{t.endereco.bairro}</label>
          <input id="p-bairro" class="input" bind:value={perfil.endereco.bairro} />
        </div>
        <div class="field">
          <label for="p-cidade">{t.endereco.cidade}</label>
          <input
            id="p-cidade"
            class="input"
            autocomplete="address-level2"
            bind:value={perfil.endereco.cidade}
          />
        </div>
        <div class="field">
          <label for="p-uf">{t.endereco.uf}</label>
          <input
            id="p-uf"
            class="input"
            maxlength="2"
            autocapitalize="characters"
            autocomplete="address-level1"
            bind:value={perfil.endereco.uf}
          />
        </div>
        <div class="field dois">
          <label for="p-pais">{t.endereco.pais}</label>
          <input
            id="p-pais"
            class="input"
            autocomplete="country-name"
            bind:value={perfil.endereco.pais}
          />
        </div>
      </div>
    </section>

    <!-- ————— faturamento ————— -->
    <section class="painel largo">
      <h2 class="sub">{t.faturamento.titulo}</h2>
      <p class="texto">{t.faturamento.texto}</p>

      <fieldset class="escolha">
        <legend>{t.faturamento.tipo}</legend>
        <label>
          <input type="radio" bind:group={perfil.faturamento.tipo} value="fisica" />
          <span>{t.faturamento.fisica}</span>
        </label>
        <label>
          <input type="radio" bind:group={perfil.faturamento.tipo} value="juridica" />
          <span>{t.faturamento.juridica}</span>
        </label>
      </fieldset>

      <div class="grade">
        <div class="field">
          <label for="p-doc">{juridica ? t.faturamento.cnpj : t.faturamento.cpf}</label>
          <input
            id="p-doc"
            class="input"
            inputmode="numeric"
            maxlength="18"
            bind:value={perfil.faturamento.documento}
            oninput={formatarDocumento}
          />
        </div>
        {#if juridica}
          <div class="field">
            <label for="p-ie">
              {t.faturamento.inscricao}
              <span class="dica">· {t.faturamento.isento}</span>
            </label>
            <input id="p-ie" class="input" bind:value={perfil.faturamento.inscricaoEstadual} />
          </div>
          <div class="field dois">
            <label for="p-razao">{t.faturamento.razaoSocial}</label>
            <input
              id="p-razao"
              class="input"
              autocomplete="organization"
              bind:value={perfil.faturamento.razaoSocial}
            />
          </div>
        {/if}
      </div>

      <label class="marcar">
        <input type="checkbox" bind:checked={perfil.faturamento.mesmoEndereco} />
        <span>{t.faturamento.mesmoEndereco}</span>
      </label>
    </section>

    {#if erro}<p role="alert" class="erro solto">{erro}</p>{/if}

    <div class="acoes rodape">
      <button type="button" class="btn-solid compacto" disabled={salvando} onclick={salvar}
        >{salvando ? t.salvando : t.salvar}</button
      >
      {#if salvo}<span class="confirmado" role="status">{t.salvo}</span>{/if}
    </div>

    <!-- ————— pagamento ————— -->
    <section class="painel largo">
      <h2 class="sub">{t.pagamento.titulo}</h2>
      <p class="texto">{t.pagamento.texto}</p>

      {#if perfil.pagamentos.length === 0}
        <p class="meta">{t.pagamento.vazio}</p>
      {:else}
        <ul class="metodos">
          {#each perfil.pagamentos as m (m.id)}
            <li>
              <span class="metodo-nome">
                <span class="display forte"
                  >{m.tipo === 'pix' ? t.pagamento.pix : t.pagamento.cartao(m)}</span
                >
                <span class="meta"
                  >{m.tipo === 'pix' ? m.rotulo : t.pagamento.validade(m)}</span
                >
              </span>
              {#if m.padrao}
                <span class="selo" data-ativo="true">{t.pagamento.padrao}</span>
              {:else}
                <button
                  type="button"
                  class="link-mini"
                  disabled={ocupadoPagamento}
                  onclick={() => comPagamento(() => api.definirPagamentoPadrao(m.id))}
                  >{t.pagamento.tornarPadrao}</button
                >
              {/if}
              <button
                type="button"
                class="link-mini"
                disabled={ocupadoPagamento}
                onclick={() => comPagamento(() => api.removerPagamento(m.id))}
                >{t.pagamento.remover}</button
              >
            </li>
          {/each}
        </ul>
      {/if}

      <div class="acoes">
        <button
          type="button"
          class="btn-outline compacto"
          disabled={ocupadoPagamento}
          onclick={() => comPagamento(() => api.adicionarPagamento('cartao'))}
          >{ocupadoPagamento ? t.pagamento.adicionando : t.pagamento.adicionarCartao}</button
        >
        <button
          type="button"
          class="link-mini"
          disabled={ocupadoPagamento}
          onclick={() => comPagamento(() => api.adicionarPagamento('pix'))}
          >{t.pagamento.adicionarPix}</button
        >
      </div>

      <p class="nota">{t.pagamento.demonstracao}</p>
    </section>
  </div>
{/if}

<style>
  /* Base é o telefone: uma coluna, campos inteiros, alvos de dedo. As duas
     colunas só entram quando há largura para elas. */
  .pilha {
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .painel {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    border: 2px solid var(--color-text);
    background: var(--color-surface);
    padding: 24px 20px;
    width: 100%;
    box-sizing: border-box;
  }
  /* O painel do segundo fator tem largura de leitura porque é texto; um
     formulário de endereço precisa de mais, senão CEP e número disputam a
     mesma linha estreita. */
  .largo { max-width: 78ch; }

  .sub {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin: 0;
  }
  .texto { margin: 0; font-size: 14.5px; line-height: 1.6; }
  .texto-solto { padding: 20px 0; color: var(--color-neutral-700); }
  .meta { margin: 0; font-size: 12.5px; color: var(--color-neutral-700); }
  .nota {
    margin: 0;
    padding-top: 16px;
    border-top: 1px solid var(--color-divider);
    width: 100%;
    box-sizing: border-box;
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--color-neutral-700);
  }
  .dica { font-weight: 400; color: var(--color-neutral-600); }

  .grade {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
    width: 100%;
  }
  .grade .field { min-width: 0; }

  /* — foto — */
  .retrato {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    width: 100%;
  }
  .retrato-lado {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }
  .avatar {
    flex: none;
    width: 88px;
    height: 88px;
    object-fit: cover;
    display: block;
  }
  .avatar.vazio {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-neutral-900);
    color: var(--color-neutral-100);
    font-family: var(--font-display, var(--font-body));
    font-size: 30px;
    letter-spacing: 0.02em;
  }
  /* Um <input type="file"> nativo não se estiliza; o botão ao lado é que o
     aciona. Ele continua no fluxo para o foco do teclado não se perder. */
  .escondido {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  /* — escolhas — */
  .escolha {
    border: 0;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .escolha legend {
    padding: 0 0 10px;
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--color-neutral-700);
  }
  .escolha label,
  .marcar {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14.5px;
    cursor: pointer;
    /* 44 px de alvo no dedo sem inchar a linha na tela grande. */
    padding: 6px 0;
  }
  .escolha input,
  .marcar input {
    width: 18px;
    height: 18px;
    accent-color: var(--color-accent-600);
  }

  /* — pagamento — */
  .metodos {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    border-top: 1px solid var(--color-divider);
  }
  .metodos li {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px 16px;
    padding: 14px 0;
    border-bottom: 1px solid var(--color-divider);
  }
  .metodo-nome {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1 1 12ch;
    min-width: 0;
  }
  .forte { font-size: 14.5px; font-weight: 600; letter-spacing: 0.02em; }
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

  /* — comuns — */
  .acoes { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
  .rodape { padding-bottom: 4px; }
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
  .link-mini:disabled { color: var(--color-neutral-600); cursor: default; }
  .confirmado {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--color-accent-700);
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
  .erro.solto { max-width: 78ch; }

  @media (min-width: 621px) {
    .painel { padding: 30px 32px; gap: 20px; }
    .grade { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 24px; }
    .dois { grid-column: 1 / -1; }
    .escolha { flex-direction: row; gap: 26px; align-items: center; }
    .escolha legend { padding-bottom: 0; }
  }

  @media (pointer: coarse), (max-width: 620px) {
    .link-mini { padding: 15px 8px; margin: -15px -8px; }
  }
</style>
