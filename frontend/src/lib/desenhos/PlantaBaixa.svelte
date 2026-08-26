<script>
  import {
    obra, sala, foco, palco, plateia, mezanino, foh, fontes,
    gabinetes, conjuntos, conjunto, caixas,
    fileirasPlateia, fileirasMezanino, lugares, polar, maiorDistancia
  } from './projeto.js';
  import { formatador, rotulos } from './rotulos.js';

  let { lang = 'pt' } = $props();

  // Mesma geometria, mesma cota, outra legenda — e a vírgula decimal vira
  // ponto, como sairia numa prancha emitida em inglês.
  const r = $derived(rotulos(lang));

  // A legenda do carimbo tinha x fixo por item (42, 146, 250, 358). "mezanino
  // acima" tem 91 unidades e terminava em 1199 — passava por cima da moldura,
  // que fecha em 1176. A fonte tecnica e' monoespacada, entao a fila se monta
  // da esquerda para a direita somando o que cada item realmente ocupa.
  const MINI = 10 * (0.6 + 0.05); // avanco do carimbo-mini, por caractere
  const legenda = $derived(
    [
      { marca: 'fila', larguraMarca: 34, texto: r.planta.legenda.poltronas },
      { marca: 'array', larguraMarca: 8, texto: r.planta.legenda.arranjo },
      { marca: 'delay', larguraMarca: 10, texto: r.planta.legenda.delay },
      { marca: 'peitoril', larguraMarca: 34, texto: r.planta.legenda.mezanino }
    ].reduce((acc, item) => {
      const x = acc.length ? acc.at(-1).fim + 20 : 0;
      return [...acc, { ...item, x, textoX: x + item.larguraMarca + 8,
                        fim: x + item.larguraMarca + 8 + item.texto.length * MINI }];
    }, [])
  );
  const fmt = $derived(formatador(lang));

  // Largura da sala corre no eixo horizontal da prancha e a profundidade no
  // vertical — o palco fica em cima, que é como a sala se lê de frente.
  const E = 10.4; // unidades do viewBox por metro
  const SX0 = 132;
  const SY0 = 92;
  const sx = (y) => SX0 + y * E;
  const sy = (x) => SY0 + x * E;
  const L = (m) => m * E;
  const grau = (r) => (r * 180) / Math.PI;

  const ptS = (raio, ang) => {
    const p = polar(raio, ang);
    return `${sx(p.y).toFixed(1)} ${sy(p.x).toFixed(1)}`;
  };

  /// Arco de raio constante. O sentido de varredura é 0 porque a projeção
  /// troca os eixos e inverte a orientação do plano.
  const arco = (raio, a0, a1) =>
    `M ${ptS(raio, a0)} A ${L(raio).toFixed(1)} ${L(raio).toFixed(1)} 0 0 0 ${ptS(raio, a1)}`;

  const tracoAssento = `${(0.46 * E).toFixed(2)} ${(0.09 * E).toFixed(2)}`;

  const primeira = fileirasPlateia[0];
  const ultimaTerrea = fileirasPlateia.at(-1);
  const primeiroMez = fileirasMezanino[0];
  const ultimoMez = fileirasMezanino.at(-1);

  /// Linha de centro de cada corredor radial, colhida fileira a fileira.
  function corredores(fileiras) {
    return [0, 1, 2, 3].map((b) =>
      fileiras
        .map((f) => {
          const ang = (f.blocos[b].a1 + f.blocos[b + 1].a0) / 2;
          const p = polar(f.raio, ang);
          return `${sx(p.y).toFixed(1)},${sy(p.x).toFixed(1)}`;
        })
        .join(' ')
    );
  }
  const corredoresTerrea = corredores(fileirasPlateia);
  const corredoresMez = corredores(fileirasMezanino);

  /// Contorno do mezanino: setor anelar entre o peitoril e a parede de fundo.
  const setorMezanino = (() => {
    const a = primeiroMez.abertura;
    const ri = primeiroMez.raio - 0.7;
    const re = ultimoMez.raio + 1.0;
    return `M ${ptS(ri, -a)} A ${L(ri).toFixed(1)} ${L(ri).toFixed(1)} 0 0 0 ${ptS(ri, a)}
            L ${ptS(re, a)} A ${L(re).toFixed(1)} ${L(re).toFixed(1)} 0 0 1 ${ptS(re, -a)} Z`;
  })();

  /// Cobertura horizontal de um arranjo: cunha simétrica em torno da mira
  /// **de verdade** — a mesma que a simulação usa, lida da caixa mais alta do
  /// conjunto. Enquanto o cone era desenhado por uma regra própria, a planta
  /// mostrava uma cobertura e o mapa calculava outra.
  function leque(grupo) {
    const alto = caixas.filter((c) => c.grupo === grupo).at(-1);
    // A abertura desenhada é a abertura da caixa. Um valor fixo aqui era mais
    // uma versão do sistema para a planta discordar do mapa.
    const meia = (alto.abertura * Math.PI) / 360;
    const fonte = { x: alto.x, y: alto.y };
    const dy = alto.mira.y - fonte.y;
    const dx = alto.mira.x - fonte.x;
    const mira = Math.atan2(dy, dx);
    const alcance = Math.hypot(dx, dy) * 1.04;
    const canto = (d) => {
      const a = mira + d;
      return `${sx(fonte.y + alcance * Math.sin(a)).toFixed(1)} ${sy(fonte.x + alcance * Math.cos(a)).toFixed(1)}`;
    };
    return `M ${sx(fonte.y).toFixed(1)} ${sy(fonte.x).toFixed(1)} L ${canto(-meia)} L ${canto(meia)} Z`;
  }

  /// As caixas saem de `gabinetes`. Em planta uma coluna pendurada é um
  /// retângulo só — todas as suas caixas estão na mesma prumada —, e uma linha
  /// de subgraves aparece caixa a caixa. Contagem, cota e posição vêm do mesmo
  /// lugar que o corte, a axonometria e a simulação leem.
  const COLUNAS = ['L', 'R', 'C', 'OF·L', 'OF·R', 'SUB·V'];
  const colunas = conjuntos.filter((c) => COLUNAS.includes(c.grupo));
  const enfileiradas = gabinetes.filter((g) => ['SUB', 'FF', 'MON'].includes(g.grupo));
  const cones = ['L', 'R', 'OF·L', 'OF·R'].map(leque);

  /// Onde o rótulo de cada conjunto cabe sem cair em cima de outro.
  const rotuloDe = (c) => {
    const centrado = Math.abs(c.y.meio - foco.y) < 1;
    const fora = c.y.meio < foco.y ? -1 : 1;
    return {
      x: sx(c.y.meio) + (centrado ? 0 : fora * 14),
      y: sy(c.x.meio) + (c.grupo === 'C' ? -26 : c.grupo === 'SUB·V' ? 30 : -22),
      ancora: centrado ? 'middle' : fora < 0 ? 'end' : 'start'
    };
  };

  const eixosX = [
    { r: 'A', m: 0 },
    { r: 'B', m: foco.y - palco.largura / 2 },
    { r: 'C', m: foco.y },
    { r: 'D', m: foco.y + palco.largura / 2 },
    { r: 'E', m: sala.largura }
  ];
  const eixosY = [
    { r: '1', m: 0 },
    { r: '2', m: palco.x1 },
    { r: '3', m: foco.x + primeira.raio },
    { r: '4', m: foco.x + primeiroMez.raio },
    { r: '5', m: sala.profundidade }
  ];

  const parciaisX = $derived([
    { de: 0, ate: foco.y - palco.largura / 2, t: fmt.dec(30) },
    { de: foco.y - palco.largura / 2, ate: foco.y + palco.largura / 2, t: fmt.dec(32) },
    { de: foco.y + palco.largura / 2, ate: sala.largura, t: fmt.dec(30) }
  ]);
  const parciaisY = $derived([
    { de: 0, ate: palco.x1, t: fmt.dec(18) },
    { de: palco.x1, ate: foco.x + primeira.raio, t: fmt.dec(5) },
    { de: foco.x + primeira.raio, ate: foco.x + ultimaTerrea.raio, t: fmt.dec(31) },
    { de: foco.x + ultimaTerrea.raio, ate: foco.x + primeiroMez.raio, t: fmt.dec(1) },
    { de: foco.x + primeiroMez.raio, ate: foco.x + ultimoMez.raio, t: fmt.dec(11) },
    { de: foco.x + ultimoMez.raio, ate: sala.profundidade, t: fmt.dec(4) }
  ]);

  /// F01 fica encostada na boca de cena, onde já passam a barra de subgraves e
  /// a prumada do subgrave voado: o rótulo desce um pouco para sair de baixo
  /// delas.
  const rotulosFileira = [
    { f: fileirasPlateia[0], t: 'F01', lado: 1, dy: 24 },
    { f: fileirasPlateia[15], t: 'F16' },
    { f: fileirasPlateia[31], t: 'F32' },
    { f: fileirasMezanino[0], t: 'M01' },
    { f: fileirasMezanino[11], t: 'M12' }
  ];

  const saidas = [
    { y: 6.0, x: palco.x1 + 3.0 },
    { y: sala.largura - 6.0, x: palco.x1 + 3.0 },
    { y: 6.0, x: 44.0 },
    { y: sala.largura - 6.0, x: 44.0 },
    { y: 20.0, x: sala.profundidade - 0.4 },
    { y: sala.largura - 20.0, x: sala.profundidade - 0.4 }
  ];
