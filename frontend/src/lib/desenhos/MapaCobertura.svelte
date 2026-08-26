<script>
  // Mapa de cobertura sonora como ele sai da ferramenta da casa: janela do
  // Resonance, malha sobre a plateia e estatística ao lado. Nenhum valor aqui
  // é ilustrativo — cada célula chama `splEm` com a mesma física que a página
  // usa para afirmar os números do estudo de caso.
  import {
    obra, sala, foco, palco, plateia, fontes, caixas, foh,
    fileirasPlateia, fileirasMezanino, lugares, cobertura, polar,
    nivelOuvidoEm, splEm, assentos, sti, corDeNivel, faixaNivel
  } from './projeto.js';
  import { formatador, rotulos } from './rotulos.js';

  let { lang = 'pt' } = $props();

  // A simulação é a mesma; a janela do Resonance é que fala o idioma da página.
  const r = $derived(rotulos(lang));
  const fmt = $derived(formatador(lang));

  const E = 6.5; // unidades do viewBox por metro
  const VX = 322;
  const VY = 96;
  const sx = (y) => VX + y * E;
  const sy = (x) => VY + x * E;
  const L = (m) => m * E;

  const pt = (raio, ang) => {
    const p = polar(raio, ang);
    return `${sx(p.y).toFixed(1)} ${sy(p.x).toFixed(1)}`;
  };

  /// Uma célula da malha: setor anelar entre dois raios e dois ângulos.
  const celula = (r0, r1, a0, a1) =>
    `M ${pt(r0, a0)} A ${L(r0).toFixed(1)} ${L(r0).toFixed(1)} 0 0 0 ${pt(r0, a1)} ` +
    `L ${pt(r1, a1)} A ${L(r1).toFixed(1)} ${L(r1).toFixed(1)} 0 0 1 ${pt(r1, a0)} Z`;

  // A escala de cor vem do modelo: é a mesma do modelo interativo.
  const FAIXA = faixaNivel;
  const cor = corDeNivel;

  /// Malha de análise: passo radial de duas fileiras e passo angular de 4°.
  /// O nível é medido no centro da célula, na altura do ouvido daquela fileira.
  function malha(fileiras) {
    const saida = [];
    for (let i = 0; i < fileiras.length - 1; i += 2) {
      const a = fileiras[i];
      const b = fileiras[Math.min(i + 1, fileiras.length - 1)];
      const r0 = a.raio - 0.5;
      const r1 = b.raio + 0.5;
      const abertura = Math.min(a.abertura, b.abertura);
      const passos = Math.max(6, Math.round((2 * abertura * 180) / Math.PI / 4));
      const passo = (2 * abertura) / passos;
      for (let k = 0; k < passos; k++) {
        const a0 = -abertura + k * passo;
        const a1 = a0 + passo;
        const meio = polar((r0 + r1) / 2, (a0 + a1) / 2);
        const nivel = splEm({ x: meio.x, y: meio.y, z: (a.nivel + b.nivel) / 2 + 1.2 });
        saida.push({ d: celula(r0, r1, a0, a1), c: cor(Math.round(nivel)) });
      }
    }
    return saida;
  }

  const celulas = [...malha(fileirasPlateia), ...malha(fileirasMezanino)];

  /// Régua de cor do painel direito, de 1 em 1 dB.
  const regua = (() => {
    const linhas = [];
    for (let n = FAIXA.ate; n >= FAIXA.de; n--) linhas.push({ n, c: cor(n) });
    return linhas;
  })();
  const alturaRegua = 300;
  const passoRegua = alturaRegua / regua.length;

  /// Ponto de sonda mostrado no visor — a poltrona do meio da sala, com o
  /// valor que a simulação devolve nela.
  const sonda = (() => {
    const alvo = fileirasPlateia[19];
    const p = polar(alvo.raio, 0.18);
    const z = alvo.nivel + 1.2;
    return { ...p, z, nivel: splEm({ x: p.x, y: p.y, z }), fileira: alvo.indice };
  })();

  const grupos = (() => {
    const m = new Map();
    for (const c of caixas) m.set(c.grupo, (m.get(c.grupo) ?? 0) + 1);
    return [...m].map(([g, n]) => ({ g, n }));
  })();

  /// O nome do arquivo aberto na janela sai do nome da obra, no idioma da folha.
  const arquivo = $derived(r.obra.nome.toLowerCase().replace(/[^a-zç]+/g, '-') + '.rsn');

  const arvore = $derived([
    { nivel: 0, t: arquivo, tipo: 'raiz' },
    { nivel: 1, t: r.mapa.arvore.envoltoria(fmt.milhar(sala.volume)), tipo: '' },
    { nivel: 2, t: r.mapa.arvore.superficies(fmt.milhar(sala.superficies)), tipo: '' },
    { nivel: 2, t: r.mapa.arvore.materiais(fmt.dec(sala.alfaMedio, 3)), tipo: '' },
    { nivel: 1, t: r.mapa.arvore.plateia(fmt.milhar(lugares.plateia)), tipo: '' },
    { nivel: 1, t: r.mapa.arvore.mezanino(fmt.milhar(lugares.mezanino)), tipo: '' },
    { nivel: 1, t: r.mapa.arvore.fontes(caixas.length), tipo: 'ativo' },
    ...grupos.map((g) => ({ nivel: 2, t: `${g.g} · ${g.n}`, tipo: 'fonte' }))
  ]);

  const parametros = $derived(r.mapa.parametros(celulas.length, fmt.milhar(assentos.length)));

  const estatisticas = $derived(
    r.mapa.estatisticas({
      max: fmt.dec(cobertura.max, 1),
      mediana: fmt.dec(cobertura.mediana, 1),
      min: fmt.dec(cobertura.min, 1),
      variacao: fmt.dec(cobertura.variacao, 1),
      faixa90: fmt.dec(cobertura.faixa90, 1),
      dentroDe3: fmt.dec(cobertura.dentroDe3, 1)
    })
  );

  const leitura = $derived(
    r.mapa.leitura(
      fmt.dec(cobertura.variacao, 1),
      fmt.dec(cobertura.faixa90, 1),
      fmt.dec(cobertura.headroom, 0)
    )
  );

  const ferramentas = ['◧', '◈', '◉', '⊞', '⌁', '◐'];

  /// Marcadores das fontes no visor, com rótulo só nos grupos principais.
  const marcadores = caixas.map((c) => ({
    x: sx(c.y),
    y: sy(c.x),
    grupo: c.grupo,
    principal: ['L', 'R', 'C'].includes(c.grupo)
  }));

  /// Rótulos das fontes, todos fora do leque de poltronas para não competir
  /// com a leitura do mapa.
  const rotulosFonte = $derived([
    { t: r.mapa.fonte('L', 16), y: foco.y - 15.5, x: 15.6, ancora: 'end' },
    { t: r.mapa.fonte('R', 16), y: foco.y + 15.5, x: 15.6, ancora: 'start' },
    { t: r.mapa.fonte('C', 8), y: foco.y, x: 15.6, ancora: 'middle' },
    { t: r.mapa.fonte('FF', grupos.find((g) => g.g === 'FF')?.n ?? 0), y: foco.y, x: 21.0, ancora: 'middle' },
    { t: r.mapa.fonte('OF', 2), y: foco.y - 20.5, x: 21.4, ancora: 'end' },
    { t: r.mapa.fonte('D1', 5), y: 80, x: 22, ancora: 'start' },
    { t: r.mapa.fonte('D2', 5), y: foco.y + 34, x: foco.x + fontes.delays[1].raio + 2.4, ancora: 'start' }
  ]);
