<script>
  import { onMount } from 'svelte';
  import { api } from '$lib/api.js';
  import { rota, textos } from '$lib/conteudo/index.js';

  let { lang = 'pt' } = $props();
  const t = $derived(textos(lang).paginas.admin.orcamentos);

  let lista = $state([]);
  let rascunho = $state(null); // null = lista; objeto = formulário aberto
  let editandoId = $state(null); // null com rascunho != null = criação
  let previa = $state(null);
  let erro = $state('');
  let aviso = $state('');
  let copiado = $state('');

  onMount(carregar);

  async function carregar() {
    try {
      lista = await api.listarPropostas();
    } catch (e) {
      erro = e.message;
    }
  }

  /// Dinheiro entra em real e é guardado em centavo. Aceitar "6.000,00",
  /// "6000,00" e "6000" é o mínimo: ninguém digita do mesmo jeito, e recusar
  /// o formato de quem digita é recusar o trabalho de quem digita.
  function paraCentavos(texto) {
    const limpo = String(texto ?? '').replace(/[^\d,.-]/g, '');
    if (!limpo) return 0;
    const normal = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
    const n = Number(normal);
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  }

  const paraReais = (centavos) =>
    ((centavos ?? 0) / 100).toLocaleString(lang === 'en' ? 'en-US' : 'pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  async function novo() {
    erro = '';
    aviso = '';
    const modelo = await api.modeloProposta();
    rascunho = {
      ...modelo,
      instituicao: '',
      cidade: '',
      representante: '',
      maps_url: '',
      resumo: '',
      diagnosticoTexto: '',
      escopo: [{ titulo: '', descricao: '', centavos: 0 }]
    };
    editandoId = null;
    previa = null;
  }

  async function editar(item) {
    erro = '';
    aviso = '';
    try {
      const p = await api.proposta(item.id);
      rascunho = {
        instituicao: p.instituicao,
        cidade: p.cidade,
        representante: p.representante ?? '',
        maps_url: p.maps_url ?? '',
        titulo: p.titulo ?? '',
        resumo: p.resumo ?? '',
        disciplinas: p.disciplinas ?? '',
        objeto: p.objeto ?? '',
        diagnosticoTexto: (p.diagnostico ?? []).join('\n'),
        diretrizes: p.diretrizes ?? [],
        criterio_aceite: p.criterio_aceite ?? '',
        entregaveis: p.entregaveis ?? [],
        formato_entrega: p.formato_entrega ?? 'PDF',
        prazo_dias: p.prazo_dias ?? 45,
        prazo_condicao: p.prazo_condicao ?? '',
        incluso: p.incluso ?? '',
        nao_incluso: p.nao_incluso ?? '',
        premissas: p.premissas ?? [],
        // A prévia devolve valor formatado; o formulário precisa do centavo.
        escopo: p.escopo.map((e) => ({
          titulo: e.titulo,
          descricao: e.descricao,
          centavos: paraCentavos(e.valor)
        })),
        desconto_pct: p.desconto_pct,
        desconto_motivo: p.desconto_motivo ?? '',
        entrada_pct: p.pagamento.entrada_pct,
        parcelas: p.pagamento.parcelas,
        desconto_avista_pct: p.pagamento.desconto_avista_pct,
        validade_dias: p.validade_dias,
        aditivo: p.aditivo
          ? {
              ...p.aditivo,
              itens: p.aditivo.itens.map((i) => ({ t: i.t, d: i.d, centavos: paraCentavos(i.valor) }))
            }
          : null,
        travada: !!p.aceita_em
      };
      editandoId = item.id;
      await atualizarPrevia();
    } catch (e) {
      erro = e.message;
    }
  }

  /// O que vai para a API: o formulário guarda o diagnóstico como texto com
  /// uma linha por achado, porque é assim que se escreve; a API quer a lista.
  function paraApi(r) {
    const { diagnosticoTexto, travada, ...resto } = r;
    return {
      ...resto,
      diagnostico: (diagnosticoTexto ?? '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
    };
  }

  async function atualizarPrevia() {
    if (!rascunho) return;
    try {
      previa = await api.previaProposta(paraApi(rascunho));
    } catch {
      previa = null;
    }
  }

  async function salvar() {
    erro = '';
    aviso = '';
    try {
      if (editandoId) {
        await api.salvarProposta(editandoId, paraApi(rascunho));
      } else {
        const criada = await api.criarProposta(paraApi(rascunho));
        editandoId = criada.id;
      }
      aviso = t.acoes.salvo;
      await carregar();
    } catch (e) {
      erro = e.message;
    }
  }

  async function enviar(id) {
    erro = '';
    try {
      await api.enviarProposta(id);
      await carregar();
    } catch (e) {
      erro = e.message;
    }
  }

  /// O link do cliente é absoluto de propósito: ele vai para o WhatsApp, e um
  /// caminho relativo colado numa conversa não abre nada.
  const linkCliente = (item) =>
    (typeof location === 'undefined' ? '' : location.origin) + rota(item.link, lang);

  async function copiar(item) {
    const url = linkCliente(item);
    try {
      await navigator.clipboard.writeText(url);
      copiado = item.id;
      setTimeout(() => (copiado = ''), 2400);
    } catch {
      // Sem permissão de área de transferência ainda dá para copiar à mão.
      erro = url;
    }
  }

  function addItem() {
    rascunho.escopo = [...rascunho.escopo, { titulo: '', descricao: '', centavos: 0 }];
  }

  function removerItem(i) {
    rascunho.escopo = rascunho.escopo.filter((_, k) => k !== i);
    atualizarPrevia();
  }

  const situacaoLabel = (s) => t.situacoes[s] ?? s;
</script>

{#if erro}
  <p class="erro">{erro}</p>
{/if}

{#if !rascunho}
  <!-- ————— a lista ————— -->
  <div class="topo">
    <button type="button" class="btn-solid compacto" onclick={novo}>{t.novo}</button>
  </div>

  {#if lista.length === 0}
    <p class="vazio">{t.vazio}</p>
  {:else}
    <div class="cartoes">
      {#each lista as item}
        <div class="cartao">
          <div class="cabeca">
            <span class="numero">{item.numero}</span>
            <span class="situacao" data-s={item.situacao}>{situacaoLabel(item.situacao)}</span>
          </div>
          <div class="cliente">{item.instituicao}</div>
          <div class="meta">{item.cidade} · {t.itens(item.itens)}</div>
          <div class="valor display">{item.total}</div>
          <div class="meta">{item.enviada_em} · {t.expiraEm(item.dias_restantes)}</div>
          <div class="acoes">
            <button type="button" class="acao" onclick={() => editar(item)}>{t.acoes.editar}</button>
            <a class="acao" href={rota(item.link, lang)} target="_blank" rel="noreferrer">{t.acoes.abrir}</a>
            <button type="button" class="acao" onclick={() => copiar(item)}>
              {copiado === item.id ? t.acoes.copiado : t.acoes.copiar}
            </button>
            <a
              class="acao"
              href="{rota(item.link, lang)}&imprimir=1"
              target="_blank"
              rel="noreferrer">{t.acoes.pdf}</a
            >
            {#if item.situacao === 'rascunho'}
              <button type="button" class="acao forte" onclick={() => enviar(item.id)}>{t.acoes.enviar}</button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
{:else}
  <!-- ————— o formulário ————— -->
  <div class="topo">
    <button type="button" class="acao" onclick={() => ((rascunho = null), (previa = null))}>{t.voltar}</button>
    {#if aviso}<span class="aviso">{aviso}</span>{/if}
  </div>

  {#if rascunho.travada}
    <p class="travada">{t.travada}</p>
  {/if}

  <div class="oficina">
    <div class="formulario">
      <fieldset disabled={rascunho.travada}>
        <div class="secao">{t.secoes.cliente}</div>
        <div class="par">
          <label class="campo">
            <span class="label">{t.campos.instituicao}</span>
            <input class="entrada" bind:value={rascunho.instituicao} autocomplete="organization" />
          </label>
          <label class="campo">
            <span class="label">{t.campos.cidade}</span>
            <input class="entrada" bind:value={rascunho.cidade} autocomplete="address-level2" />
          </label>
          <label class="campo">
            <span class="label">{t.campos.representante}</span>
            <input class="entrada" bind:value={rascunho.representante} autocomplete="name" />
          </label>
          <label class="campo">
            <span class="label">{t.campos.maps_url}</span>
            <input class="entrada" bind:value={rascunho.maps_url} inputmode="url" />
          </label>
        </div>

        <div class="secao">{t.secoes.documento}</div>
        <label class="campo">
          <span class="label">{t.campos.titulo}</span>
          <input class="entrada" bind:value={rascunho.titulo} />
        </label>
        <label class="campo">
          <span class="label">{t.campos.resumo}</span>
          <textarea class="entrada" rows="2" bind:value={rascunho.resumo}></textarea>
        </label>
        <label class="campo">
          <span class="label">{t.campos.disciplinas}</span>
          <input class="entrada" bind:value={rascunho.disciplinas} />
        </label>

        <div class="secao">{t.secoes.diagnostico}</div>
        <label class="campo">
          <span class="label">{t.campos.diagnostico}</span>
          <textarea class="entrada" rows="7" bind:value={rascunho.diagnosticoTexto}></textarea>
        </label>

        <div class="secao">{t.secoes.escopo}</div>
        {#each rascunho.escopo as item, i}
          <div class="item">
            <label class="campo">
              <span class="label">{t.campos.itemTitulo}</span>
              <input class="entrada" bind:value={item.titulo} onchange={atualizarPrevia} />
            </label>
            <label class="campo">
              <span class="label">{t.campos.itemValor}</span>
              <input
                class="entrada"
                inputmode="decimal"
                value={paraReais(item.centavos)}
                onchange={(ev) => {
                  item.centavos = paraCentavos(ev.currentTarget.value);
                  ev.currentTarget.value = paraReais(item.centavos);
                  atualizarPrevia();
                }}
              />
            </label>
            <label class="campo largo">
              <span class="label">{t.campos.itemDescricao}</span>
              <textarea class="entrada" rows="2" bind:value={item.descricao}></textarea>
            </label>
            {#if rascunho.escopo.length > 1}
              <button type="button" class="acao" onclick={() => removerItem(i)}>{t.campos.removerItem}</button>
            {/if}
          </div>
        {/each}
        <button type="button" class="acao forte" onclick={addItem}>{t.campos.addItem}</button>

        <div class="secao">{t.secoes.condicoes}</div>
        <div class="par">
          <label class="campo">
            <span class="label">{t.campos.descontoPct}</span>
            <input
              class="entrada"
              inputmode="numeric"
              bind:value={rascunho.desconto_pct}
              onchange={atualizarPrevia}
            />
          </label>
          <label class="campo">
            <span class="label">{t.campos.descontoMotivo}</span>
            <input class="entrada" bind:value={rascunho.desconto_motivo} />
          </label>
          <label class="campo">
            <span class="label">{t.campos.entradaPct}</span>
            <input
              class="entrada"
              inputmode="numeric"
              bind:value={rascunho.entrada_pct}
              onchange={atualizarPrevia}
            />
          </label>
          <label class="campo">
            <span class="label">{t.campos.parcelas}</span>
            <input
              class="entrada"
              inputmode="numeric"
              bind:value={rascunho.parcelas}
              onchange={atualizarPrevia}
            />
          </label>
          <label class="campo">
            <span class="label">{t.campos.avistaPct}</span>
            <input
              class="entrada"
              inputmode="numeric"
              bind:value={rascunho.desconto_avista_pct}
              onchange={atualizarPrevia}
            />
          </label>
          <label class="campo">
            <span class="label">{t.campos.validadeDias}</span>
            <input class="entrada" inputmode="numeric" bind:value={rascunho.validade_dias} />
          </label>
          <label class="campo">
            <span class="label">{t.campos.prazoDias}</span>
            <input class="entrada" inputmode="numeric" bind:value={rascunho.prazo_dias} />
          </label>
          <label class="campo">
            <span class="label">{t.campos.prazoCondicao}</span>
            <input class="entrada" bind:value={rascunho.prazo_condicao} />
          </label>
        </div>

        <!-- O texto que quase nunca muda fica fechado: ele existe, dá para
             editar, e não disputa atenção com o que muda a cada cliente. -->
        <details class="avancado">
          <summary>{t.secoes.avancado}</summary>
          <label class="campo">
            <span class="label">{t.campos.objeto}</span>
            <textarea class="entrada" rows="4" bind:value={rascunho.objeto}></textarea>
          </label>
          <label class="campo">
            <span class="label">{t.campos.criterio}</span>
            <textarea class="entrada" rows="3" bind:value={rascunho.criterio_aceite}></textarea>
          </label>
          <label class="campo">
            <span class="label">{t.campos.incluso}</span>
            <textarea class="entrada" rows="3" bind:value={rascunho.incluso}></textarea>
          </label>
          <label class="campo">
            <span class="label">{t.campos.naoIncluso}</span>
            <textarea class="entrada" rows="3" bind:value={rascunho.nao_incluso}></textarea>
          </label>
        </details>

        <div class="fim">
          <button type="button" class="btn-solid compacto" onclick={salvar}>
            {editandoId ? t.acoes.salvar : t.acoes.criar}
          </button>
        </div>
      </fieldset>
    </div>

    <!-- ————— o espelho ————— -->
    <aside class="espelho">
      <div class="secao">{t.resumo.titulo}</div>
      {#if !previa}
        <p class="meta">{t.resumo.semItens}</p>
      {:else}
        <div class="linha"><span>{t.resumo.subtotal}</span><span>{previa.subtotal}</span></div>
        {#if previa.desconto_pct > 0}
          <div class="linha"><span>{t.resumo.desconto} · {previa.desconto_pct}%</span><span>−{previa.desconto}</span></div>
        {/if}
        <div class="linha total"><span>{t.resumo.total}</span><span>{previa.total}</span></div>

        <div class="secao">{t.resumo.plano}</div>
        {#each previa.pagamento.linhas as l}
          <div class="linha"><span>{l.rotulo}</span><span>{l.valor}</span></div>
        {/each}
        <div class="linha">
          <span>{t.resumo.avista} · {previa.pagamento.desconto_avista_pct}%</span>
          <span>{previa.pagamento.avista}</span>
        </div>
        <div class="meta">{t.resumo.economia} {previa.pagamento.economia_avista}</div>

        {#if previa.aditivo}
          <div class="secao">{t.resumo.aditivo}</div>
          <div class="linha">
            <span>{previa.aditivo.cortesia ? t.resumo.cortesia : ''}</span>
            <span>{previa.aditivo.total}</span>
          </div>
        {/if}
      {/if}
    </aside>
  </div>
{/if}

<style>
  /* Mobile first: a base é o telefone — uma coluna do começo ao fim — e as
     colunas entram quando existe largura para elas. */
  .topo {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 22px;
  }
  .erro {
    border-left: 4px solid var(--color-accent-600);
    padding: 10px 14px;
    margin: 0 0 18px;
    font-size: 13px;
    overflow-wrap: anywhere;
  }
  .aviso { font-size: 12.5px; color: var(--color-neutral-700); }
  .vazio { font-size: 14px; line-height: 1.6; color: var(--color-neutral-700); max-width: 60ch; }
  .travada {
    border: 2px solid var(--color-accent-600);
    padding: 12px 14px;
    margin: 0 0 20px;
    font-size: 13px;
    line-height: 1.55;
    max-width: 70ch;
  }

  .cartoes { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
  .cartao {
    border: 2px solid var(--color-divider);
    background: var(--color-surface);
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }
  .cabeca { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; }
  .numero { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--color-neutral-700); }
  .situacao {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    padding: 3px 8px;
    border: 1px solid currentColor;
  }
  /* A situação é a primeira coisa que se procura numa lista de orçamentos:
     ela merece cor própria, não só uma palavra. */
  .situacao[data-s='rascunho'] { color: var(--color-neutral-600); }
  .situacao[data-s='enviada'] { color: var(--color-accent-700); }
  .situacao[data-s='aceita'] { color: var(--color-text); background: var(--color-accent-600); border-color: var(--color-accent-600); }
  .situacao[data-s='expirada'] { color: var(--color-neutral-500); }
  .cliente { font-size: 16px; font-weight: 600; line-height: 1.3; }
  .valor { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
  .meta { font-size: 12px; color: var(--color-neutral-700); line-height: 1.5; }

  .acoes { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 4px; }
  .acao {
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
    text-decoration: none;
    text-align: left;
  }
  .acao.forte { color: var(--color-text); text-decoration: underline; }

  .oficina { display: grid; grid-template-columns: minmax(0, 1fr); gap: 30px; }
  fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
  fieldset[disabled] { opacity: 0.55; }
  .secao {
    font-size: 10.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    border-bottom: 2px solid var(--color-text);
    padding-bottom: 7px;
    margin: 30px 0 16px;
  }
  .secao:first-child { margin-top: 0; }
  .par { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
  .campo { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .campo .entrada {
    padding: 11px 12px;
    border: 2px solid var(--color-divider);
    background: var(--color-surface);
    color: var(--color-text);
    outline: none;
    width: 100%;
    box-sizing: border-box;
  }
  .item {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 0 14px;
    border-left: 3px solid var(--color-divider);
    padding: 14px 0 4px 14px;
    margin-bottom: 12px;
  }
  .avancado { margin-top: 26px; }
  .avancado summary {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    cursor: pointer;
    padding: 12px 0;
  }
  .fim { margin-top: 28px; }

  .espelho {
    border: 2px solid var(--color-text);
    background: var(--color-surface);
    padding: 20px 22px;
    align-self: start;
  }
  .linha {
    display: flex;
    justify-content: space-between;
    gap: 6px 16px;
    flex-wrap: wrap;
    font-size: 13px;
    line-height: 1.5;
    padding: 6px 0;
    border-bottom: 1px solid var(--color-divider);
  }
  .linha.total { font-weight: 700; border-bottom-width: 2px; border-bottom-color: var(--color-text); }

  @media (min-width: 720px) {
    .cartoes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .par { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .item { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); }
    .item .largo { grid-column: 1 / -1; }
  }
  @media (min-width: 1080px) {
    .oficina { grid-template-columns: minmax(0, 1fr) 320px; gap: 40px; }
    .espelho { position: sticky; top: 24px; }
  }
</style>
