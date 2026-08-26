<script>
  import {
    obra, sala, foco, palco, plateia, mezanino, fontes, gabinetes, conjunto,
    fileirasPlateia, fileirasMezanino, lugares, polar, maiorDistancia, teto
  } from './projeto.js';
  import { formatador, rotulos } from './rotulos.js';

  let { lang = 'pt' } = $props();

  const r = $derived(rotulos(lang));
  const fmt = $derived(formatador(lang));

  // Isometria 30°: profundidade e largura descem meio metro de tela por metro
  // de sala, a altura sobe na vertical. A câmera fica atrás e à direita da
  // plateia — é de onde se olha o palco por cima das fileiras, e é a única
  // vista em que o mezanino não esconde a sala inteira.
  const C30 = Math.cos(Math.PI / 6);
  const E = 7.6; // unidades do viewBox por metro
  const OX = 673;
  const OY = 222;
  const projX = (x, y) => OX + (x - y) * C30 * E;
  const projY = (x, y, z) => OY + ((x + y) / 2 - z) * E;
  const p = (x, y, z) => `${projX(x, y).toFixed(1)} ${projY(x, y, z).toFixed(1)}`;
  const linha = (pts) => 'M ' + pts.map(([x, y, z]) => p(x, y, z)).join(' L ');
  const poli = (pts) => linha(pts) + ' Z';

  const P = sala.profundidade;
  const W = sala.largura;
  const ultimoMez = fileirasMezanino.at(-1);
  const primeiroMez = fileirasMezanino[0];

  const piso = poli([[0, 0, 0], [P, 0, 0], [P, W, 0], [0, W, 0]]);

  // As duas paredes que ficam longe da câmera fecham; as duas da frente são só
  // a linha do piso, como num corte — senão elas escondem tudo o que interessa.
  const paredeLateral = poli([
    [0, 0, 0], [P, 0, 0], [P, 0, teto(P)], [palco.x1, 0, teto(palco.x1)], [0, 0, teto(0)]
  ]);
  const paredePalco = poli([[0, 0, 0], [0, W, 0], [0, W, teto(0)], [0, 0, teto(0)]]);

  // O forro não é uma superfície cheia: fosse, a sala sumiria embaixo dele.
  // Ele aparece como nervuras, que é o suficiente para o plano se ler.
  const nervurasLargura = [0, W / 4, W / 2, (3 * W) / 4, W].map((v) =>
    linha([[0, v, teto(0)], [palco.x1, v, teto(palco.x1)], [P, v, teto(P)]])
  );
  const nervurasProfundidade = [0, palco.x1, 44, P].map((u) =>
    linha([[u, 0, teto(u)], [u, W, teto(u)]])
  );

  /// As três faces de uma caixa que a câmera enxerga: o topo, a face de maior
  /// profundidade e a face de maior largura.
  function bloco(x0, x1, y0, y1, z0, z1) {
    return {
      topo: poli([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]),
      frente: poli([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]),
      lado: poli([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]])
    };
  }

  const palcoBloco = bloco(
    palco.x0, palco.x1,
    foco.y - palco.largura / 2, foco.y + palco.largura / 2,
    0, palco.nivel
  );
  const led = poli([
    [palco.x0, foco.y - palco.ledLargura / 2, palco.nivel],
    [palco.x0, foco.y + palco.ledLargura / 2, palco.nivel],
    [palco.x0, foco.y + palco.ledLargura / 2, palco.nivel + palco.ledAltura],
    [palco.x0, foco.y - palco.ledLargura / 2, palco.nivel + palco.ledAltura]
  ]);

  /// Uma fileira inteira num único traço: cinco blocos, com a lacuna dos
  /// corredores entre eles, na altura do encosto.
  function fileiraEm(f, alturaEncosto = 0.45) {
    return f.blocos
      .map((b) => {
        const pts = [];
        for (let i = 0; i <= 6; i++) {
          const a = b.a0 + ((b.a1 - b.a0) * i) / 6;
          const q = polar(f.raio, a);
          pts.push([q.x, q.y, f.nivel + alturaEncosto]);
        }
        return linha(pts);
      })
      .join(' ');
  }

  const arcosTerrea = fileirasPlateia.map((f) => fileiraEm(f));
  const arcosMezanino = fileirasMezanino.map((f) => fileiraEm(f));

  /// Amostragem de um arco completo da fileira, para as superfícies do mezanino.
  function arcoCheio(raio, abertura, z, n = 40) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = -abertura + (2 * abertura * i) / n;
      const q = polar(raio, a);
      pts.push([q.x, q.y, z]);
    }
    return pts;
  }

  const raioPeitoril = mezanino.raioInicial - 0.7;
  const lajeMezanino = poli([
    ...arcoCheio(raioPeitoril, primeiroMez.abertura, mezanino.nivelFrente),
    ...arcoCheio(ultimoMez.raio + 1.2, ultimoMez.abertura, ultimoMez.nivel).reverse()
  ]);
  const peitoril = poli([
    ...arcoCheio(raioPeitoril, primeiroMez.abertura, mezanino.nivelFrente),
    ...arcoCheio(raioPeitoril, primeiroMez.abertura, mezanino.nivelFrente - 2.2).reverse()
  ]);

  /// Cada gabinete do projeto vira um blocozinho no lugar exato em que está
  /// pendurado, com o tamanho que ele tem de verdade. O tamanho vinha de uma
  /// tabela própria deste desenho — e uma tabela própria é uma segunda versão
  /// do sistema, que envelhece sozinha.
  const equipamentos = gabinetes
    .map((g) => ({
      tipo: g.tipo,
      ordem: g.x + g.y,
      faces: bloco(
        g.x - g.prof / 2, g.x + g.prof / 2,
        g.y - g.larg / 2, g.y + g.larg / 2,
        g.z - g.alt / 2, g.z + g.alt / 2
      )
    }))
    .sort((a, b) => a.ordem - b.ordem);

  const alcance = linha([
    [fontes.principais[0].x, fontes.principais[0].y, fontes.principais[0].altura],
    [foco.x + ultimoMez.raio, foco.y, ultimoMez.nivel + 1.2]
  ]);
  /// O rótulo não fica no meio do traço: ali ele cai em cima do próprio traço e
  /// de um delay. Fica no primeiro quinto, onde o vão entre o palco e a
  /// primeira fileira está vazio, e recuado para a esquerda da linha.
  const rotuloAlcance = (() => {
    const t = 0.2;
    const a = fontes.principais[0];
    const b = { x: foco.x + ultimoMez.raio, y: foco.y, z: ultimoMez.nivel + 1.2 };
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.altura + (b.z - a.altura) * t
    };
  })();

  /// Cota de altura no canto do fundo do palco e no canto da parede de fundo.
  const cotas = [
    { x: 0, y: 0, h: teto(0), lado: 1, t: () => fmt.dec(sala.alturaProscenio) },
    // A cota do fundo encosta na moldura: o texto vai para dentro do desenho.
    { x: P, y: 0, h: teto(P), lado: -1, t: () => fmt.dec(sala.alturaFundo) }
  ];

  // Os rótulos saem na ponta de baixo do leque: é a metade vazia da folha, e
  // a de cima já tem o traço de alcance e os delays.
  const marcasFileira = [
    // A primeira fileira encosta na boca de cena, onde já estão os subgraves:
    // o rótulo dela cairia em cima deles.
    { f: fileirasPlateia[15], t: 'F16' },
    { f: fileirasPlateia[31], t: 'F32' },
    { f: fileirasMezanino[11], t: 'M12' }
  ].map((m) => ({ ...m, p: polar(m.f.raio, m.f.abertura) }));

  const nota = $derived(r.axo.nota(fmt.dec(plateia.rake), fmt.dec(mezanino.rake)));

  const legenda = $derived([
    { classe: 'sw-envoltoria', t: r.axo.legenda.envoltoria },
    { classe: 'sw-terrea', t: r.axo.legenda.terrea(plateia.fileiras) },
    { classe: 'sw-mezanino', t: r.axo.legenda.mezanino(mezanino.fileiras) },
    { classe: 'sw-arranjo', t: r.axo.legenda.arranjos },
    { classe: 'sw-complemento', t: r.axo.legenda.complementos },
    { classe: 'sw-alcance', t: r.axo.legenda.alcance }
  ]);