</script>

<figure class="prancha">
  <svg viewBox="0 0 1200 812" role="img"
       aria-label={r.mapa.aria(fmt.milhar(lugares.total))}>
    <title>{r.mapa.titulo}</title>

    <!-- ————— janela ————— -->
    <rect x="0" y="0" width="1200" height="812" class="janela" />
    <rect x="0" y="0" width="1200" height="46" class="barra-topo" />
    <text x="24" y="29" class="marca-app">RESONANCE</text>
    <text x="146" y="29" class="versao">{r.mapa.versao}</text>
    {#each r.mapa.menus as m, i}
      <text x={294 + i * 92} y="29" class="menu" class:menu-ativo={m === r.mapa.menuAtivo}>{m}</text>
    {/each}
    <text x="1176" y="29" class="arquivo" text-anchor="end">{arquivo}</text>
    <line x1="0" y1="46" x2="1200" y2="46" class="divisor" />

    <!-- ————— trilho de ferramentas ————— -->
    <rect x="0" y="46" width="54" height="738" class="painel" />
    {#each ferramentas as f, i}
      <rect x="11" y={62 + i * 42} width="32" height="32" class="ferramenta" class:ferramenta-ativa={i === 2} />
      <text x="27" y={83 + i * 42} class="icone" text-anchor="middle">{f}</text>
    {/each}

    <!-- ————— painel do modelo ————— -->
    <rect x="54" y="46" width="248" height="738" class="painel" />
    <text x="72" y="76" class="titulo-painel">{r.mapa.modelo}</text>
    {#each arvore as n, i}
      <text x={72 + n.nivel * 14} y={104 + i * 21} class="no" class:no-raiz={n.tipo === 'raiz'}
            class:no-ativo={n.tipo === 'ativo'} class:no-fonte={n.tipo === 'fonte'}>{n.t}</text>
    {/each}

    <line x1="72" y1="374" x2="284" y2="374" class="divisor-fino" />
    <text x="72" y="400" class="titulo-painel">{r.mapa.parametrosTitulo}</text>
    {#each parametros as p, i}
      <text x="72" y={428 + i * 30} class="chave">{p[0]}</text>
      <text x="284" y={428 + i * 30} class="valor" text-anchor="end">{p[1]}</text>
      <line x1="72" y1={436 + i * 30} x2="284" y2={436 + i * 30} class="divisor-fino" />
    {/each}

    <text x="72" y="640" class="titulo-painel">{r.mapa.verificacaoTitulo}</text>
    <rect x="72" y="652" width="212" height="60" class="caixa-verde" />
    <text x="86" y="676" class="verde-forte">{r.mapa.sti}</text>
    <text x="86" y="697" class="verde-fraco">{r.mapa.stiNota(fmt.dec(sti.ultima, 2))}</text>
    <rect x="72" y="722" width="212" height="46" class="caixa-neutra" />
    <text x="86" y="742" class="chave">{r.mapa.t30}</text>
    <text x="270" y="742" class="valor" text-anchor="end">{fmt.dec(sala.t30Calculado, 2)} s</text>
    <text x="86" y="760" class="rodape-caixa">{r.mapa.t30Nota(fmt.dec(sala.t30Alvo, 2))}</text>

    <!-- ————— visor ————— -->
    <rect x="302" y="46" width="640" height="738" class="visor" />
    <text x="322" y="74" class="titulo-visor">{r.mapa.cobertura}</text>
    <text x="922" y="74" class="titulo-visor-fraco" text-anchor="end">{r.mapa.plantaNivel}</text>

    <!-- sala -->
    <rect x={sx(0)} y={sy(0)} width={L(sala.largura)} height={L(sala.profundidade)}
          class="contorno-sala" />
    <rect x={sx(foco.y - palco.largura / 2)} y={sy(palco.x0)} width={L(palco.largura)}
          height={L(palco.x1 - palco.x0)} class="palco" />
    <text x={sx(foco.y)} y={sy((palco.x0 + palco.x1) / 2) + 4} class="rot-palco"
          text-anchor="middle">{r.comum.palco}</text>

    <!-- malha de análise -->
    <g class="malha">
      {#each celulas as c}
        <path d={c.d} fill={c.c} />
      {/each}
    </g>

    <!-- fontes -->
    {#each marcadores as m}
      <rect x={m.x - (m.principal ? 3 : 2)} y={m.y - (m.principal ? 5 : 2)}
            width={m.principal ? 6 : 4} height={m.principal ? 10 : 4} class="fonte"
            class:fonte-principal={m.principal} />
    {/each}
    {#each rotulosFonte as f}
      <text x={sx(f.y)} y={sy(f.x)} class="rot-fonte" text-anchor={f.ancora}>{f.t}</text>
    {/each}

    <!-- cabine de operação -->
    <rect x={sx(foco.y - foh.largura / 2)} y={sy(foco.x + foh.raio - foh.profundidade / 2)}
          width={L(foh.largura)} height={L(foh.profundidade)} class="foh" />
    <text x={sx(foco.y)} y={sy(foco.x + foh.raio) + 3} class="rot-foh" text-anchor="middle">{r.comum.foh}</text>

    <!-- sonda -->
    <g class="sonda">
      <line x1={sx(sonda.y) - 13} y1={sy(sonda.x)} x2={sx(sonda.y) + 13} y2={sy(sonda.x)} />
      <line x1={sx(sonda.y)} y1={sy(sonda.x) - 13} x2={sx(sonda.y)} y2={sy(sonda.x) + 13} />
      <circle cx={sx(sonda.y)} cy={sy(sonda.x)} r="4.5" />
    </g>
    <rect x={sx(sonda.y) + 16} y={sy(sonda.x) - 30} width="176" height="46" class="balao" />
    <text x={sx(sonda.y) + 28} y={sy(sonda.x) - 12} class="balao-forte">
      {r.mapa.sonda(fmt.dec(sonda.nivel, 1), sonda.fileira)}
    </text>
    <text x={sx(sonda.y) + 28} y={sy(sonda.x) + 6} class="balao-fraco">
      x {fmt.dec(sonda.x, 1)} · y {fmt.dec(sonda.y, 1)} · z {fmt.dec(sonda.z, 2)}
    </text>

    <!-- escala gráfica do visor -->
    <line x1={sx(4)} y1={sy(sala.profundidade) + 26} x2={sx(24)} y2={sy(sala.profundidade) + 26}
          class="escala" />
    <line x1={sx(4)} y1={sy(sala.profundidade) + 21} x2={sx(4)} y2={sy(sala.profundidade) + 31}
          class="escala" />
    <line x1={sx(24)} y1={sy(sala.profundidade) + 21} x2={sx(24)} y2={sy(sala.profundidade) + 31}
          class="escala" />
    <text x={sx(26)} y={sy(sala.profundidade) + 30} class="rot-escala">{r.mapa.metros(20)}</text>

    <!-- ————— painel de resultado ————— -->
    <rect x="942" y="46" width="258" height="738" class="painel" />
    <text x="962" y="76" class="titulo-painel">{r.mapa.nivel}</text>

    {#each regua as faixa, i}
      <rect x="962" y={92 + i * passoRegua} width="34" height={passoRegua + 0.6} fill={faixa.c} />
    {/each}
    <rect x="962" y="92" width="34" height={alturaRegua} class="borda-regua" />
    {#each regua as faixa, i}
      {#if faixa.n % 2 === 0}
        <text x="1004" y={96 + i * passoRegua + passoRegua / 2} class="tick">{faixa.n}</text>
      {/if}
    {/each}

    <line x1="962" y1="424" x2="1180" y2="424" class="divisor-fino" />
    <text x="962" y="450" class="titulo-painel">{r.mapa.estatistica}</text>
    {#each estatisticas as e, i}
      <text x="962" y={478 + i * 30} class="chave">{e[0]}</text>
      <text x="1180" y={478 + i * 30} class="valor" text-anchor="end">{e[1]}</text>
      <line x1="962" y1={486 + i * 30} x2="1180" y2={486 + i * 30} class="divisor-fino" />
    {/each}

    <rect x="962" y="672" width="218" height="96" class="caixa-neutra" />
    <text x="978" y="698" class="chave">{r.mapa.leituraTitulo}</text>
    {#each leitura as linha, i}
      <text x="978" y={722 + i * 18} class="leitura">{linha}</text>
    {/each}

    <!-- ————— barra de estado ————— -->
    <line x1="0" y1="784" x2="1200" y2="784" class="divisor" />
    <text x="24" y="803" class="estado">
      {r.mapa.contagem(fmt.milhar(assentos.length), caixas.length, celulas.length)}
    </text>
    <text x="600" y="803" class="estado" text-anchor="middle">
      {r.mapa.envoltoriaLinha(
        fmt.milhar(sala.volume),
        fmt.milhar(sala.superficies),
        fmt.dec(sala.alfaMedio, 3)
      )}
    </text>
    <text x="1176" y="803" class="estado" text-anchor="end">{r.unidades}</text>
  </svg>

  <figcaption>
    {r.mapa.figcaption(
      fmt.milhar(lugares.total),
      caixas.length,
      fmt.dec(cobertura.faixa90, 1)
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

  .janela { fill: #101315; }
  .barra-topo { fill: #16191c; }
  .painel { fill: #131719; }
  .visor { fill: #0b0d0f; }
  .divisor { stroke: #262b2f; stroke-width: 1; }
  .divisor-fino { stroke: #1d2225; stroke-width: 1; }

  text { font-family: var(--font-tecnica); fill: #7f8a91; }
  .marca-app {
    font-family: var(--font-heading);
    font-size: 17px;
    font-weight: 800;
    letter-spacing: 0.16em;
    fill: #eef2f3;
  }
  .versao { font-size: 10.5px; letter-spacing: 0.1em; fill: #5d676d; }
  .menu { font-size: 12px; letter-spacing: 0.06em; fill: #8d979d; }
  .menu-ativo { fill: var(--color-accent-500); font-weight: 600; }
  .arquivo { font-size: 11px; fill: #5d676d; }

  .ferramenta { fill: #1a1f22; stroke: #23292d; stroke-width: 1; }
  .ferramenta-ativa { fill: rgba(255, 86, 60, 0.16); stroke: var(--color-accent-600); }
  .icone { font-size: 14px; fill: #98a3a9; }

  .titulo-painel { font-size: 9.5px; letter-spacing: 0.18em; fill: #59636a; }
  .titulo-visor { font-size: 11px; letter-spacing: 0.16em; fill: #b9c3c8; }
  .titulo-visor-fraco { font-size: 10.5px; letter-spacing: 0.1em; fill: #59636a; }

  .no { font-size: 11.5px; fill: #8d979d; }
  .no-raiz { fill: #eef2f3; font-weight: 600; }
  .no-ativo { fill: var(--color-accent-400); }
  .no-fonte { fill: #6f7a80; font-size: 11px; }

  .chave { font-size: 10.5px; letter-spacing: 0.08em; fill: #6b757b; }
  .valor { font-size: 11.5px; fill: #d3dade; }
  .rodape-caixa { font-size: 9.5px; fill: #59636a; }
  .leitura { font-size: 11px; fill: #a9b3b8; }

  .caixa-verde { fill: rgba(58, 168, 118, 0.1); stroke: rgba(58, 168, 118, 0.5); stroke-width: 1; }
  .verde-forte { font-size: 11.5px; font-weight: 600; fill: #6fd3a3; }
  .verde-fraco { font-size: 10.5px; fill: #7f9c8f; }
  .caixa-neutra { fill: #171b1e; stroke: #23292d; stroke-width: 1; }

  .contorno-sala { fill: #0e1113; stroke: #2f363b; stroke-width: 1.2; }
  .palco { fill: #14181b; stroke: #394248; stroke-width: 1; }
  .rot-palco { font-size: 10px; letter-spacing: 0.2em; fill: #6b757b; }
  .malha path { stroke: none; }

  .fonte { fill: #cfd6da; }
  .fonte-principal { fill: var(--color-accent-500); }
  .rot-fonte { font-size: 9.5px; letter-spacing: 0.06em; fill: #c6ced3; }
  .foh { fill: none; stroke: #4a545a; stroke-width: 1; stroke-dasharray: 4 3; }
  .rot-foh { font-size: 8.5px; letter-spacing: 0.14em; fill: #77828a; }

  .sonda line { stroke: #ffffff; stroke-width: 1; }
  .sonda circle { fill: none; stroke: #ffffff; stroke-width: 1.4; }
  .balao { fill: rgba(16, 19, 21, 0.94); stroke: #3a4348; stroke-width: 1; }
  .balao-forte { font-size: 11.5px; font-weight: 600; fill: #eef2f3; }
  .balao-fraco { font-size: 10px; fill: #7f8a91; }

  .escala { stroke: #4a545a; stroke-width: 1; }
  .rot-escala { font-size: 9.5px; fill: #6b757b; }
  .borda-regua { fill: none; stroke: #2f363b; stroke-width: 1; }
  .tick { font-size: 9.5px; fill: #6b757b; }
  .estado { font-size: 10px; letter-spacing: 0.06em; fill: #59636a; }
</style>
