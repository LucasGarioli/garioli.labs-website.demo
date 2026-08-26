<script>
  import { empresa } from '$lib/identidade.js';
  import { rota, textos } from '$lib/conteudo/index.js';

  let { lang = 'pt' } = $props();
  const t = $derived(textos(lang).rodape);
</script>

<div id="contato" class="rodape">
  <div class="dentro">
    <div>
      <div class="display marca">{empresa.nome}</div>
      <div class="dado">{empresa.razao}<br />{t.cnpjRotulo} {empresa.cnpj}<br />{empresa.cidade}</div>
    </div>
    <div>
      <div class="label rotulo">{t.servicosRotulo}</div>
      <div>
        {#each t.servicos as s, i}{#if i > 0}<br />{/if}{s}{/each}
      </div>
    </div>
    <div>
      <div class="label rotulo">{t.acessoRotulo}</div>
      <div class="links">
        {#each t.acessos as a}
          <a href={rota(a.href, lang)}>{a.rotulo}</a>
        {/each}
      </div>
    </div>
    <div>
      <div class="label rotulo">{t.contatoRotulo}</div>
      <div class="dado">{empresa.site}<br />{empresa.fone}{#if empresa.selo}<br /><span class="selo">{empresa.selo}</span>{/if}</div>
    </div>
  </div>
</div>

<style>
  /* Mobile first: a base e' o telefone — uma coluna, tudo legivel de cima a
     baixo — e as colunas entram quando existe largura para elas. Quatro
     colunas fixas em 390 px davam 65 px por coluna, e o CNPJ, que tem 18
     caracteres e nao quebra, abria uma barra de rolagem na pagina inteira e
     caia por cima do bloco do lado. */
  .rodape {
    background: var(--color-neutral-900);
    color: var(--color-neutral-400);
    padding: 40px 20px;
  }
  .dentro {
    max-width: 1180px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 26px;
    font-size: 12.5px;
    line-height: 1.7;
  }
  .marca { font-size: 15px; color: var(--color-neutral-100); margin-bottom: 10px; }
  .rotulo { color: var(--color-neutral-500); margin-bottom: 10px; }
  /* CNPJ, telefone e endereco de site sao cadeias longas sem espaco: elas
     quebram dentro da coluna em vez de esticar a coluna. */
  .dado { overflow-wrap: anywhere; }
  .selo { color: var(--color-accent-400); }
  .links { display: flex; flex-direction: column; gap: 3px; }
  .links a { color: var(--color-neutral-400); }

  /* No dedo, um link de rodape empilhado precisa de altura para ser acertado
     sem pegar o de baixo. */
  @media (pointer: coarse), (max-width: 620px) {
    .links { gap: 0; }
    .links a { padding: 11px 0; }
  }

  @media (min-width: 620px) {
    .rodape { padding: 44px 32px; }
    .dentro { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px 26px; }
  }
  @media (min-width: 960px) {
    .rodape { padding: 44px 48px; }
    .dentro { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
</style>