</script>

<figure class="prancha">
  <svg viewBox="0 0 1200 1190" role="img" aria-label={r.axo.aria(fmt.milhar(lugares.total))}>
    <rect x="24" y="24" width="1152" height="1142" class="moldura" />

    <!-- ————— título e legenda ————— -->
    <text x="56" y="86" class="titulo-folha">{r.axo.titulo}</text>
    <text x="56" y="108" class="rot-peca">
      {r.axo.ficha(fmt.dec(P), fmt.dec(W), fmt.dec(sala.alturaProscenio))}
    </text>

    <g class="legenda" transform="translate(56, 146)">
      {#each legenda as item, i}
        <rect x="0" y={i * 26} width="26" height="12" class={item.classe} />
        <text x="38" y={i * 26 + 11} class="rot-legenda">{item.t}</text>
      {/each}
    </g>

    <!-- A nota fica embaixo, à esquerda: é a única faixa da folha que o
         losango da sala não atravessa. -->
    {#each nota as l, i}
      <text x="56" y={886 + i * 19} class="rot-nota">{l}</text>
    {/each}

    <!-- ————— envoltória ————— -->
    <path d={piso} class="piso" />
    <path d={paredeLateral} class="parede" />
    <path d={paredePalco} class="parede" />
    {#each nervurasLargura as d}
      <path {d} class="forro" />
    {/each}
    {#each nervurasProfundidade as d}
      <path {d} class="forro-transversal" />
    {/each}

    <!-- ————— palco ————— -->
    <path d={palcoBloco.topo} class="palco-topo" />
    <path d={palcoBloco.frente} class="palco-face" />
    <path d={palcoBloco.lado} class="palco-face" />
    <path d={led} class="led" />
    <!-- O rótulo vai para a quina livre do palco, à frente e à esquerda: no
         centro, e mesmo no canto de trás, ele fica por baixo de uma prumada
         de caixas — o side hang é a mais baixa delas. -->
    <text x={projX(palco.x0 + 5, foco.y + 16)} y={projY(palco.x0 + 5, foco.y + 16, palco.nivel) - 4}
          class="rot-area" text-anchor="middle">{r.comum.palco}</text>

    <!-- ————— plateia térrea ————— -->
    <g class="fileiras">
      {#each arcosTerrea as d}
        <path {d} />
      {/each}
    </g>

    <!-- ————— mezanino ————— -->
    <path d={lajeMezanino} class="laje" />
    <path d={peitoril} class="peitoril" />
    <g class="fileiras fileiras-mez">
      {#each arcosMezanino as d}
        <path {d} />
      {/each}
    </g>

    <!-- ————— sistema ————— -->
    {#each equipamentos as eq}
      <path d={eq.faces.lado} class="eq-face eq-{eq.tipo}" />
      <path d={eq.faces.frente} class="eq-face eq-{eq.tipo}" />
      <path d={eq.faces.topo} class="eq-topo eq-{eq.tipo}" />
    {/each}

    {#each fontes.principais as fonte}
      <text x={projX(fonte.x, fonte.y)} y={projY(fonte.x, fonte.y, fonte.altura + 5.6)}
            class="rot-fonte" text-anchor="middle">{fonte.rotulo}</text>
    {/each}
    <text x={projX(fontes.delays[1].raio + foco.x, foco.y)}
          y={projY(fontes.delays[1].raio + foco.x, foco.y, fontes.delays[1].altura + 1.4)}
          class="rot-fonte" text-anchor="middle">{fontes.delays[1].rotulo}</text>
    <text x={projX(conjunto('SUB·V').x.meio, foco.y)}
          y={projY(conjunto('SUB·V').x.meio, foco.y, conjunto('SUB·V').z.max + 1.4)}
          class="rot-fonte" text-anchor="middle">SUB·V</text>
    <!-- O cluster central fica sob a coluna de subgraves voados, no mesmo
         eixo: o rótulo desce para o pé da coluna, senão os dois se escrevem
         no mesmo ponto. -->
    <text x={projX(conjunto('C').x.meio, foco.y)}
          y={projY(conjunto('C').x.meio, foco.y, conjunto('C').z.min - 0.9)}
          class="rot-fonte" text-anchor="middle">C</text>
    {#each ['OF·L', 'OF·R'] as g}
      <text x={projX(conjunto(g).x.meio, conjunto(g).y.meio)}
            y={projY(conjunto(g).x.meio, conjunto(g).y.meio, conjunto(g).z.max + 1.4)}
            class="rot-fonte" text-anchor="middle">{g}</text>
    {/each}

    <!-- ————— maior distância ————— -->
    <path d={alcance} class="alcance" />
    <text x={projX(rotuloAlcance.x, rotuloAlcance.y) - 12}
          y={projY(rotuloAlcance.x, rotuloAlcance.y, rotuloAlcance.z) - 6}
          class="rot-critico" text-anchor="end">
      {fmt.dec(maiorDistancia.valor)} m
    </text>

    <!-- ————— cotas de altura ————— -->
    <g class="cotas">
      {#each cotas as c}
        <line x1={projX(c.x, c.y)} y1={projY(c.x, c.y, 0)}
              x2={projX(c.x, c.y)} y2={projY(c.x, c.y, c.h)} marker-start="url(#ax-seta)"
              marker-end="url(#ax-seta)" />
        <text x={projX(c.x, c.y) + c.lado * 10} y={projY(c.x, c.y, c.h / 2)}
              class="rot-cota" text-anchor={c.lado > 0 ? 'start' : 'end'}>
          {c.t()} m
        </text>
      {/each}
    </g>

    {#each marcasFileira as m}
      <text x={projX(m.p.x, m.p.y) - 12} y={projY(m.p.x, m.p.y, m.f.nivel) + 4}
            class="rot-fileira" text-anchor="end">{m.t}</text>
    {/each}

    <defs>
      <marker id="ax-seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7"
              markerHeight="7" orient="auto-start-reverse">
        <path d="M0 1 L10 5 L0 9 z" class="preenche-cota" />
      </marker>
    </defs>

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
          fmt.dec(sala.alturaFundo),
          fmt.dec(sala.alturaProscenio),
          fmt.dec(sala.alturaMedia)
        )}
      </text>

      <text x="376" y="998" class="carimbo-chave">{r.carimbo.obra}</text>
      <text x="376" y="1016" class="carimbo-valor-forte">{r.obra.nome}</text>
      <text x="376" y="1048" class="carimbo-chave">{r.carimbo.conteudo}</text>
      <text x="376" y="1068" class="carimbo-valor">{r.axo.conteudo}</text>
      <text x="376" y="1098" class="carimbo-chave">{r.carimbo.lugares}</text>
      <text x="376" y="1118" class="carimbo-valor">
        {r.comum.lugares(
          fmt.milhar(lugares.plateia),
          fmt.milhar(lugares.mezanino),
          fmt.milhar(lugares.total)
        )}
      </text>
      <text x="376" y="1146" class="carimbo-mini">
        {r.comum.distancia(fmt.dec(maiorDistancia.valor))}
      </text>

      <text x="750" y="998" class="carimbo-chave">{r.carimbo.legenda}</text>
      <g transform="translate(750, 1006)">
        <rect x="0" y="1" width="22" height="11" class="sw-terrea" />
        <text x="30" y="11" class="carimbo-mini">{r.axo.legenda.terrea(plateia.fileiras)}</text>
        <rect x="196" y="1" width="22" height="11" class="sw-mezanino" />
        <text x="226" y="11" class="carimbo-mini">{r.axo.legenda.mezanino(mezanino.fileiras)}</text>
      </g>

      <text x="750" y="1048" class="carimbo-chave">{r.carimbo.escala}</text>
      <text x="750" y="1070" class="carimbo-valor">{obra.escalaCorte}</text>
      <text x="750" y="1104" class="carimbo-chave">{r.carimbo.data}</text>
      <text x="750" y="1124" class="carimbo-valor">{obra.data}</text>
      <text x="908" y="1048" class="carimbo-chave">{r.carimbo.prancha}</text>
      <text x="908" y="1070" class="carimbo-valor-forte">AC-03</text>
      <text x="908" y="1104" class="carimbo-chave">{r.carimbo.folha}</text>
      <text x="908" y="1124" class="carimbo-valor">3 / 4</text>
      <text x="1054" y="1048" class="carimbo-chave">{r.carimbo.rev}</text>
      <text x="1054" y="1070" class="carimbo-valor-forte">{obra.revisao}</text>
      <text x="1054" y="1104" class="carimbo-chave">{r.carimbo.unid}</text>
      <text x="1054" y="1124" class="carimbo-valor">{r.carimbo.metros}</text>
    </g>
  </svg>

  <figcaption>
    {r.axo.figcaption(
      fmt.milhar(lugares.total),
      fmt.dec(mezanino.nivelFrente),
      fmt.dec(sala.peDireitoLivre)
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

  .moldura, .carimbo > rect, .carimbo > line {
    fill: none;
    stroke: var(--color-neutral-700);
    stroke-width: 1;
  }

  .piso { fill: rgba(248, 244, 244, 0.02); stroke: var(--color-neutral-600); stroke-width: 1.2; }
  .parede { fill: rgba(248, 244, 244, 0.035); stroke: var(--color-neutral-500); stroke-width: 1.2; }
  .forro { fill: none; stroke: var(--color-neutral-200); stroke-width: 1.4; opacity: 0.55; }
  .forro-transversal { fill: none; stroke: var(--color-neutral-700); stroke-width: 1; }

  .palco-topo { fill: rgba(248, 244, 244, 0.08); stroke: var(--color-neutral-300); stroke-width: 1.1; }
  .palco-face { fill: rgba(248, 244, 244, 0.03); stroke: var(--color-neutral-500); stroke-width: 1; }
  .led { fill: var(--color-accent-600); stroke: var(--color-accent-400); stroke-width: 0.8; }

  /* Claro sobre claro é invisível: esta prancha não tem o piso escuro que a
     planta tem, e as 32 fileiras da plateia sumiam na folha — a legenda
     prometia um arco que o desenho não mostrava. */
  .fileiras path { fill: none; stroke: var(--color-neutral-500); stroke-width: 1.5; }
  .fileiras-mez path { stroke: rgba(255, 118, 92, 0.6); }
  .laje { fill: rgba(255, 86, 60, 0.07); stroke: var(--color-accent-800); stroke-width: 1; }
  .peitoril { fill: rgba(255, 86, 60, 0.14); stroke: var(--color-accent-500); stroke-width: 1.2; }

  .eq-topo { stroke: var(--color-neutral-100); stroke-width: 0.6; }
  .eq-face { stroke: var(--color-neutral-100); stroke-width: 0.5; opacity: 0.85; }
  .eq-arranjo, .eq-cluster { fill: var(--color-accent-600); }
  .eq-delay { fill: var(--color-accent-500); }
  .eq-fill, .eq-monitor { fill: var(--color-accent-800); }
  .eq-sub { fill: rgba(140, 38, 24, 0.75); }
  .sub-topo { fill: var(--color-accent-800); stroke: var(--color-accent-600); stroke-width: 0.6; }
  .sub-face { fill: rgba(140, 38, 24, 0.55); stroke: var(--color-accent-700); stroke-width: 0.5; }

  .alcance { fill: none; stroke: var(--color-accent-500); stroke-width: 1.2; stroke-dasharray: 11 6; }
  .cotas line { stroke: var(--color-neutral-500); stroke-width: 1; }
  .preenche-cota { fill: var(--color-neutral-500); }

  .sw-envoltoria { fill: rgba(248, 244, 244, 0.06); stroke: var(--color-neutral-500); stroke-width: 1; }
  .sw-terrea { fill: var(--color-neutral-500); }
  .sw-mezanino { fill: rgba(255, 118, 92, 0.6); }
  .sw-arranjo { fill: var(--color-accent-600); }
  .sw-complemento { fill: var(--color-accent-800); }
  .sw-alcance { fill: none; stroke: var(--color-accent-500); stroke-width: 2.4;
                stroke-dasharray: 7 4; }

  text { font-family: var(--font-tecnica); fill: var(--color-neutral-400); }

  /* Wipeout: os rotulos de fileira e de fonte pousam sobre os arcos da plateia. */
  .rot-peca, .rot-fonte, .rot-fileira, .rot-critico, .rot-cota {
    paint-order: stroke;
    stroke: var(--color-text);
    stroke-width: 3px;
    stroke-linejoin: round;
  }
  .titulo-folha { font-size: 17px; font-weight: 600; letter-spacing: 0.22em;
                  fill: var(--color-neutral-200); }
  .rot-area { font-size: 14px; font-weight: 600; letter-spacing: 0.2em;
              fill: var(--color-neutral-200); }
  .rot-peca { font-size: 11px; letter-spacing: 0.1em; fill: var(--color-neutral-500); }
  .rot-legenda { font-size: 11px; letter-spacing: 0.06em; fill: var(--color-neutral-400); }
  .rot-nota { font-size: 11px; letter-spacing: 0.04em; fill: var(--color-neutral-600); }
  .rot-fonte { font-size: 11px; letter-spacing: 0.08em; fill: var(--color-accent-400); }
  .rot-fileira { font-size: 10px; letter-spacing: 0.1em; fill: var(--color-neutral-600); }
  .rot-cota { font-size: 11px; }
  .rot-critico { font-size: 12px; font-weight: 600; fill: var(--color-accent-400); }

  .carimbo-marca { font-family: var(--font-heading); font-size: 20px; font-weight: 800;
                   letter-spacing: 0.13em; fill: var(--color-neutral-100); }
  .carimbo-mini { font-size: 10px; letter-spacing: 0.05em; fill: var(--color-neutral-500); }
  .carimbo-chave { font-size: 9.5px; letter-spacing: 0.16em; fill: var(--color-neutral-600); }
  .carimbo-valor { font-size: 12.5px; fill: var(--color-neutral-300); }
  .carimbo-valor-forte { font-size: 14.5px; font-weight: 600; fill: var(--color-neutral-100); }
</style>
