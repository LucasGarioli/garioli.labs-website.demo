<script>
  import Seo from '$lib/Seo.svelte';
  import { api } from '$lib/api.js';
  import { empresa } from '$lib/identidade.js';
  import { rota, textos } from '$lib/conteudo/index.js';
  import { REGRA_CAMPO, campoValido, teclado } from '$lib/documento.js';

  let { lang = 'pt' } = $props();
  const t = $derived(textos(lang).paginas.proposta);

  const ID_PADRAO = 'PRJ-2026-0091';

  /// O endereço que vai impresso no PDF precisa ser absoluto: o arquivo é
  /// aberto fora do site, e um caminho relativo dentro dele não leva a lugar
  /// nenhum. Em SSR não há `location`, e a página é renderizada de novo no
  /// navegador — onde há.
  const linkPublico = $derived(
    typeof location === 'undefined' || !proposta
      ? ''
      : `${location.origin}${rota('/proposta', lang)}?id=${encodeURIComponent(proposta.id)}`
  );

  let etapa = $state('proposta'); // proposta | dados | contrato | assinado
  let proposta = $state(null);
  let contrato = $state(null);
  let erro = $state('');
  let observacoes = $state('');
  let dados = $state({});
  let duvida = $state('');
  let resposta = $state('');
  /// A forma de pagamento é escolhida aqui e vai junto com o aceite: o
  /// contrato tem de dizer um valor, e um documento que oferece dois é um
  /// documento que ainda vai ser discutido.
  let forma = $state('parcelado');

  const CAMPOS_CONTRATO = $derived(t.dados.campos);

  $effect(() => {
    const busca = new URLSearchParams(location.search);
    const id = busca.get('id') ?? ID_PADRAO;
    api
      .proposta(id)
      .then((p) => {
        proposta = p;
        /// `?imprimir=1` e' o "Exportar PDF" do painel. Chamar `print()` antes
        /// do documento existir na tela imprime uma pagina em branco, entao a
        /// chamada espera o quadro seguinte a pintura.
        if (busca.get('imprimir') === '1') {
          requestAnimationFrame(() => requestAnimationFrame(() => print()));
        }
      })
      .catch((e) => (erro = e.message));
  });

  async function aceitar() {
    proposta = await api.aceitarProposta(proposta.id, { observacoes, forma });
    etapa = 'dados';
  }

  async function enviarDados() {
    contrato = await api.dadosContrato(proposta.id, dados);
    etapa = 'contrato';
  }

  async function assinar() {
    contrato = await api.assinarContrato(contrato.id, { provedor: 'gov.br' });
    etapa = 'assinado';
  }

  /// Máscara aplicada na digitação: quem preenche um CNPJ vê um CNPJ, e o
  /// campo não aceita letra.
  function digitar(c, ev) {
    const regra = REGRA_CAMPO[c.k];
    dados[c.k] = regra ? regra.mascara(ev.currentTarget.value) : ev.currentTarget.value;
  }

  /// O erro só aparece depois que há o que corrigir — campo vazio ainda não é
  /// campo errado.
  function erroDe(c) {
    const v = dados[c.k] ?? '';
    if (!v.trim() || campoValido(c.k, v)) return '';
    const regra = REGRA_CAMPO[c.k];
    return regra ? t.dados.erros[regra.erro] : t.dados.erros.curto;
  }

  const dadosCompletos = $derived(CAMPOS_CONTRATO.every((c) => campoValido(c.k, dados[c.k])));

  /// A API devolve ISO — é o que o backend Axum grava e o que a trilha de
  /// auditoria compara. Quem lê a confirmação de um contrato assinado, não.
  const dataHora = (iso) =>
    new Date(iso).toLocaleString(lang === 'en' ? 'en-GB' : 'pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  const temErro = $derived(CAMPOS_CONTRATO.some((c) => erroDe(c) !== ''));
</script>

<Seo {lang} caminho="/proposta" titulo={t.titulo} descricao={t.titulo} indexar={false} />

<div class="rule" style="display:flex;align-items:center;gap:20px;padding:16px 40px;flex-wrap:wrap">
  <a href={rota('/', lang)} class="display" title={textos(lang).nav.inicio}
     style="font-size:16px;color:inherit;text-decoration:none">GARIOLI LABS</a>
  <span style="flex:1"></span>
  {#each t.etapas as [id, label]}
    <span style="font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:{etapa === id ? 700 : 500};color:{etapa === id ? 'var(--color-accent-700)' : 'var(--color-neutral-600)'}">{label}</span>
  {/each}
</div>

{#if erro}
  <p style="padding:60px 40px;color:var(--color-accent-700)">{erro}</p>
{:else if !proposta}
  <p style="padding:60px 40px;color:var(--color-neutral-700)">{t.carregando}</p>
{:else}
  <div class="folha">
    <div class="corpo">
      {#if etapa === 'proposta'}
        <div class="kicker" style="margin-bottom:14px">{t.kicker} · {proposta.id}</div>
        <h1 class="display" style="font-size:40px;line-height:1.05;margin:0 0 6px">{proposta.instituicao}</h1>
        <p style="font-size:13.5px;color:var(--color-neutral-700);margin:0 0 4px">
          {proposta.cidade} · <a href={proposta.maps_url} target="_blank" rel="noreferrer">{t.maps}</a>
        </p>
        <!-- Um documento comercial sem data e sem número não é um documento.
             As duas datas saem do mesmo deslocamento que o painel do dono usa
             para dizer que esta proposta expira. -->
        <p style="font-size:13px;color:var(--color-neutral-700);margin:0 0 34px">
          {t.enviadaEm(proposta.enviada_em)} · {t.valeAte(proposta.expira_em)}
          <span style="color:{proposta.dias_restantes <= 3 ? 'var(--color-accent-700)' : 'inherit'};font-weight:{proposta.dias_restantes <= 3 ? 700 : 400}"
            >· {t.restam(proposta.dias_restantes)}</span>
        </p>

        {#if proposta.titulo}
          <p class="frase-projeto">{proposta.titulo}</p>
        {/if}
        {#if proposta.resumo}
          <p class="paragrafo">{proposta.resumo}</p>
        {/if}

        {#if proposta.objeto}
          <div class="secao-doc">{t.objeto}</div>
          <p class="paragrafo">{proposta.objeto}</p>
        {/if}

        <!-- O diagnóstico vem antes do preço de propósito: um valor sem o
             problema que ele resolve é um número solto, e número solto se
             compara com o do concorrente em vez de com o problema. -->
        {#if proposta.diagnostico.length}
          <div class="secao-doc">{t.diagnostico}</div>
          <p class="nota-secao">{t.diagnosticoNota}</p>
          <ul class="achados">
            {#each proposta.diagnostico as d}<li>{d}</li>{/each}
          </ul>
        {/if}

        {#if proposta.diretrizes.length}
          <div class="secao-doc">{t.diretrizes}</div>
          {#each proposta.diretrizes as d}
            <div class="row linha-premissa" style="padding:12px 0">
              <span style="font-size:14px;font-weight:600;line-height:1.4">{d.t}</span>
              <span style="font-size:13.5px;line-height:1.55;color:var(--color-neutral-800)">{d.d}</span>
            </div>
          {/each}
        {/if}

        <div class="secao-doc">{t.escopo}</div>
        {#each proposta.escopo as e}
          <div class="row linha-valor" style="align-items:baseline;padding:14px 0">
            <span style="display:flex;flex-direction:column;gap:3px">
              <span style="font-size:15.5px;font-weight:600">{e.titulo}</span>
              <span style="font-size:13px;line-height:1.5;color:var(--color-neutral-700)">{e.descricao}</span>
            </span>
            <span class="display" style="font-size:15px;font-weight:700;text-align:right">{e.valor}</span>
          </div>
        {/each}

        <!-- Subtotal e desconto explícitos: sem eles o leitor tem de somar
             três linhas de cabeça para saber se os 10% são verdade. -->
        <div class="linha-valor" style="padding:14px 0 0;border-top:1px solid var(--color-divider);font-size:14px">
          <span class="label" style="letter-spacing:0.1em">{t.subtotal}</span>
          <span style="text-align:right">{proposta.subtotal}</span>
        </div>
        <div class="linha-valor" style="padding:8px 0 0;font-size:14px;color:var(--color-accent-700)">
          <span class="label" style="letter-spacing:0.1em;color:inherit">{t.desconto(proposta.desconto_pct)}</span>
          <span style="text-align:right">−{proposta.desconto}</span>
        </div>

        {#if proposta.entregaveis.length}
          <div class="secao-doc">{t.entregaveis}</div>
          {#each proposta.entregaveis as e}
            <div class="row linha-premissa" style="padding:12px 0">
              <span style="font-size:14px;font-weight:600;line-height:1.4">{e.disciplina}</span>
              <span style="font-size:13.5px;line-height:1.55;color:var(--color-neutral-800)">{e.documentacao}</span>
            </div>
          {/each}
        {/if}

        {#if proposta.prazo_dias}
          <div class="secao-doc">{t.prazo}</div>
          <p class="paragrafo"><strong>{t.prazoTexto(proposta.prazo_dias)}</strong> — {proposta.prazo_condicao}</p>
        {/if}

        {#if proposta.incluso}
          <div class="secao-doc">{t.incluso}</div>
          <p class="paragrafo">{proposta.incluso}</p>
        {/if}
        {#if proposta.nao_incluso}
          <div class="secao-doc">{t.naoIncluso}</div>
          <p class="paragrafo">{proposta.nao_incluso}</p>
        {/if}
        {#if proposta.criterio_aceite}
          <div class="secao-doc">{t.criterio}</div>
          <p class="paragrafo">{proposta.criterio_aceite}</p>
        {/if}

        <div class="secao-doc">{t.premissas}</div>
        {#each proposta.premissas as p}
          <div class="row linha-premissa" style="padding:12px 0;font-size:14.5px">
            <span class="label" style="padding-top:2px">{p.label}</span>
            <span style="line-height:1.5">{p.valor}</span>
          </div>
        {/each}

        <div style="display:flex;justify-content:space-between;align-items:baseline;padding:20px 0;border-bottom:2px solid var(--color-text);margin-top:34px">
          <span class="label" style="font-weight:700;letter-spacing:0.14em">{t.total}</span>
          <span class="display" style="font-size:26px">{proposta.total}</span>
        </div>
        <!-- O plano linha a linha, como ele vai ser cobrado. Ele é impresso,
             não recalculado: a conta é uma só, e mora na API. -->
        <div class="secao-doc">{t.planoTitulo}</div>
        {#each proposta.pagamento.linhas as l}
          <div class="row linha-valor" style="padding:11px 0;font-size:14px">
            <span>{l.rotulo}</span>
            <span class="display" style="font-weight:700;text-align:right">{l.valor}</span>
          </div>
        {/each}

        {#if proposta.aditivo}
          <div class="secao-doc">{proposta.aditivo.titulo}</div>
          <p class="paragrafo">{proposta.aditivo.resumo}</p>
          {#each proposta.aditivo.itens as i}
            <div class="row linha-valor" style="align-items:baseline;padding:12px 0">
              <span style="display:flex;flex-direction:column;gap:3px">
                <span style="font-size:14.5px;font-weight:600">{i.t}</span>
                <span style="font-size:13px;line-height:1.5;color:var(--color-neutral-700)">{i.d}</span>
              </span>
              <span class="display" style="font-size:14px;font-weight:700;text-align:right">{i.valor}</span>
            </div>
          {/each}
          <div class="linha-valor" style="padding:14px 0 0;border-top:2px solid var(--color-text);font-size:14px">
            <span class="label" style="letter-spacing:0.1em">{t.aditivoSec.valorDe}</span>
            <span class="display" style="text-align:right;font-weight:700">{proposta.aditivo.total}</span>
          </div>
          {#if proposta.aditivo.cortesia}
            <p class="cortesia">{t.aditivoSec.cortesia}</p>
          {/if}
          <div class="row linha-premissa" style="padding:12px 0">
            <span class="label" style="padding-top:2px">{t.aditivoSec.dimensao}</span>
            <span style="font-size:13.5px;line-height:1.55">{proposta.aditivo.dimensao}</span>
          </div>
          <div class="row linha-premissa" style="padding:12px 0">
            <span class="label" style="padding-top:2px">{t.aditivoSec.condicoes}</span>
            <span style="font-size:13.5px;line-height:1.55">{proposta.aditivo.condicoes}</span>
          </div>
          <p class="nota-secao">{t.aditivoSec.validade(proposta.aditivo.validade_meses)}</p>
        {/if}

        <!-- Só no papel: num PDF mandado pelo WhatsApp não há botão que
             funcione, então o que vai é o endereço — clicável para quem abre
             o arquivo, e escrito por extenso para quem recebeu uma foto
             dele. -->
        <div class="so-impressao">
          <div class="secao-doc">{t.impressao.titulo}</div>
          <p class="paragrafo">{t.impressao.texto}</p>
          <p class="endereco"><a href={linkPublico}>{linkPublico}</a></p>
        </div>

        <div class="caixa-aceite">
          <div class="label" style="letter-spacing:0.14em;margin-bottom:14px">{t.pagamento.titulo}</div>
          <div class="par" style="gap:12px;margin-bottom:26px">
            {#each [['parcelado', t.pagamento.parcelado(proposta.pagamento.parcelas, proposta.pagamento.parcela), t.pagamento.parceladoDet], ['avista', t.pagamento.avista(proposta.pagamento.avista), t.pagamento.avistaDet(proposta.pagamento.desconto_avista_pct)]] as [chave, rotulo, detalhe]}
              <label style="display:flex;flex-direction:column;gap:5px;cursor:pointer;padding:16px 18px;border:2px solid {forma === chave ? 'var(--color-text)' : 'var(--color-divider)'};background:{forma === chave ? 'var(--color-surface)' : 'transparent'}">
                <span style="display:flex;align-items:center;gap:9px;font-size:14.5px;font-weight:600">
                  <input type="radio" value={chave} bind:group={forma} style="accent-color:var(--color-accent-600);margin:0" />
                  {rotulo}
                </span>
                <span style="font-size:12.5px;line-height:1.5;color:var(--color-neutral-700);padding-left:24px">{detalhe}</span>
              </label>
            {/each}
          </div>

          <div class="label" style="letter-spacing:0.14em;margin-bottom:14px">{t.observacoes}</div>
          <textarea
            class="entrada"
            bind:value={observacoes}
            rows="4"
            placeholder={t.observacoesPh}
            style="width:100%;box-sizing:border-box;padding:14px;border:2px solid var(--color-divider);background:var(--color-surface);color:var(--color-text);outline:none"
          ></textarea>
          <button class="btn-solid" style="margin-top:18px" type="button" onclick={aceitar}>{t.aceitar}</button>
          <p style="font-size:12.5px;line-height:1.55;color:var(--color-neutral-700);margin:16px 0 0">
            {t.notaAceite}
          </p>
        </div>

      {:else if etapa === 'dados'}
        <div class="kicker" style="margin-bottom:14px">{t.dados.kicker}</div>
        <h1 class="display" style="font-size:36px;line-height:1.05;margin:0 0 12px">{t.dados.titulo}</h1>
        <p style="font-size:14.5px;line-height:1.65;color:var(--color-neutral-800);margin:0 0 34px;max-width:60ch">
          {t.dados.sub}
        </p>
        <div class="par">
          {#each CAMPOS_CONTRATO as c}
            <label class="campo" data-largo={c.span === 'span 2'}>
              <span class="label" style="letter-spacing:0.14em">{c.label}</span>
              <input
                type="text"
                class="entrada"
                value={dados[c.k] ?? ''}
                oninput={(ev) => digitar(c, ev)}
                {...teclado(c.k)}
                style="padding:13px 14px;border:2px solid {erroDe(c) ? 'var(--color-accent-600)' : 'var(--color-divider)'};background:var(--color-surface);color:var(--color-text);outline:none"
              />
              <!-- O CNPJ que for digitado aqui é o que identifica a parte na
                   cláusula 1ª. Dizer qual campo está errado, e por quê, custa
                   uma linha; descobrir depois custa uma cobrança. -->
              {#if erroDe(c)}
                <span style="font-size:12px;color:var(--color-accent-700)">{erroDe(c)}</span>
              {/if}
            </label>
          {/each}
        </div>
        <div style="display:flex;gap:14px;align-items:center;margin-top:28px;flex-wrap:wrap">
          <button class="btn-solid" type="button" disabled={!dadosCompletos} onclick={enviarDados}>{t.dados.gerar}</button>
          <span style="font-size:13px;color:var(--color-neutral-700)">
            <!-- "Preencha todos os campos" ao lado de um campo preenchido e
                 marcado em vermelho manda a pessoa procurar o que nao existe. -->
            {dadosCompletos ? t.dados.pronto : temErro ? t.dados.corrija : t.dados.incompleto}
          </span>
        </div>
        <p style="font-size:12.5px;color:var(--color-neutral-700);margin:18px 0 0">{t.dados.idioma}</p>

      {:else if etapa === 'contrato'}
        <div class="kicker" style="margin-bottom:14px">{t.contrato.kicker} · {contrato.numero}</div>
        <h1 class="display" style="font-size:36px;line-height:1.05;margin:0 0 26px">{t.contrato.titulo}</h1>
        <div style="border:2px solid var(--color-divider);background:var(--color-surface);padding:32px 34px;max-height:520px;overflow:auto">
          {#each contrato.clausulas as c}
            <div style="margin-bottom:22px">
              <div class="label" style="color:var(--color-accent-700);letter-spacing:0.14em;margin-bottom:7px">{c.titulo}</div>
              <p style="font-size:13.5px;line-height:1.7;margin:0;color:var(--color-neutral-800);text-wrap:pretty">{c.texto}</p>
            </div>
          {/each}
        </div>
        <div style="display:flex;gap:14px;align-items:center;margin-top:26px;flex-wrap:wrap">
          <button class="btn-solid" type="button" onclick={assinar}>{t.contrato.assinar}</button>
          <a class="btn-outline" href={contrato.pdf_url} target="_blank" rel="noreferrer">{t.contrato.pdf}</a>
          <a class="btn-outline" href={contrato.whatsapp_url} target="_blank" rel="noreferrer">{t.contrato.duvida}</a>
        </div>

      {:else}
        <div style="height:8px;background:var(--color-accent-600);width:80px;margin-bottom:30px"></div>
        <div class="kicker" style="margin-bottom:14px">{t.assinado.kicker}</div>
        <h1 class="display" style="font-size:40px;line-height:1.05;margin:0 0 18px">{t.assinado.titulo}</h1>
        <p style="font-size:16px;line-height:1.65;color:var(--color-neutral-800);margin:0 0 30px;max-width:58ch">
          {t.assinado.texto(contrato.numero, dataHora(contrato.assinado_em), contrato.provedor)}
        </p>
        <div style="display:flex;gap:14px;flex-wrap:wrap">
          <a class="btn-solid" href={rota('/conta', lang)}>{t.assinado.conta}</a>
          <a class="btn-outline" href={contrato.pdf_url} target="_blank" rel="noreferrer">{t.assinado.via}</a>
        </div>
      {/if}
    </div>

    <div class="lateral">
      <!-- O escopo e as premissas são o que o engenheiro escreveu para um
           cliente brasileiro, e continuam em português mesmo com a interface em
           inglês. Explicar isso é mais honesto do que traduzir um instrumento
           que será assinado em português. -->
      {#if t.ajuda.idiomaDoc}
        <div style="border:2px solid var(--color-divider);padding:20px 22px;font-size:12.5px;line-height:1.6;color:var(--color-neutral-700)">
          {t.ajuda.idiomaDoc}
        </div>
      {/if}
      <div style="border:2px solid var(--color-text);background:var(--color-surface);padding:24px">
        <div class="label" style="letter-spacing:0.14em;margin-bottom:12px">{t.ajuda.titulo}</div>
        <input
          type="text"
          class="entrada"
          bind:value={duvida}
          placeholder={t.ajuda.ph}
          style="width:100%;box-sizing:border-box;padding:12px 13px;border:2px solid var(--color-divider);background:var(--color-bg);color:var(--color-text);outline:none"
        />
        <button
          class="btn-solid compacto"
          style="margin-top:12px;width:100%"
          type="button"
          onclick={() => (resposta = t.ajuda.resposta)}
        >{t.ajuda.perguntar}</button>
        {#if resposta}
          <p style="font-size:13px;line-height:1.6;color:var(--color-neutral-800);margin:14px 0 0">{resposta}</p>
        {/if}
        <a
          href="https://wa.me/{empresa.foneE164.replace('+', '')}"
          target="_blank"
          rel="noreferrer"
          style="display:block;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;margin-top:16px;padding-top:16px;border-top:1px solid var(--color-divider)"
        >{t.ajuda.engenheiro}</a>
      </div>
      <!-- A validade da proposta só existe enquanto ela é proposta. Depois do
           aceite ela virou contrato, e repetir o prazo ao lado de um contrato
           assinado é dizer que ele expira. -->
      {#if etapa === 'proposta'}
        <div style="border:2px solid var(--color-divider);padding:22px 24px;font-size:12.5px;line-height:1.6;color:var(--color-neutral-700)">
          {t.ajuda.validade(proposta.expira_em, proposta.dias_restantes)}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* — o documento — */
  .secao-doc {
    font-size: 10.5px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--color-neutral-700);
    border-bottom: 2px solid var(--color-text);
    padding-bottom: 8px;
    margin-top: 38px;
  }
  .frase-projeto { font-size: 17px; line-height: 1.45; font-weight: 600; margin: 0 0 10px; }
  .paragrafo {
    font-size: 14.5px;
    line-height: 1.65;
    color: var(--color-neutral-800);
    margin: 16px 0 0;
    max-width: 68ch;
    text-wrap: pretty;
  }
  .nota-secao {
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--color-neutral-700);
    margin: 12px 0 0;
    max-width: 68ch;
  }
  .achados { margin: 14px 0 0; padding-left: 20px; max-width: 68ch; }
  .achados li { font-size: 14px; line-height: 1.6; margin-bottom: 8px; }
  .cortesia {
    font-size: 13px;
    font-weight: 700;
    color: var(--color-accent-700);
    margin: 12px 0 0;
  }
  .caixa-aceite { margin-top: 44px; border: 2px solid var(--color-text); padding: 28px 30px; }
  .endereco { font-size: 13px; margin: 10px 0 0; overflow-wrap: anywhere; }

  /* O bloco de aceite impresso não existe na tela: lá o botão funciona. */
  .so-impressao { display: none; }

  /* — o PDF —
     Não há gerador de PDF: o PDF é esta página impressa pelo navegador. Por
     isso o que sai daqui tem de ser o documento e nada mais — sem barra de
     etapas, sem coluna de apoio, sem formulário de aceite. */
  @media print {
    :global(html), :global(body) { background: #fff; }
    .so-impressao { display: block; }
    .rule, .lateral, .caixa-aceite { display: none !important; }
    .folha { display: block; }
    .corpo { padding: 0; max-width: none; }
    .secao-doc { break-after: avoid-page; }
    .achados li, .row { break-inside: avoid-page; }
    .paragrafo, .achados { max-width: none; }
    a { color: inherit; text-decoration: underline; }
    .endereco a { font-weight: 700; }
  }

  /* A proposta e' documento: em tela larga a coluna de apoio anda ao lado do
     texto; abaixo de 980 px ela nao cabe, e uma coluna de 380 px fixa passava
     por cima do escopo. Aqui ela desce e vira rodape do documento. */
  .folha {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    align-items: start;
  }
  .corpo { padding: 56px 48px 96px; max-width: 820px; margin: 0 auto; }
  .lateral {
    position: sticky;
    top: 0;
    padding: 56px 40px 56px 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .linha-valor {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 140px;
    gap: 18px;
  }
  .linha-premissa {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    gap: 18px;
  }
  .par { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .campo { display: flex; flex-direction: column; gap: 7px; }
  /* Atributo em vez de style inline: regra inline venceria a media query e o
     campo largo continuaria pedindo duas colunas onde só há uma. */
  .campo[data-largo='true'] { grid-column: span 2; }

  @media (max-width: 980px) {
    .folha { grid-template-columns: minmax(0, 1fr); }
    .corpo { padding: 48px 32px 40px; }
    .lateral { position: static; padding: 0 32px 72px; max-width: 820px; margin: 0 auto; width: 100%; }
  }

  @media (max-width: 620px) {
    .corpo { padding: 36px 20px 32px; }
    .lateral { padding: 0 20px 56px; }
    /* Preco embaixo do item, nao numa coluna de 140 px que nao existe mais. */
    .linha-valor { grid-template-columns: minmax(0, 1fr); gap: 4px; }
    .linha-valor > :last-child { text-align: left; }
    .linha-premissa { grid-template-columns: minmax(0, 1fr); gap: 3px; }
    .par { grid-template-columns: minmax(0, 1fr); }
    /* Sem a segunda coluna, "span 2" inventava uma e empurrava a pagina. */
    .campo[data-largo='true'] { grid-column: auto; }
  }
</style>
