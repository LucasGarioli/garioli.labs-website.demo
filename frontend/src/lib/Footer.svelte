<script>
  import { empresa } from '$lib/content.js';
</script>

<div id="contato" style="background:var(--color-neutral-900);color:var(--color-neutral-400);padding:44px 48px">
  <div style="max-width:1180px;margin:0 auto;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:26px;font-size:12.5px;line-height:1.7">
    <div>
      <div class="display" style="font-size:15px;color:var(--color-neutral-100);margin-bottom:10px">{empresa.nome}</div>
      <div>{empresa.razao}<br />CNPJ {empresa.cnpj}<br />{empresa.cidade}</div>
    </div>
    <div>
      <div class="label" style="color:var(--color-neutral-500);margin-bottom:10px">Serviços</div>
      <div>Acústica<br />Sonorização<br />Iluminação cênica<br />Projeção e vídeo</div>
    </div>
    <div>
      <div class="label" style="color:var(--color-neutral-500);margin-bottom:10px">Acesso</div>
      <div style="display:flex;flex-direction:column;gap:3px">
        <a href="/orcamento" style="color:var(--color-neutral-400)">Solicitar orçamento</a>
        <a href="/conta" style="color:var(--color-neutral-400)">Minha conta</a>
        <a href="/proposta" style="color:var(--color-neutral-400)">Portal da proposta</a>
        <a href="/admin" style="color:var(--color-neutral-400)">Administração</a>
      </div>
    </div>
    <div>
      <div class="label" style="color:var(--color-neutral-500);margin-bottom:10px">Contato</div>
      <div>{empresa.site}<br />{empresa.fone}<br /><span style="color:var(--color-accent-400)">{empresa.selo}</span></div>
    </div>
  </div>
</div>
