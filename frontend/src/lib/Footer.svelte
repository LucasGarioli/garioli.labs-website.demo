<script>
  import { empresa } from '$lib/identidade.js';
  import { rota, textos } from '$lib/conteudo/index.js';

  let { lang = 'pt' } = $props();
  const t = $derived(textos(lang).rodape);
</script>

<div id="contato" style="background:var(--color-neutral-900);color:var(--color-neutral-400);padding:44px 48px">
  <div style="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:26px;font-size:12.5px;line-height:1.7">
    <div>
      <div class="display" style="font-size:15px;color:var(--color-neutral-100);margin-bottom:10px">{empresa.nome}</div>
      <div>{empresa.razao}<br />{t.cnpjRotulo} {empresa.cnpj}<br />{empresa.cidade}</div>
    </div>
    <div>
      <div class="label" style="color:var(--color-neutral-500);margin-bottom:10px">{t.servicosRotulo}</div>
      <div>
        {#each t.servicos as s, i}{#if i > 0}<br />{/if}{s}{/each}
      </div>
    </div>
    <div>
      <div class="label" style="color:var(--color-neutral-500);margin-bottom:10px">{t.acessoRotulo}</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        {#each t.acessos as a}
          <a href={rota(a.href, lang)} style="color:var(--color-neutral-400)">{a.rotulo}</a>
        {/each}
      </div>
    </div>
    <div>
      <div class="label" style="color:var(--color-neutral-500);margin-bottom:10px">{t.contatoRotulo}</div>
      <div>{empresa.site}<br />{empresa.fone}{#if empresa.selo}<br /><span style="color:var(--color-accent-400)">{empresa.selo}</span>{/if}</div>
    </div>
  </div>
</div>
