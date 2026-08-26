<script>
  // Corte A-A pelo eixo da sala. É o desenho que decide as duas folgas que um
  // balcão erra com facilidade: o pé-direito livre sobre a última fileira do
  // mezanino e a altura sob o peitoril. Ambas saem calculadas de projeto.js.
  import {
    obra, sala, foco, palco, plateia, mezanino, fontes, caixas, materiais,
    gabinetes, gabinetesDe, conjunto,
    fileirasPlateia, fileirasMezanino, lugares, maiorDistancia, teto
  } from './projeto.js';
  import { formatador, material, rotulos } from './rotulos.js';

  let { lang = 'pt' } = $props();

  // A geometria nao muda com o idioma; a legenda e a virgula decimal, sim.
  const r = $derived(rotulos(lang));
  const fmt = $derived(formatador(lang));

  const E = 13.0; // unidades do viewBox por metro — 1,25× a planta, como 1:400 para 1:500
  const X0 = 150;
  const Z0 = 410;
  const sx = (x) => X0 + x * E;
  const sz = (z) => Z0 - z * E;
  const L = (m) => m * E;

  const primeira = fileirasPlateia[0];
  const ultimaTerrea = fileirasPlateia.at(-1);
  const primeiroMez = fileirasMezanino[0];
  const ultimoMez = fileirasMezanino.at(-1);

  const xDe = (f) => foco.x + f.raio;
  const xPrimeira = xDe(primeira);
  const xUltima = xDe(ultimaTerrea);
  const xMezFrente = xDe(primeiroMez);
  const xMezFundo = xDe(ultimoMez);

  /// Piso em degraus: um degrau por fileira, com o espelho do rake.
  function degraus(fileiras) {
    const p = [];
    for (const f of fileiras) {
      p.push(`${sx(xDe(f)).toFixed(1)},${sz(f.nivel).toFixed(1)}`);
      p.push(`${sx(xDe(f) + plateia.passo).toFixed(1)},${sz(f.nivel).toFixed(1)}`);
    }
    return p.join(' ');
  }

  /// Poltrona vista de lado: encosto e assento, virados para o palco.
  const poltrona = (x, z) =>
    `M ${sx(x + 0.62).toFixed(1)} ${sz(z).toFixed(1)} ` +
    `L ${sx(x + 0.62).toFixed(1)} ${sz(z + 0.86).toFixed(1)} ` +
    `L ${sx(x + 0.16).toFixed(1)} ${sz(z + 0.46).toFixed(1)}`;

  const perfilForro =
    `M ${sx(0)} ${sz(sala.alturaProscenio)} L ${sx(palco.x1)} ${sz(sala.alturaProscenio)} ` +
    `L ${sx(sala.profundidade)} ${sz(sala.alturaFundo)}`;

  /// Contorno do mezanino: degraus por cima, forro por baixo.
  const corpoMezanino = (() => {
    const topo = fileirasMezanino
      .flatMap((f) => [
        `${sx(xDe(f)).toFixed(1)},${sz(f.nivel).toFixed(1)}`,
        `${sx(xDe(f) + mezanino.passo).toFixed(1)},${sz(f.nivel).toFixed(1)}`
      ])
      .join(' ');
    const soffitFundo = mezanino.nivelFrente + (xMezFundo - xMezFrente) * 0.355;
    return {
      topo,
      corpo:
        `M ${sx(xMezFrente)} ${sz(mezanino.nivelFrente)} ` +
        `L ${topo.split(' ').join(' L ')} ` +
        `L ${sx(sala.profundidade)} ${sz(ultimoMez.nivel)} ` +
        `L ${sx(sala.profundidade)} ${sz(soffitFundo)} Z`
    };
  })();

  /// Linhas de visão que precisam ser verificadas: das duas piores poltronas
  /// até a boca de cena, e da primeira fileira até o alto do painel.
  const visadas = $derived([
    {
      t: r.corte.visadas.mezanino,
      de: { x: xMezFundo, z: ultimoMez.nivel + 1.2 },
      ate: { x: palco.x1, z: palco.nivel }
    },
    {
      t: r.corte.visadas.plateia,
      de: { x: xUltima, z: ultimaTerrea.nivel + 1.2 },
      ate: { x: palco.x1, z: palco.nivel }
    },
    {
      t: r.corte.visadas.painel,
      de: { x: xPrimeira, z: 1.2 },
      ate: { x: palco.x0 + 0.5, z: palco.nivel + 1.0 + palco.ledAltura }
    }
  ]);

  const arranjo = fontes.principais[0];

  /// Cada gabinete desenhado no plano do corte: profundidade × altura, girado
  /// pelo tombo com que ele foi pendurado. Vem de `gabinetes` — o corte não
  /// tem uma segunda versão do sistema, e é por isso que o número de caixas
  /// aqui é o mesmo da planta e o mesmo da simulação.
  const noCorte = (g) => ({
    x: sx(g.x - g.prof / 2),
    y: sz(g.z + g.alt / 2),
    w: L(g.prof),
    h: L(g.alt),
    giro: `rotate(${(-g.inclinacao).toFixed(1)} ${sx(g.x).toFixed(1)} ${sz(g.z).toFixed(1)})`
  });

  /// O que o corte no eixo atravessa de fato, e o arranjo L/R projetado — ele
  /// está a treze metros do plano de corte, e por isso entra em fantasma.
  const noEixo = gabinetes.filter((g) =>
    ['C', 'SUB·V', 'SUB', 'FF', 'MON', 'D1', 'D2'].includes(g.grupo)
  );
  const projetados = gabinetesDe('L');

  const delays = fontes.delays.map((d) => ({
    ...d,
    x: foco.x + d.raio,
    voo: conjunto(d.rotulo).voo
  }));

  const cotasX = $derived([
    { de: 0, ate: palco.x1, t: fmt.dec(18) },
    { de: palco.x1, ate: xPrimeira, t: fmt.dec(5) },
    { de: xPrimeira, ate: xUltima, t: fmt.dec(31) },
    { de: xUltima, ate: xMezFundo, t: fmt.dec(12) },
    { de: xMezFundo, ate: sala.profundidade, t: fmt.dec(4) }
  ]);

  const cotasZ = $derived([
    { de: 0, ate: ultimaTerrea.nivel, t: fmt.dec(ultimaTerrea.nivel) },
    { de: ultimaTerrea.nivel, ate: ultimoMez.nivel, t: fmt.dec(ultimoMez.nivel - ultimaTerrea.nivel) },
    { de: ultimoMez.nivel, ate: sala.alturaFundo, t: fmt.dec(sala.alturaFundo - ultimoMez.nivel) }
  ]);

  /// Níveis marcados no corte, cada um no ponto em que existe.
  ///
  /// A escolha do lado não é estética: sobre a plateia e sobre o mezanino o
  /// piso é uma escada, e a cota escrita ali cai em cima do degrau, da poltrona
  /// e do raio de visada. Cada uma fica no vão limpo do lado do próprio nível —
  /// e o wipeout do CSS cobre o que ainda passar perto.
  const niveis = $derived([
    { x: 11, z: palco.nivel, t: `+${fmt.dec(palco.nivel)}`, ancora: 'middle' },
    { x: xPrimeira - 0.4, z: 0, t: `±${fmt.dec(0)}`, ancora: 'end' },
    { x: xUltima + 1.8, z: ultimaTerrea.nivel, t: `+${fmt.dec(ultimaTerrea.nivel)}`, ancora: 'start' },
    { x: xMezFrente - 0.3, z: mezanino.nivelFrente, t: `+${fmt.dec(mezanino.nivelFrente)}`, ancora: 'end' },
    { x: xMezFundo - 1.5, z: ultimoMez.nivel, t: `+${fmt.dec(ultimoMez.nivel)}`, ancora: 'end' }
  ]);

  const somaAlfaS = materiais.reduce((a, m) => a + m.alfa * m.area, 0);
  const linhasMemorial = $derived(
    materiais.map((m) => {
      const nomes = material(m, lang, fmt.milhar(lugares.total));
      return {
        alfa: fmt.dec(m.alfa, 2),
        nome: nomes.nome,
        onde: nomes.onde,
        area: fmt.milhar(m.area),
        alfaS: fmt.milhar(Math.round(m.alfa * m.area))
      };
    })
  );
