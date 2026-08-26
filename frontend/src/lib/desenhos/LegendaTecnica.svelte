<script>
  /// Glossário de uma prancha.
  ///
  /// Toda prancha carrega termos que um engenheiro lê de relance e que não
  /// significam nada para quem vai assinar o contrato. Este bloco fecha essa
  /// distância sem baixar o nível de nenhum dos dois lados: cada verbete tem a
  /// **definição** — a frase que um projetista aceitaria numa memória de
  /// cálculo — e o **para que serve**, que responde à única pergunta que o
  /// cliente realmente tem: por que isto foi medido e o que muda se estiver
  /// errado.
  ///
  /// Nada aqui é decoração: um termo só entra na lista se estiver escrito na
  /// prancha logo acima.
  let { titulo, termos } = $props();
</script>

<div class="legenda">
  <div class="cabeca">{titulo}</div>
  <dl class="verbetes">
    {#each termos as v}
      <div class="verbete">
        <dt>{v.t}</dt>
        <dd class="definicao">{v.d}</dd>
        <dd class="serventia">
          <span class="marcador">→</span>{v.p}
        </dd>
      </div>
    {/each}
  </dl>
</div>

<style>
  .legenda {
    margin-top: 26px;
    border-top: 1px solid var(--color-neutral-800);
    padding-top: 20px;
  }
  .cabeca {
    font-family: var(--font-tecnica);
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-neutral-600);
    margin-bottom: 18px;
  }
  .verbetes {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 22px 44px;
    margin: 0;
  }
  .verbete {
    display: flex;
    flex-direction: column;
    gap: 6px;
    border-left: 2px solid var(--color-neutral-800);
    padding-left: 16px;
  }
  dt {
    font-family: var(--font-tecnica);
    font-size: 11px;
    letter-spacing: 0.13em;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--color-neutral-200);
  }
  dd {
    margin: 0;
    font-size: 13.5px;
    line-height: 1.62;
    text-wrap: pretty;
  }
  .definicao { color: var(--color-neutral-400); }
  /* O segundo parágrafo é o que o cliente lê. Ele ganha a cor de destaque no
     marcador para que o olho encontre a resposta sem ler a definição antes. */
  .serventia { color: var(--color-neutral-300); }
  .marcador {
    color: var(--color-accent-500);
    font-family: var(--font-tecnica);
    margin-right: 8px;
  }

  @media (max-width: 860px) {
    .verbetes { grid-template-columns: minmax(0, 1fr); gap: 20px; }
  }
</style>
