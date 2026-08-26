<script>
  import { api } from '$lib/api.js';

  const ID_PADRAO = 'PRJ-2026-0091';

  let etapa = $state('proposta'); // proposta | dados | contrato | assinado
  let proposta = $state(null);
  let contrato = $state(null);
  let erro = $state('');
  let observacoes = $state('');
  let dados = $state({});
  let duvida = $state('');
  let resposta = $state('');

  const CAMPOS_CONTRATO = [
    { k: 'razao', label: 'Razão social / nome da instituição', span: 'span 2' },
    { k: 'cnpj', label: 'CNPJ ou CPF', span: 'span 1' },
    { k: 'endereco', label: 'Endereço completo com CEP', span: 'span 1' },
    { k: 'representante', label: 'Nome do representante legal', span: 'span 1' },
    { k: 'cpf_rep', label: 'CPF do representante', span: 'span 1' },
    { k: 'cargo', label: 'Cargo ou função do representante', span: 'span 1' },
    { k: 'email', label: 'E-mail para assinatura eletrônica', span: 'span 1' }
  ];

  $effect(() => {
    const id = new URLSearchParams(location.search).get('id') ?? ID_PADRAO;
    api.proposta(id).then((p) => (proposta = p)).catch((e) => (erro = e.message));
  });

  async function aceitar() {
    proposta = await api.aceitarProposta(proposta.id, { observacoes });
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

  const dadosCompletos = $derived(CAMPOS_CONTRATO.every((c) => (dados[c.k] ?? '').trim().length > 1));
</script>

<svelte:head><title>Proposta e contrato — Garioli Labs</title></svelte:head>

<div class="rule" style="display:flex;align-items:center;gap:20px;padding:16px 40px;flex-wrap:wrap">
  <span class="display" style="font-size:16px">GARIOLI LABS</span>
  <span style="flex:1"></span>
  {#each [['proposta', '01 Proposta'], ['dados', '02 Dados'], ['contrato', '03 Contrato'], ['assinado', '04 Assinatura']] as [id, label]}
    <span style="font-size:10.5px;letter-spacing:0.12em;text-transform:uppercase;font-weight:{etapa === id ? 700 : 500};color:{etapa === id ? 'var(--color-accent-700)' : 'var(--color-neutral-600)'}">{label}</span>
  {/each}
</div>

{#if erro}
  <p style="padding:60px 40px;color:var(--color-accent-700)">{erro}</p>
{:else if !proposta}
  <p style="padding:60px 40px;color:var(--color-neutral-700)">Carregando proposta…</p>
{:else}
  <div style="display:grid;grid-template-columns:minmax(0,1fr) 380px;align-items:start">
    <div style="padding:56px 48px 96px;max-width:820px;margin:0 auto">
      {#if etapa === 'proposta'}
        <div class="kicker" style="margin-bottom:14px">Proposta técnica e comercial</div>
        <h1 class="display" style="font-size:40px;line-height:1.05;margin:0 0 6px">{proposta.instituicao}</h1>
        <p style="font-size:13.5px;color:var(--color-neutral-700);margin:0 0 34px">
          {proposta.cidade} · <a href={proposta.maps_url} target="_blank" rel="noreferrer">Abrir no Google Maps</a>
        </p>

        <div class="label" style="letter-spacing:0.14em;border-bottom:2px solid var(--color-text);padding-bottom:8px">Escopo</div>
        {#each proposta.escopo as e}
          <div class="row" style="display:grid;grid-template-columns:minmax(0,1fr) 140px;gap:18px;align-items:baseline;padding:14px 0">
            <span style="display:flex;flex-direction:column;gap:3px">
              <span style="font-size:15.5px;font-weight:600">{e.titulo}</span>
              <span style="font-size:13px;line-height:1.5;color:var(--color-neutral-700)">{e.descricao}</span>
            </span>
            <span class="display" style="font-size:15px;font-weight:700;text-align:right">{e.valor}</span>
          </div>
        {/each}

        <div class="label" style="letter-spacing:0.14em;border-bottom:2px solid var(--color-text);padding-bottom:8px;margin-top:38px">Premissas do preço</div>
        {#each proposta.premissas as p}
          <div class="row" style="display:grid;grid-template-columns:220px minmax(0,1fr);gap:18px;padding:12px 0;font-size:14.5px">
            <span class="label" style="padding-top:2px">{p.label}</span>
            <span style="line-height:1.5">{p.valor}</span>
          </div>
        {/each}

        <div style="display:flex;justify-content:space-between;align-items:baseline;padding:20px 0;border-bottom:2px solid var(--color-text);margin-top:34px">
          <span class="label" style="font-weight:700;letter-spacing:0.14em">Total com desconto</span>
          <span class="display" style="font-size:26px">{proposta.total}</span>
        </div>
        <p style="font-size:13px;line-height:1.6;color:var(--color-neutral-700);margin:16px 0 0">{proposta.condicoes}</p>

        <div style="margin-top:44px;border:2px solid var(--color-text);padding:28px 30px">
          <div class="label" style="letter-spacing:0.14em;margin-bottom:14px">Observações antes de aceitar (opcional)</div>
          <textarea
            bind:value={observacoes}
            rows="4"
            placeholder="Alguma condição, prazo ou item que você quer registrar junto ao aceite."
            style="width:100%;box-sizing:border-box;font-family:var(--font-body);font-size:14.5px;padding:14px;border:2px solid var(--color-divider);background:var(--color-surface);color:var(--color-text);outline:none"
          ></textarea>
          <button class="btn-solid" style="margin-top:18px" type="button" onclick={aceitar}>Aceitar a proposta</button>
          <p style="font-size:12.5px;line-height:1.55;color:var(--color-neutral-700);margin:16px 0 0">
            O aceite registra data, hora e IP. Ele não substitui o contrato — é o passo que autoriza a
            geração dele com estes mesmos termos.
          </p>
        </div>

      {:else if etapa === 'dados'}
        <div class="kicker" style="margin-bottom:14px">Dados para o contrato</div>
        <h1 class="display" style="font-size:36px;line-height:1.05;margin:0 0 12px">Proposta aceita. Agora os dados.</h1>
        <p style="font-size:14.5px;line-height:1.65;color:var(--color-neutral-800);margin:0 0 34px;max-width:60ch">
          São os dados que entram na qualificação das partes. Se você não tiver algum agora, pode voltar
          por este mesmo link depois — a proposta permanece aceita.
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
          {#each CAMPOS_CONTRATO as c}
            <label style="display:flex;flex-direction:column;gap:7px;grid-column:{c.span}">
              <span class="label" style="letter-spacing:0.14em">{c.label}</span>
              <input
                type="text"
                bind:value={dados[c.k]}
                style="font-size:15px;padding:13px 14px;border:2px solid var(--color-divider);background:var(--color-surface);color:var(--color-text);outline:none;font-family:var(--font-body)"
              />
            </label>
          {/each}
        </div>
        <div style="display:flex;gap:14px;align-items:center;margin-top:28px;flex-wrap:wrap">
          <button class="btn-solid" type="button" disabled={!dadosCompletos} onclick={enviarDados}>Gerar contrato</button>
          <span style="font-size:13px;color:var(--color-neutral-700)">
            {dadosCompletos ? 'Tudo pronto.' : 'Preencha todos os campos para gerar o contrato.'}
          </span>
        </div>

      {:else if etapa === 'contrato'}
        <div class="kicker" style="margin-bottom:14px">Contrato · {contrato.numero}</div>
        <h1 class="display" style="font-size:36px;line-height:1.05;margin:0 0 26px">Leia e assine</h1>
        <div style="border:2px solid var(--color-divider);background:var(--color-surface);padding:32px 34px;max-height:520px;overflow:auto">
          {#each contrato.clausulas as c}
            <div style="margin-bottom:22px">
              <div class="label" style="color:var(--color-accent-700);letter-spacing:0.14em;margin-bottom:7px">{c.titulo}</div>
              <p style="font-size:13.5px;line-height:1.7;margin:0;color:var(--color-neutral-800);text-wrap:pretty">{c.texto}</p>
            </div>
          {/each}
        </div>
        <div style="display:flex;gap:14px;align-items:center;margin-top:26px;flex-wrap:wrap">
          <button class="btn-solid" type="button" onclick={assinar}>Assinar com Gov.br</button>
          <a class="btn-outline" href={contrato.pdf_url} target="_blank" rel="noreferrer">Baixar PDF</a>
          <a class="btn-outline" href={contrato.whatsapp_url} target="_blank" rel="noreferrer">Dúvida no WhatsApp</a>
        </div>

      {:else}
        <div style="height:8px;background:var(--color-accent-600);width:80px;margin-bottom:30px"></div>
        <div class="kicker" style="margin-bottom:14px">Contrato assinado</div>
        <h1 class="display" style="font-size:40px;line-height:1.05;margin:0 0 18px">Está tudo assinado</h1>
        <p style="font-size:16px;line-height:1.65;color:var(--color-neutral-800);margin:0 0 30px;max-width:58ch">
          Contrato {contrato.numero} assinado em {contrato.assinado_em} via {contrato.provedor}.
          A via em PDF foi enviada ao seu e-mail e fica disponível na sua conta.
        </p>
        <div style="display:flex;gap:14px;flex-wrap:wrap">
          <a class="btn-solid" href="/conta">Ir para minha conta</a>
          <a class="btn-outline" href={contrato.pdf_url} target="_blank" rel="noreferrer">Baixar via assinada</a>
        </div>
      {/if}
    </div>

    <div style="position:sticky;top:0;padding:56px 40px 56px 0;display:flex;flex-direction:column;gap:14px">
      <div style="border:2px solid var(--color-text);background:var(--color-surface);padding:24px">
        <div class="label" style="letter-spacing:0.14em;margin-bottom:12px">Dúvidas sobre o documento</div>
        <input
          type="text"
          bind:value={duvida}
          placeholder="Ex.: o que acontece se eu atrasar uma parcela?"
          style="width:100%;box-sizing:border-box;font-size:14px;padding:12px 13px;border:2px solid var(--color-divider);background:var(--color-bg);color:var(--color-text);outline:none;font-family:var(--font-body)"
        />
        <button
          class="btn-solid"
          style="margin-top:12px;padding:13px 22px;width:100%"
          type="button"
          onclick={() => (resposta = 'Encaminhado. Se a resposta automática não resolver, use o botão do WhatsApp abaixo.')}
        >Perguntar</button>
        {#if resposta}
          <p style="font-size:13px;line-height:1.6;color:var(--color-neutral-800);margin:14px 0 0">{resposta}</p>
        {/if}
        <a
          href="https://wa.me/5500000000000"
          target="_blank"
          rel="noreferrer"
          style="display:block;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;font-weight:700;margin-top:16px;padding-top:16px;border-top:1px solid var(--color-divider)"
        >Falar com o engenheiro →</a>
      </div>
      <div style="border:2px solid var(--color-divider);padding:22px 24px;font-size:12.5px;line-height:1.6;color:var(--color-neutral-700)">
        Validade da proposta: {proposta.validade}. Depois disso o documento expira e os valores
        precisam ser recotados.
      </div>
    </div>
  </div>
{/if}