</script>

<figure class="prancha">
  <svg viewBox="0 0 1200 1084" role="img"
       aria-label={r.corte.aria}>
    <title>{r.corte.titulo(fmt.milhar(lugares.total))}</title>

    <defs>
      <pattern id="ct-parede" width="7" height="7" patternTransform="rotate(45)"
               patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="7" class="hachura" />
      </pattern>
      <pattern id="ct-solo" width="9" height="9" patternTransform="rotate(-45)"
               patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="9" class="hachura-fina" />
      </pattern>
      <marker id="ct-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
              markerHeight="7" orient="auto-start-reverse">
        <path d="M0 1 L10 5 L0 9 z" class="preenche-cota" />
      </marker>
      <marker id="ct-seta-forte" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8"
              markerHeight="8" orient="auto-start-reverse">
        <path d="M0 1 L10 5 L0 9 z" class="preenche-critico" />
      </marker>
    </defs>

    <rect x="24" y="24" width="1152" height="1036" class="moldura" />

    <!-- ————— envoltória ————— -->
    <rect x={sx(-sala.parede)} y={sz(sala.alturaProscenio)} width={L(sala.parede)}
          height={L(sala.alturaProscenio)} fill="url(#ct-parede)" class="parede" />
    <rect x={sx(sala.profundidade)} y={sz(sala.alturaFundo)} width={L(sala.parede)}
          height={L(sala.alturaFundo)} fill="url(#ct-parede)" class="parede" />
    <rect x={sx(-sala.parede)} y={sz(0)} width={L(sala.profundidade + 2 * sala.parede)}
          height={L(0.5)} fill="url(#ct-solo)" class="parede" />
    <path d={perfilForro} class="forro" />
    <!-- Começa onde o forro ainda está no alto e corre para a direita, que é
         para onde ele desce: assim a linha se afasta do texto letra a letra e
         nunca o atravessa, seja qual for o comprimento do rótulo. Centrado, ele
         cruzava a inclinação no meio da própria frase. -->
    <text x={sx(22)} y={sz(teto(22)) - 6} class="rot-peca" text-anchor="start">
      {r.corte.forro(fmt.dec(sala.alturaProscenio), fmt.dec(sala.alturaFundo))}
    </text>

    <!-- ————— palco ————— -->
    <rect x={sx(palco.x0)} y={sz(palco.nivel)} width={L(palco.x1 - palco.x0)}
          height={L(palco.nivel)} class="palco" />
    <text x={sx(10)} y={sz(3.3)} class="rot-area" text-anchor="middle">{r.comum.palco}</text>
    <rect x={sx(palco.x0 + 0.3)} y={sz(palco.nivel + 1.0 + palco.ledAltura)} width={L(0.35)}
          height={L(palco.ledAltura)} class="led" />
    <text x={sx(palco.x0 + 1.2)} y={sz(palco.nivel + 0.6 + palco.ledAltura)} class="rot-led">
      {r.comum.painelLed(fmt.dec(palco.ledLargura), fmt.dec(palco.ledAltura))}
    </text>
    <line x1={sx(palco.x1)} y1={sz(palco.nivel)} x2={sx(palco.x1)} y2={sz(sala.alturaProscenio)}
          class="proscenio" />

    <!-- ————— plateia ————— -->
    <polyline points={degraus(fileirasPlateia)} class="piso" />
    <line x1={sx(palco.x1)} y1={sz(0)} x2={sx(xPrimeira)} y2={sz(0)} class="piso" />
    <line x1={sx(xUltima + 1)} y1={sz(ultimaTerrea.nivel)} x2={sx(sala.profundidade)}
          y2={sz(ultimaTerrea.nivel)} class="piso" />
    <g class="poltronas">
      {#each fileirasPlateia as f}
        <path d={poltrona(xDe(f), f.nivel)} />
      {/each}
    </g>

    <!-- ————— mezanino ————— -->
    <path d={corpoMezanino.corpo} class="corpo-mezanino" />
    <polyline points={corpoMezanino.topo} class="piso" />
    <line x1={sx(xMezFrente)} y1={sz(mezanino.nivelFrente)} x2={sx(xMezFrente)}
          y2={sz(mezanino.nivelFrente + 1.1)} class="peitoril" />
    <g class="poltronas poltronas-mez">
      {#each fileirasMezanino as f}
        <path d={poltrona(xDe(f), f.nivel)} />
      {/each}
    </g>
    <!-- Centrado no vao sob o mezanino (3,41 a 7,00): em 4,40 o rotulo passava
         por cima da cota de nivel do piso da plateia. -->
    <text x={sx(sala.profundidade - 0.5)} y={sz(5.3)} class="rot-peca" text-anchor="end">
      {r.corte.mezanino(fmt.milhar(lugares.mezanino))}
    </text>

    <!-- ————— folgas verificadas ————— -->
    <g class="cota-critica">
      <line x1={sx(xMezFundo - 0.4)} y1={sz(ultimoMez.nivel)} x2={sx(xMezFundo - 0.4)}
            y2={sz(teto(xMezFundo))} marker-start="url(#ct-seta-forte)"
            marker-end="url(#ct-seta-forte)" />
      <line x1={sx(61.2)} y1={sz(16.3)} x2={sx(xMezFundo - 0.4)} y2={sz(12.9)}
            class="chamada" />
      <text x={sx(61)} y={sz(16.6)} class="rot-critico"
            text-anchor="end">{r.corte.peDireitoLivre(fmt.dec(sala.peDireitoLivre))}</text>

      <line x1={sx(xMezFrente + 0.5)} y1={sz(ultimaTerrea.nivel)} x2={sx(xMezFrente + 0.5)}
            y2={sz(mezanino.nivelFrente)} marker-start="url(#ct-seta-forte)"
            marker-end="url(#ct-seta-forte)" />
      <text x={sx(xMezFrente - 1.0)} y={sz(6.1)} class="rot-critico" text-anchor="end">
        {r.corte.sobMezanino(fmt.dec(sala.folgaSobMezanino))}
      </text>
    </g>

    <!-- ————— linhas de visão ————— -->
    <g class="visada">
      {#each visadas as v}
        <line x1={sx(v.de.x)} y1={sz(v.de.z)} x2={sx(v.ate.x)} y2={sz(v.ate.z)} />
      {/each}
    </g>

    <!-- ————— sistema de som ————— -->
    <g class="som">
      <!-- Arranjo L/R, projetado: está fora do plano do corte. -->
      <line x1={sx(arranjo.x)} y1={sz(conjunto('L').z.max)} x2={sx(arranjo.x)}
            y2={sz(teto(arranjo.x))} class="rigging" />
      {#each projetados as g}
        {@const c = noCorte(g)}
        <rect x={c.x} y={c.y} width={c.w} height={c.h} transform={c.giro}
              class="arranjo-fantasma" />
      {/each}

      <!-- Rigging das colunas que o corte atravessa. -->
      {#each ['C', 'SUB·V'] as grupo}
        <line x1={sx(conjunto(grupo).x.meio)} y1={sz(conjunto(grupo).z.max)}
              x2={sx(conjunto(grupo).x.meio)} y2={sz(teto(conjunto(grupo).x.meio))}
              class="rigging" />
      {/each}
      {#each delays as d}
        <line x1={sx(d.x)} y1={sz(d.altura + 0.4)} x2={sx(d.x)} y2={sz(teto(d.x))} class="rigging" />
      {/each}

      {#each noEixo as g}
        {@const c = noCorte(g)}
        <rect
          x={c.x} y={c.y} width={c.w} height={c.h} transform={c.giro}
          class={g.tipo === 'sub' ? 'subs' : 'arranjo'}
        />
      {/each}

      <text x={sx(21.6)} y={sz(17.6)} class="rot-fonte">
        {r.comum.conjunto('L/R', conjunto('L').caixas, fmt.dec(conjunto('L').voo))}
      </text>
      <text x={sx(22.4)} y={sz(15.4)} class="rot-fonte">
        {r.comum.conjunto('SUB·V', conjunto('SUB·V').caixas, fmt.dec(conjunto('SUB·V').voo))}
      </text>
      <text x={sx(21.6)} y={sz(12.2)} class="rot-fonte">
        {r.comum.conjunto('C', conjunto('C').caixas, fmt.dec(conjunto('C').voo))}
      </text>

      <!-- O rótulo fica sob o anel, menos quando o anel está alto: ali,
           logo abaixo dele, passa a linha de maior distância de escuta, e as
           duas anotações se escreviam uma por cima da outra. Esse vai para o
           lado, na cota do próprio anel. -->
      {#each delays as d}
        {@const alto = d.altura > 13}
        <text
          x={sx(d.x) - (alto ? 16 : 0)} y={sz(d.altura) + (alto ? 4 : 20)}
          class="rot-fonte" text-anchor={alto ? 'end' : 'middle'}
        >
          {r.comum.delay(d.rotulo, d.caixas, fmt.dec(d.voo), d.atraso)}
        </text>
      {/each}

      <text x={sx(19.8)} y={sz(4.6)} class="rot-fonte">
        {r.comum.conjunto('FF', conjunto('FF').caixas, fmt.dec(conjunto('FF').voo))}
      </text>
      <text x={sx(19.8)} y={sz(3.2)} class="rot-fonte">{r.comum.sub(fontes.subs.caixas)}</text>
      <text x={sx(9.4)} y={sz(3.0)} class="rot-fonte" text-anchor="middle">
        {r.comum.conjunto('MON', conjunto('MON').caixas, fmt.dec(palco.nivel))}
      </text>
    </g>

    <!-- ————— maior distância de escuta ————— -->
    <g class="cota-critica">
      <line x1={sx(arranjo.x)} y1={sz(arranjo.altura)} x2={sx(xMezFundo)}
            y2={sz(ultimoMez.nivel)} marker-start="url(#ct-seta-forte)"
            marker-end="url(#ct-seta-forte)" class="tracejada" />
      <text x={sx(42.7)} y={sz(13.4)} class="rot-critico" text-anchor="middle"
            transform="rotate(3.2 {sx(42.7)} {sz(13.4)})">
        {r.comum.distancia(fmt.dec(maiorDistancia.valor))}
      </text>
    </g>

    <!-- ————— níveis ————— -->
    {#each niveis as n}
      <text x={sx(n.x)} y={sz(n.z) - 6} class="rot-nivel" text-anchor={n.ancora}>▽ {n.t}</text>
    {/each}

    <!-- ————— cotas horizontais ————— -->
    <g class="cotas">
      {#each cotasX as c}
        <line x1={sx(c.de)} y1="452" x2={sx(c.ate)} y2="452" marker-start="url(#ct-seta)"
              marker-end="url(#ct-seta)" />
        <line x1={sx(c.de)} y1={sz(0) + 6} x2={sx(c.de)} y2="458" class="chamada" />
        <text x={sx((c.de + c.ate) / 2)} y="444" class="rot-cota" text-anchor="middle">{c.t}</text>
      {/each}
      <line x1={sx(sala.profundidade)} y1={sz(0) + 6} x2={sx(sala.profundidade)} y2="498"
            class="chamada" />
      <line x1={sx(0)} y1={sz(0) + 6} x2={sx(0)} y2="498" class="chamada" />
      <line x1={sx(0)} y1="492" x2={sx(sala.profundidade)} y2="492" marker-start="url(#ct-seta)"
            marker-end="url(#ct-seta)" />
      <text x={sx(sala.profundidade / 2)} y="484" class="rot-cota-forte" text-anchor="middle">
        {fmt.dec(sala.profundidade)}
      </text>

      <!-- verticais -->
      {#each cotasZ as c}
        <line x1="1102" y1={sz(c.de)} x2="1102" y2={sz(c.ate)} marker-start="url(#ct-seta)"
              marker-end="url(#ct-seta)" />
        <line x1={sx(sala.profundidade + sala.parede)} y1={sz(c.ate)} x2="1096" y2={sz(c.ate)}
              class="chamada" />
        <text x="1094" y={(sz(c.de) + sz(c.ate)) / 2 + 4} class="rot-cota" text-anchor="end">{c.t}</text>
      {/each}
      <line x1="1150" y1={sz(0)} x2="1150" y2={sz(sala.alturaFundo)} marker-start="url(#ct-seta)"
            marker-end="url(#ct-seta)" />
      <text x="1144" y={sz(sala.alturaFundo / 2)} class="rot-cota-forte" text-anchor="middle"
            transform="rotate(-90 1144 {sz(sala.alturaFundo / 2)})">{fmt.dec(sala.alturaFundo)}</text>
      <line x1="112" y1={sz(0)} x2="112" y2={sz(sala.alturaProscenio)} marker-start="url(#ct-seta)"
            marker-end="url(#ct-seta)" />
      <text x="104" y={sz(sala.alturaProscenio / 2)} class="rot-cota-forte" text-anchor="middle"
            transform="rotate(-90 104 {sz(sala.alturaProscenio / 2)})">
        {fmt.dec(sala.alturaProscenio)}
      </text>
    </g>

    <!-- ————— escala gráfica ————— -->
    <g class="escala" transform="translate(150 524)">
      <rect x="0" y="0" width={L(5)} height="7" class="escala-escura" />
      <rect x={L(5)} y="0" width={L(5)} height="7" class="escala-clara" />
      <rect x={L(10)} y="0" width={L(10)} height="7" class="escala-escura" />
      <text x="0" y="24" class="rot-cota" text-anchor="middle">0</text>
      <text x={L(10)} y="24" class="rot-cota" text-anchor="middle">10</text>
      <text x={L(20)} y="24" class="rot-cota" text-anchor="middle">20 m</text>
      <text x={L(20) + 34} y="24" class="rot-cota">· {r.comum.esc} {obra.escalaCorte}</text>
    </g>

    <!-- ————— memorial de absorção —————
         Deslocado como bloco: o titulo nascia 12 unidades abaixo dos numeros da
         escala grafica e os dois se liam como uma linha so. -->
    <g transform="translate(0 20)">
    <text x="48" y="560" class="titulo-bloco">{r.corte.memorial}</text>
    <line x1="48" y1="574" x2="800" y2="574" class="linha-tabela" />
    <text x="48" y="596" class="cabecalho">α</text>
    <text x="104" y="596" class="cabecalho">{r.corte.colunas.superficie}</text>
    <text x="340" y="596" class="cabecalho">{r.corte.colunas.onde}</text>
    <text x="700" y="596" class="cabecalho" text-anchor="end">{r.corte.colunas.area}</text>
    <text x="800" y="596" class="cabecalho" text-anchor="end">α·S</text>
    <line x1="48" y1="606" x2="800" y2="606" class="linha-tabela-fina" />
    {#each linhasMemorial as m, i}
      <text x="48" y={630 + i * 24} class="celula-forte">{m.alfa}</text>
      <text x="104" y={630 + i * 24} class="celula">{m.nome}</text>
      <text x="340" y={630 + i * 24} class="celula-fraca">{m.onde}</text>
      <text x="700" y={630 + i * 24} class="celula" text-anchor="end">{m.area}</text>
      <text x="800" y={630 + i * 24} class="celula-forte" text-anchor="end">{m.alfaS}</text>
      <line x1="48" y1={638 + i * 24} x2="800" y2={638 + i * 24} class="linha-tabela-fina" />
    {/each}
    <text x="104" y={638 + (linhasMemorial.length - 1) * 24 + 20} class="celula-forte">
      {r.corte.absorcaoTotal}
    </text>
    <text x="700" y={638 + (linhasMemorial.length - 1) * 24 + 20} class="celula" text-anchor="end">
      {fmt.milhar(sala.superficies)}
    </text>
    <text x="800" y={638 + (linhasMemorial.length - 1) * 24 + 20} class="celula-forte" text-anchor="end">
      {fmt.milhar(Math.round(somaAlfaS))}
    </text>
    <line x1="48" y1={638 + (linhasMemorial.length - 1) * 24 + 30} x2="800"
          y2={638 + (linhasMemorial.length - 1) * 24 + 30} class="linha-tabela" />

    <g class="resultado">
      <rect x="836" y="588" width="340" height="180" />
      <text x="856" y="616" class="titulo-bloco">{r.corte.resultado}</text>
      <text x="856" y="652" class="formula">T = {fmt.dec(0.161, 3)} · V / A</text>
      <text x="856" y="682" class="chave">{r.corte.volume}</text>
      <text x="1156" y="682" class="valor" text-anchor="end">{fmt.milhar(sala.volume)} m³</text>
      <text x="856" y="708" class="chave">{r.corte.absorcao}</text>
      <text x="1156" y="708" class="valor" text-anchor="end">
        {r.corte.sabine(fmt.milhar(sala.absorcaoTotal))}
      </text>
      <text x="856" y="740" class="chave">{r.corte.t30}</text>
      <text x="1156" y="740" class="valor-forte" text-anchor="end">
        {fmt.dec(sala.t30Calculado)} s
      </text>
      <text x="856" y="760" class="rodape">{r.corte.alvo(fmt.dec(sala.t30Alvo))}</text>
    </g>
    </g>

    <!-- ————— carimbo ————— -->
    <g class="carimbo">
      <rect x="24" y="856" width="1152" height="184" />
      <line x1="24" y1="912" x2="1176" y2="912" />
      <line x1="352" y1="856" x2="352" y2="1040" />
      <line x1="726" y1="856" x2="726" y2="1040" />
      <line x1="726" y1="968" x2="1176" y2="968" />
      <line x1="884" y1="912" x2="884" y2="1040" />
      <line x1="1030" y1="912" x2="1030" y2="1040" />

      <text x="48" y="888" class="carimbo-marca">GARIOLI LABS</text>
      <text x="48" y="906" class="carimbo-mini">{r.obra.disciplina}</text>
      <text x="376" y="880" class="carimbo-chave">{r.carimbo.obra}</text>
      <text x="376" y="902" class="carimbo-valor-forte">{r.obra.nome}</text>
      <text x="750" y="880" class="carimbo-chave">{r.carimbo.conteudo}</text>
      <text x="750" y="902" class="carimbo-valor">{r.corte.conteudo}</text>

      <text x="48" y="938" class="carimbo-chave">{r.carimbo.responsavelChave}</text>
      <text x="48" y="960" class="carimbo-valor">{r.obra.responsavel}</text>
      <text x="48" y="990" class="carimbo-chave">{r.carimbo.verificacoes}</text>
      <text x="48" y="1010" class="carimbo-valor-mini">{r.corte.verificado[0]}</text>
      <text x="48" y="1028" class="carimbo-valor-mini">{r.corte.verificado[1]}</text>

      <text x="376" y="938" class="carimbo-chave">{r.carimbo.sala}</text>
      <text x="376" y="960" class="carimbo-valor">
        {r.corte.salaFicha(fmt.milhar(sala.volume), fmt.milhar(sala.superficies), sala.ruidoFundo)}
      </text>
      <text x="376" y="996" class="carimbo-chave">{r.carimbo.lugares}</text>
      <text x="376" y="1018" class="carimbo-valor">
        {r.comum.lugares(
          fmt.milhar(lugares.plateia),
          fmt.milhar(lugares.mezanino),
          fmt.milhar(lugares.total)
        )}
      </text>

      <text x="750" y="938" class="carimbo-chave">{r.carimbo.escala}</text>
      <text x="750" y="960" class="carimbo-valor">{obra.escalaCorte}</text>
      <text x="908" y="938" class="carimbo-chave">{r.carimbo.prancha}</text>
      <text x="908" y="960" class="carimbo-valor-forte">AC-02</text>
      <text x="1054" y="938" class="carimbo-chave">{r.carimbo.rev}</text>
      <text x="1054" y="960" class="carimbo-valor-forte">{obra.revisao}</text>
      <text x="750" y="994" class="carimbo-chave">{r.carimbo.data}</text>
      <text x="750" y="1016" class="carimbo-valor">{obra.data}</text>
      <text x="908" y="994" class="carimbo-chave">{r.carimbo.folha}</text>
      <text x="908" y="1016" class="carimbo-valor">2 / 4</text>
      <text x="1054" y="994" class="carimbo-chave">{r.carimbo.unid}</text>
      <text x="1054" y="1016" class="carimbo-valor">{r.carimbo.metros}</text>
    </g>
  </svg>

  <figcaption>
    {r.corte.figcaption(
      fmt.dec(sala.alturaProscenio),
      fmt.dec(sala.alturaFundo),
      fmt.dec(sala.peDireitoLivre),
      fmt.dec(sala.t30Calculado)
    )}
  </figcaption>
</figure>

<style>
  .prancha { margin: 0; }
  .prancha svg { display: block; width: 100%; height: auto; }

  figcaption {
    margin-top: 16px;
    font-family: var(--font-tecnica);
    font-size: 11.5px;
    line-height: 1.65;
    color: var(--color-neutral-500);
    max-width: 88ch;
  }

  .moldura, .carimbo > rect, .carimbo > line, .resultado rect {
    fill: none;
    stroke: var(--color-neutral-700);
    stroke-width: 1;
  }
  .parede { stroke: var(--color-neutral-300); stroke-width: 1.4; }
  .hachura { stroke: var(--color-neutral-700); stroke-width: 1.5; }
  .hachura-fina { stroke: var(--color-neutral-800); stroke-width: 1.1; }

  .forro { fill: none; stroke: var(--color-neutral-200); stroke-width: 2.2; }
  .palco { fill: rgba(248, 244, 244, 0.05); stroke: var(--color-neutral-400); stroke-width: 1.2; }
  .proscenio { stroke: var(--color-neutral-500); stroke-width: 1; stroke-dasharray: 10 6; }
  .led { fill: var(--color-accent-600); stroke: var(--color-accent-400); stroke-width: 0.8; }

  .piso { fill: none; stroke: var(--color-neutral-300); stroke-width: 1.6; }
  .poltronas path { fill: none; stroke: rgba(248, 244, 244, 0.5); stroke-width: 1.1; }
  .poltronas-mez path { stroke: rgba(255, 118, 92, 0.62); }
  .corpo-mezanino { fill: rgba(255, 86, 60, 0.05); stroke: var(--color-accent-700); stroke-width: 1.2; }
  .peitoril { stroke: var(--color-accent-500); stroke-width: 2.4; }

  .visada line { stroke: var(--color-neutral-600); stroke-width: 1; stroke-dasharray: 9 5; }

  .arranjo { fill: var(--color-accent-600); stroke: var(--color-neutral-100); stroke-width: 0.7; }
  .arranjo-fantasma {
    fill: rgba(255, 86, 60, 0.16);
    stroke: var(--color-accent-600);
    stroke-width: 1;
    stroke-dasharray: 5 4;
  }
  .subs { fill: var(--color-accent-800); stroke: var(--color-accent-600); stroke-width: 0.8; }
  .rigging { stroke: var(--color-neutral-700); stroke-width: 0.9; stroke-dasharray: 3 3; }

  .cotas line { stroke: var(--color-neutral-500); stroke-width: 1; }
  .chamada { stroke: var(--color-neutral-700); stroke-width: 0.8; }
  .cota-critica line { stroke: var(--color-accent-500); stroke-width: 1.2; }
  .tracejada { stroke-dasharray: 12 6; }
  .preenche-cota { fill: var(--color-neutral-500); }
  .preenche-critico { fill: var(--color-accent-500); }

  .linha-tabela { stroke: var(--color-neutral-500); stroke-width: 1.2; }
  .linha-tabela-fina { stroke: var(--color-neutral-800); stroke-width: 1; }

  text { font-family: var(--font-tecnica); fill: var(--color-neutral-400); }

  /* Wipeout: a anotacao abre o proprio claro na geometria, como em prancha de
     verdade. Sem isto, "▽ +7,00" e "▽ +11,40" caem em cima dos degraus da
     plateia e do raio de visada, e nao se leem. */
  .rot-nivel, .rot-peca, .rot-led, .rot-fonte, .rot-visada, .rot-critico {
    paint-order: stroke;
    stroke: var(--color-text);
    stroke-width: 3.4px;
    stroke-linejoin: round;
  }
  .rot-area { font-size: 15px; font-weight: 600; letter-spacing: 0.2em;
              fill: var(--color-neutral-200); }
  .rot-peca { font-size: 10.5px; letter-spacing: 0.12em; }
  .rot-led { font-size: 10px; letter-spacing: 0.1em; fill: var(--color-accent-400); }
  .rot-fonte { font-size: 10px; letter-spacing: 0.08em; fill: var(--color-accent-400); }
  .rot-visada { font-size: 10px; letter-spacing: 0.1em; fill: var(--color-neutral-600); }
  .rot-nivel { font-size: 10px; letter-spacing: 0.06em; fill: var(--color-neutral-500); }
  .rot-cota { font-size: 11px; }
  .rot-cota-forte { font-size: 13.5px; font-weight: 600; fill: var(--color-neutral-200); }
  .rot-critico { font-size: 11.5px; font-weight: 600; fill: var(--color-accent-400); }

  .titulo-bloco { font-size: 10px; letter-spacing: 0.18em; fill: var(--color-neutral-500); }
  .cabecalho { font-size: 9.5px; letter-spacing: 0.16em; fill: var(--color-neutral-600); }
  .celula { font-size: 12px; fill: var(--color-neutral-300); }
  .celula-forte { font-size: 12px; font-weight: 600; fill: var(--color-neutral-100); }
  .celula-fraca { font-size: 11.5px; fill: var(--color-neutral-600); }
  .formula { font-size: 15px; font-weight: 600; fill: var(--color-accent-400); }
  .chave { font-size: 10.5px; letter-spacing: 0.1em; fill: var(--color-neutral-600); }
  .valor { font-size: 13px; fill: var(--color-neutral-300); }
  .valor-forte { font-size: 18px; font-weight: 700; fill: var(--color-neutral-100); }
  .rodape { font-size: 10px; fill: var(--color-neutral-600); }

  .carimbo-marca { font-family: var(--font-heading); font-size: 20px; font-weight: 800;
                   letter-spacing: 0.13em; fill: var(--color-neutral-100); }
  .carimbo-mini { font-size: 10px; letter-spacing: 0.05em; fill: var(--color-neutral-500); }
  .carimbo-chave { font-size: 9.5px; letter-spacing: 0.16em; fill: var(--color-neutral-600); }
  .carimbo-valor { font-size: 12.5px; fill: var(--color-neutral-300); }
  .carimbo-valor-forte { font-size: 14.5px; font-weight: 600; fill: var(--color-neutral-100); }
  .carimbo-valor-mini { font-family: var(--font-tecnica); font-size: 11.5px;
                        fill: var(--color-neutral-300); }
  .escala-escura { fill: var(--color-neutral-300); }
  .escala-clara { fill: var(--color-text); stroke: var(--color-neutral-300); stroke-width: 1; }
</style>