</script>

<figure class="prancha">
  <svg viewBox="0 0 1200 1190" role="img"
       aria-label={r.planta.aria(fmt.milhar(lugares.total))}>
    <defs>
      <pattern id="pl-parede" width="7" height="7" patternTransform="rotate(45)"
               patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="7" class="hachura" />
      </pattern>
      <clipPath id="pl-sala">
        <rect x={sx(0)} y={sy(0)} width={L(sala.largura)} height={L(sala.profundidade)} />
      </clipPath>
      <pattern id="pl-foh" width="9" height="9" patternTransform="rotate(-45)"
               patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="9" class="hachura-fina" />
      </pattern>
      <marker id="pl-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
              markerHeight="7" orient="auto-start-reverse">
        <path d="M0 1 L10 5 L0 9 z" class="preenche-cota" />
      </marker>
      <marker id="pl-seta-forte" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8"
              markerHeight="8" orient="auto-start-reverse">
        <path d="M0 1 L10 5 L0 9 z" class="preenche-critico" />
      </marker>
    </defs>

    <rect x="24" y="24" width="1152" height="1142" class="moldura" />

    <!-- ————— eixos de projeto ————— -->
    <g class="eixos">
      {#each eixosX as e}
        <line x1={sx(e.m)} y1="62" x2={sx(e.m)} y2={sy(sala.profundidade) + 16} />
        <circle cx={sx(e.m)} cy="62" r="13" class="bolha" />
        <text x={sx(e.m)} y="66" class="rot-eixo">{e.r}</text>
      {/each}
      {#each eixosY as e}
        <line x1="68" y1={sy(e.m)} x2={sx(sala.largura) + 16} y2={sy(e.m)} />
        <circle cx="68" cy={sy(e.m)} r="13" class="bolha" />
        <text x="68" y={sy(e.m) + 4} class="rot-eixo">{e.r}</text>
      {/each}
    </g>

    <!-- ————— envoltória ————— -->
    <rect x={sx(0)} y={sy(0)} width={L(sala.largura)} height={L(sala.profundidade)}
          fill="url(#pl-parede)" class="parede" />
    <rect x={sx(sala.parede)} y={sy(sala.parede)}
          width={L(sala.largura - 2 * sala.parede)}
          height={L(sala.profundidade - 2 * sala.parede)} class="interior" />

    <!-- ————— palco ————— -->
    <rect x={sx(foco.y - palco.largura / 2)} y={sy(palco.x0)} width={L(palco.largura)}
          height={L(palco.x1 - palco.x0)} class="palco" />
    <rect x={sx(foco.y - palco.ledLargura / 2)} y={sy(palco.x0 - 0.35)}
          width={L(palco.ledLargura)} height={L(0.7)} class="led" />
    <text x={sx(foco.y)} y={sy(palco.x0 - 0.9)} class="rot-peca" text-anchor="middle">
      {r.comum.painelLed(fmt.dec(palco.ledLargura, 2), fmt.dec(palco.ledAltura, 2))}
    </text>
    <line x1={sx(foco.y - palco.largura / 2)} y1={sy(palco.x1)}
          x2={sx(foco.y + palco.largura / 2)} y2={sy(palco.x1)} class="proscenio" />
    <text x={sx(foco.y)} y={sy(palco.x0 + 6.4)} class="rot-area" text-anchor="middle">{r.comum.palco}</text>
    <text x={sx(foco.y)} y={sy(palco.x0 + 8.6)} class="rot-cota-area" text-anchor="middle">
      {fmt.dec(palco.largura, 2)} × {fmt.dec(palco.x1 - palco.x0, 2)} m · ▲ +{fmt.dec(palco.nivel, 2)}
    </text>

    <!-- ————— plateia térrea ————— -->
    <g class="fileiras">
      {#each fileirasPlateia as f}
        {#each f.blocos as b}
          <path d={arco(f.raio, b.a0, b.a1)} style="stroke-dasharray:{tracoAssento}" />
        {/each}
      {/each}
    </g>
    <g class="corredores">
      {#each corredoresTerrea as pts}
        <polyline points={pts} />
      {/each}
      {#each corredoresMez as pts}
        <polyline points={pts} />
      {/each}
    </g>

    <!-- ————— mezanino ————— -->
    <path d={setorMezanino} class="setor-mezanino" />
    <g class="fileiras fileiras-mez">
      {#each fileirasMezanino as f}
        {#each f.blocos as b}
          <path d={arco(f.raio, b.a0, b.a1)} style="stroke-dasharray:{tracoAssento}" />
        {/each}
      {/each}
    </g>
    <path d={arco(primeiroMez.raio - 0.7, -primeiroMez.abertura, primeiroMez.abertura)}
          class="peitoril" />
    <text x={sx(foco.y)} y={sy(foco.x + ultimoMez.raio + 2.7)} class="rot-projecao"
          text-anchor="middle">
      {r.planta.mezaninoAcima(
        fmt.milhar(lugares.mezanino),
        fmt.dec(mezanino.nivelFrente, 2),
        fmt.dec(ultimoMez.nivel, 2)
      )}
    </text>

    <!-- ————— cabine de operação ————— -->
    <rect x={sx(foco.y - foh.largura / 2)} y={sy(foco.x + foh.raio - foh.profundidade / 2)}
          width={L(foh.largura)} height={L(foh.profundidade)} fill="url(#pl-foh)" class="foh" />
    <text x={sx(foco.y)} y={sy(foco.x + foh.raio) + 4} class="rot-foh" text-anchor="middle">{r.comum.foh}</text>

    <!-- ————— sistema de som ————— -->
    <g class="fontes">
      <g clip-path="url(#pl-sala)">
        {#each cones as c}
          <path d={c} class="cone" />
        {/each}
      </g>

      <!-- Colunas penduradas: um retângulo por conjunto, na prumada. -->
      {#each colunas as c}
        <rect
          x={sx(c.y.min)} y={sy(c.x.min)} width={L(c.y.tam)} height={L(c.x.tam)}
          class="array"
          class:array-centro={c.grupo === 'C'}
          class:subs={c.tipo === 'sub'}
        />
        <!-- O texto do rótulo é o mesmo do corte, escrito no mesmo lugar:
             duas versões da mesma frase divergem no dia em que uma delas
             muda. -->
        <text x={rotuloDe(c).x} y={rotuloDe(c).y} class="rot-fonte" text-anchor={rotuloDe(c).ancora}>
          {r.comum.conjunto(c.grupo, c.caixas, fmt.dec(c.voo))}
        </text>
      {/each}

      <!-- Subgraves de piso, preenchimento e retornos: caixa a caixa. -->
      {#each enfileiradas as g}
        <rect
          x={sx(g.y - g.larg / 2)} y={sy(g.x - g.prof / 2)}
          width={L(g.larg)} height={L(g.prof)}
          class={g.grupo === 'SUB' ? 'subs' : 'fill'}
        />
      {/each}
      <!-- A barra de subgraves é simétrica, e no eixo da sala ela cruza a
           prumada do subgrave voado: o rótulo sai pela ponta esquerda da
           barra, onde não há nada desenhado. -->
      <text x={sx(Math.min(...gabinetes.filter((g) => g.grupo === 'SUB').map((g) => g.y))) - 20}
            y={sy(fontes.subs.x) + 4} class="rot-fonte" text-anchor="end">
        {r.comum.sub(fontes.subs.caixas)}
      </text>

      {#each fontes.delays as d}
        <path d={arco(d.raio, -0.9, 0.9)} class="anel-delay" />
        {#each fontes.angulosDelay as a}
          <circle cx={sx(polar(d.raio, a).y)} cy={sy(polar(d.raio, a).x)} r="5"
                  class="ponto-delay" />
        {/each}
        <!-- O rótulo cresce para dentro da sala. Crescendo para fora, o do
             segundo anel — que é o de maior raio — saía da folha e caía em
             cima da cota lateral. -->
        <text x={sx(polar(d.raio, 0.98).y) - 10} y={sy(polar(d.raio, 0.98).x)}
              class="rot-fonte" text-anchor="end">
          {r.comum.delay(d.rotulo, conjunto(d.rotulo).caixas, fmt.dec(conjunto(d.rotulo).voo), d.atraso)}
        </text>
      {/each}
    </g>

    <!-- ————— eixo e marcação do corte ————— -->
    <line x1={sx(foco.y)} y1={sy(-2.2)} x2={sx(foco.y)} y2={sy(sala.profundidade + 2.2)}
          class="linha-eixo" />
    <g class="corte">
      <line x1={sx(foco.y)} y1={sy(-1.8)} x2={sx(foco.y)} y2={sy(1.2)}
            marker-start="url(#pl-seta)" />
      <line x1={sx(foco.y)} y1={sy(sala.profundidade - 1.2)} x2={sx(foco.y)}
            y2={sy(sala.profundidade + 1.8)} marker-end="url(#pl-seta)" />
      <text x={sx(foco.y) + 26} y={sy(-0.5)} class="rot-corte">A</text>
      <text x={sx(foco.y) + 26} y={sy(sala.profundidade + 2.6)} class="rot-corte">A</text>
    </g>

    <!-- ————— saídas ————— -->
    <g class="saidas">
      {#each saidas as s}
        <rect x={sx(s.y) - 11} y={sy(s.x) - 5} width="22" height="10" class="porta" />
      {/each}
    </g>

    <!-- ————— rótulos de fileira ————— -->
    {#each rotulosFileira as r}
      <text x={sx(polar(r.f.raio, (r.lado ?? -1) * r.f.abertura).y) + (r.lado === 1 ? 16 : -16)}
            y={sy(polar(r.f.raio, (r.lado ?? -1) * r.f.abertura).x) + 4 + (r.dy ?? 0)} class="rot-fila"
            text-anchor={r.lado === 1 ? 'start' : 'end'}>
        {r.t}
      </text>
    {/each}

    <!-- ————— norte e escala ————— -->
    <g class="norte" transform="translate({sx(sala.largura) - 34}, {sy(3.6)})">
      <circle r="18" class="bolha" />
      <path d="M0 -13 L5 6 L0 2 L-5 6 z" class="preenche-norte" />
      <text y="34" class="rot-eixo">N</text>
    </g>

    <g class="escala" transform="translate({sx(0)}, {sy(sala.profundidade) + 108})">
      {#each [0, 1, 2, 3] as i}
        <rect x={i * L(5)} y="0" width={L(5)} height="9"
              class={i % 2 ? 'escala-clara' : 'escala-escura'} />
      {/each}
      {#each [0, 10, 20] as v, i}
        <text x={i * L(10)} y="26" class="rot-cota" text-anchor="middle">{v}</text>
      {/each}
      <text x={L(20) + 16} y="26" class="rot-cota">m · {r.comum.esc} {obra.escalaPlanta}</text>
    </g>

    <!-- ————— cotas ————— -->
    <g class="cotas">
      {#each parciaisX as c}
        <line x1={sx(c.de)} y1="870" x2={sx(c.ate)} y2="870"
              marker-start="url(#pl-seta)" marker-end="url(#pl-seta)" />
        <line x1={sx(c.de)} y1={sy(sala.profundidade) + 6} x2={sx(c.de)} y2="876" class="chamada" />
        <text x={sx((c.de + c.ate) / 2)} y="862" class="rot-cota" text-anchor="middle">{c.t}</text>
      {/each}
      <line x1={sx(sala.largura)} y1={sy(sala.profundidade) + 6} x2={sx(sala.largura)}
            y2="910" class="chamada" />
      <line x1={sx(0)} y1="904" x2={sx(sala.largura)} y2="904"
            marker-start="url(#pl-seta)" marker-end="url(#pl-seta)" />
      <text x={sx(sala.largura / 2)} y="896" class="rot-cota-forte" text-anchor="middle">
        {fmt.dec(sala.largura, 2)}
      </text>

      {#each parciaisY as c}
        <line x1="108" y1={sy(c.de)} x2="108" y2={sy(c.ate)}
              marker-start="url(#pl-seta)" marker-end="url(#pl-seta)" />
        <line x1="102" y1={sy(c.de)} x2={sx(0) - 6} y2={sy(c.de)} class="chamada" />
        <text x="98" y={sy((c.de + c.ate) / 2)} class="rot-cota"
              transform="rotate(-90 98 {sy((c.de + c.ate) / 2)})" text-anchor="middle">{c.t}</text>
      {/each}
      <text x="1116" y={sy(sala.profundidade / 2)} class="rot-cota-forte"
            transform="rotate(-90 1116 {sy(sala.profundidade / 2)})" text-anchor="middle">
        {fmt.dec(sala.profundidade, 2)}
      </text>
      <line x1="1122" y1={sy(0)} x2="1122" y2={sy(sala.profundidade)}
            marker-start="url(#pl-seta)" marker-end="url(#pl-seta)" />
    </g>

    <!-- maior distância de escuta: a cota que dimensiona o sistema -->
    <g class="cota-critica">
      <line x1="1154" y1={sy(fontes.principais[0].x)} x2="1154" y2={sy(foco.x + ultimoMez.raio)}
            marker-start="url(#pl-seta-forte)" marker-end="url(#pl-seta-forte)" />
      <line x1={sx(foco.y + 13)} y1={sy(fontes.principais[0].x)} x2="1148"
            y2={sy(fontes.principais[0].x)} class="chamada-critica" />
      <line x1={sx(foco.y)} y1={sy(foco.x + ultimoMez.raio)} x2="1148"
            y2={sy(foco.x + ultimoMez.raio)} class="chamada-critica" />
      <text x="1146" y={sy((fontes.principais[0].x + foco.x + ultimoMez.raio) / 2)}
            class="rot-critico"
            transform="rotate(-90 1146 {sy((fontes.principais[0].x + foco.x + ultimoMez.raio) / 2)})"
            text-anchor="middle">
        {r.comum.distancia(fmt.dec(maiorDistancia.valor, 2))}
      </text>
    </g>

    <!-- ————— carimbo ————— -->
    <g class="carimbo">
      <rect x="24" y="972" width="1152" height="194" />
      <line x1="24" y1="1028" x2="1176" y2="1028" />
      <line x1="352" y1="972" x2="352" y2="1166" />
      <line x1="726" y1="972" x2="726" y2="1166" />
      <line x1="726" y1="1084" x2="1176" y2="1084" />
      <line x1="884" y1="1028" x2="884" y2="1166" />
      <line x1="1030" y1="1028" x2="1030" y2="1166" />

      <text x="48" y="998" class="carimbo-marca">GARIOLI LABS</text>
      <text x="48" y="1014" class="carimbo-mini">{r.obra.disciplina}</text>
      <text x="48" y="1048" class="carimbo-chave">{r.carimbo.responsavelChave}</text>
      <text x="48" y="1068" class="carimbo-valor">{r.obra.responsavel}</text>
      <text x="48" y="1098" class="carimbo-chave">{r.carimbo.sala}</text>
      <text x="48" y="1118" class="carimbo-valor">
        {r.planta.salaFicha(fmt.milhar(sala.area), fmt.milhar(sala.volume), sala.ruidoFundo)}
      </text>
      <text x="48" y="1146" class="carimbo-mini">
        {r.comum.peDireito(
          fmt.dec(sala.alturaFundo, 2),
          fmt.dec(sala.alturaProscenio, 2),
          fmt.dec(sala.alturaMedia, 2)
        )}
      </text>

      <text x="376" y="998" class="carimbo-chave">{r.carimbo.obra}</text>
      <text x="376" y="1016" class="carimbo-valor-forte">{r.obra.nome}</text>
      <text x="376" y="1048" class="carimbo-chave">{r.carimbo.conteudo}</text>
      <text x="376" y="1068" class="carimbo-valor">{r.planta.conteudo}</text>
      <text x="376" y="1098" class="carimbo-chave">{r.carimbo.lugares}</text>
      <text x="376" y="1118" class="carimbo-valor">
        {r.comum.lugares(
          fmt.milhar(lugares.plateia),
          fmt.milhar(lugares.mezanino),
          fmt.milhar(lugares.total)
        )}
      </text>
      <text x="376" y="1146" class="carimbo-mini">
        {r.planta.fileiras(
          plateia.fileiras,
          fmt.dec(plateia.raioInicial, 2),
          fmt.dec(fileirasPlateia.at(-1).raio, 2),
          plateia.aberturaGraus
        )}
      </text>

      <text x="750" y="998" class="carimbo-chave">{r.carimbo.legenda}</text>
      <g transform="translate(750, 1006)">
        {#each legenda as l}
          {#if l.marca === 'fila'}
            <line x1={l.x} y1="7" x2={l.x + l.larguraMarca} y2="7" class="leg-fila" />
          {:else if l.marca === 'array'}
            <rect x={l.x} y="1" width={l.larguraMarca} height="13" class="leg-array" />
          {:else if l.marca === 'delay'}
            <circle cx={l.x + l.larguraMarca / 2} cy="7" r="5" class="leg-delay" />
          {:else}
            <line x1={l.x} y1="7" x2={l.x + l.larguraMarca} y2="7" class="leg-peitoril" />
          {/if}
          <text x={l.textoX} y="11" class="carimbo-mini">{l.texto}</text>
        {/each}
      </g>

      <text x="750" y="1048" class="carimbo-chave">{r.carimbo.escala}</text>
      <text x="750" y="1070" class="carimbo-valor">{obra.escalaPlanta}</text>
      <text x="750" y="1104" class="carimbo-chave">{r.carimbo.data}</text>
      <text x="750" y="1124" class="carimbo-valor">{obra.data}</text>
      <text x="908" y="1048" class="carimbo-chave">{r.carimbo.prancha}</text>
      <text x="908" y="1070" class="carimbo-valor-forte">{obra.prancha}</text>
      <text x="908" y="1104" class="carimbo-chave">{r.carimbo.folha}</text>
      <text x="908" y="1124" class="carimbo-valor">1 / 4</text>
      <text x="1054" y="1048" class="carimbo-chave">{r.carimbo.rev}</text>
      <text x="1054" y="1070" class="carimbo-valor-forte">{obra.revisao}</text>
      <text x="1054" y="1104" class="carimbo-chave">{r.carimbo.unid}</text>
      <text x="1054" y="1124" class="carimbo-valor">{r.carimbo.metros}</text>
    </g>
  </svg>

  <figcaption>
    {r.planta.figcaption(plateia.fileiras, fmt.milhar(lugares.mezanino))}
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

  .moldura, .carimbo > rect, .carimbo > line {
    fill: none;
    stroke: var(--color-neutral-700);
    stroke-width: 1;
  }
  .parede { stroke: var(--color-neutral-300); stroke-width: 1.6; }
  .hachura { stroke: var(--color-neutral-700); stroke-width: 1.5; }
  .hachura-fina { stroke: var(--color-neutral-700); stroke-width: 1.1; }
  .interior { fill: var(--color-text); stroke: var(--color-neutral-500); stroke-width: 1; }

  .palco { fill: rgba(248, 244, 244, 0.05); stroke: var(--color-neutral-500); stroke-width: 1.2; }
  .led { fill: var(--color-accent-700); stroke: var(--color-accent-500); stroke-width: 1; }
  .proscenio { stroke: var(--color-neutral-200); stroke-width: 2.6; }

  .fileiras path {
    fill: none;
    stroke: rgba(248, 244, 244, 0.42);
    stroke-width: 5.2;
    stroke-linecap: butt;
  }
  .fileiras-mez path { stroke: rgba(255, 118, 92, 0.5); }
  .corredores polyline {
    fill: none;
    stroke: var(--color-neutral-800);
    stroke-width: 1;
    stroke-dasharray: 6 5;
  }
  .setor-mezanino {
    fill: rgba(255, 86, 60, 0.04);
    stroke: var(--color-accent-800);
    stroke-width: 1;
    stroke-dasharray: 12 5 3 5;
  }
  .peitoril { fill: none; stroke: var(--color-accent-500); stroke-width: 2; }
  .foh { stroke: var(--color-neutral-300); stroke-width: 1.2; }

  .cone { fill: rgba(255, 86, 60, 0.055); stroke: none; }
  .array { fill: var(--color-accent-600); stroke: var(--color-neutral-100); stroke-width: 0.8; }
  .array-centro { fill: var(--color-accent-700); }
  .subs { fill: var(--color-accent-800); stroke: var(--color-accent-600); stroke-width: 0.8; }
  .fill { fill: var(--color-accent-500); stroke: var(--color-neutral-100); stroke-width: 0.5; }
  .anel-delay { fill: none; stroke: var(--color-accent-700); stroke-width: 1;
                stroke-dasharray: 9 6; }
  .ponto-delay { fill: var(--color-accent-500); stroke: var(--color-text); stroke-width: 1; }

  .linha-eixo { stroke: var(--color-neutral-700); stroke-width: 1;
                stroke-dasharray: 18 6 2 6; }
  .corte line { stroke: var(--color-neutral-200); stroke-width: 2; }
  .porta { fill: var(--color-text); stroke: var(--color-neutral-200); stroke-width: 1.6; }

  .eixos line { stroke: var(--color-neutral-800); stroke-width: 1; stroke-dasharray: 16 6 2 6; }
  .bolha { fill: var(--color-text); stroke: var(--color-neutral-500); stroke-width: 1; }
  .preenche-norte { fill: var(--color-neutral-200); }
  .preenche-cota { fill: var(--color-neutral-500); }
  .preenche-critico { fill: var(--color-accent-500); }

  .escala-escura { fill: var(--color-neutral-300); }
  .escala-clara { fill: var(--color-text); stroke: var(--color-neutral-300); stroke-width: 1; }

  .cotas line { stroke: var(--color-neutral-500); stroke-width: 1; }
  .chamada { stroke: var(--color-neutral-700); stroke-width: 0.8; }
  .cota-critica line { stroke: var(--color-accent-500); stroke-width: 1.2; }
  .chamada-critica { stroke: var(--color-accent-800); stroke-width: 0.8;
                     stroke-dasharray: 5 4; }

  text { font-family: var(--font-tecnica); fill: var(--color-neutral-400); }

  /* Wipeout: a anotacao abre o proprio claro na geometria. "SUB · 12 cx" caia
     em cima da barra do subgrave e do eixo C, e as marcas de delay caiam sobre
     as fileiras. */
  .rot-peca, .rot-fonte, .rot-projecao, .rot-fila, .rot-critico, .rot-cota-area {
    paint-order: stroke;
    stroke: var(--color-text);
    stroke-width: 3px;
    stroke-linejoin: round;
  }
  .rot-eixo { font-size: 13px; font-weight: 600; fill: var(--color-neutral-200);
              text-anchor: middle; }
  .rot-area { font-size: 17px; font-weight: 600; letter-spacing: 0.2em;
              fill: var(--color-neutral-200); }
  .rot-cota-area { font-size: 11.5px; letter-spacing: 0.04em; }
  .rot-peca { font-size: 10.5px; letter-spacing: 0.12em; }
  .rot-foh { font-size: 12px; font-weight: 600; letter-spacing: 0.16em;
             fill: var(--color-neutral-200); }
  .rot-projecao { font-size: 11px; letter-spacing: 0.14em; fill: var(--color-accent-400); }
  .rot-fonte { font-size: 10px; letter-spacing: 0.08em; fill: var(--color-accent-400); }
  .rot-fila { font-size: 9.5px; letter-spacing: 0.1em; fill: var(--color-neutral-600); }
  .rot-corte { font-size: 15px; font-weight: 700; fill: var(--color-neutral-200); }
  .rot-cota { font-size: 11px; }
  .rot-cota-forte { font-size: 13.5px; font-weight: 600; fill: var(--color-neutral-200); }
  .rot-critico { font-size: 12px; font-weight: 600; fill: var(--color-accent-400); }

  .carimbo-marca { font-family: var(--font-heading); font-size: 20px; font-weight: 800;
                   letter-spacing: 0.13em; fill: var(--color-neutral-100); }
  .carimbo-mini { font-size: 10px; letter-spacing: 0.05em; fill: var(--color-neutral-500); }
  .carimbo-chave { font-size: 9.5px; letter-spacing: 0.16em; fill: var(--color-neutral-600); }
  .carimbo-valor { font-size: 12.5px; fill: var(--color-neutral-300); }
  .carimbo-valor-forte { font-size: 14.5px; font-weight: 600; fill: var(--color-neutral-100); }

  .leg-fila { stroke: rgba(248, 244, 244, 0.42); stroke-width: 5.2; stroke-dasharray: 4.8 0.9; }
  .leg-array { fill: var(--color-accent-600); }
  .leg-delay { fill: var(--color-accent-500); }
  .leg-peitoril { stroke: var(--color-accent-800); stroke-width: 1;
                  stroke-dasharray: 12 5 3 5; }
</style>
