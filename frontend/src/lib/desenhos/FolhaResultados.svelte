<script>
  import {
    obra, sala, foco, palco, plateia, alturaOuvido, lugares,
    t30, sti, cobertura, criterios, verificacoes
  } from './projeto.js';
  import { formatador, rotulos } from './rotulos.js';

  let { lang = 'pt' } = $props();

  const r = $derived(rotulos(lang));
  const fmt = $derived(formatador(lang));

  // ————— T30 por banda de oitava —————
  const T = { x0: 118, x1: 556, base: 500, topo: 250, max: 5 };
  const tx = (i) => T.x0 + ((T.x1 - T.x0) * i) / (t30.bandas.length - 1);
  const ty = (v) => T.base - ((T.base - T.topo) * v) / T.max;
  const serie = (vs) => 'M ' + vs.map((v, i) => `${tx(i).toFixed(1)} ${ty(v).toFixed(1)}`).join(' L ');
  const marcasT30 = [0, 1, 2, 3, 4, 5];

  // ————— STI fileira a fileira —————
  // A lacuna entre a plateia e o mezanino é um índice inteiro: as duas séries
  // não são contínuas, e emendá-las inventaria uma fileira que não existe.
  const S = { x0: 682, x1: 1114, base: 500, topo: 250, min: 0.55, max: 0.8 };
  const vaoSti = sti.perfil.length; // o índice do vão
  const totalSti = sti.perfil.length + sti.perfilMezanino.length + 1;
  const stx = (i) => S.x0 + ((S.x1 - S.x0) * i) / (totalSti - 1);
  const sty = (v) => S.base - ((S.base - S.topo) * (v - S.min)) / (S.max - S.min);
  const curvaSti = (vs, desde) =>
    'M ' + vs.map((v, i) => `${stx(desde + i).toFixed(1)} ${sty(v).toFixed(1)}`).join(' L ');
  const marcasSti = [0.55, 0.6, 0.65, 0.7, 0.75, 0.8];
  const piorSti = { i: totalSti - 1, v: sti.perfilMezanino.at(-1) };

  // ————— o que a tabela compara —————
  /// Ângulo vertical da primeira fileira ao alto do painel: é a mesma visada
  /// que o corte desenha, aqui em número.
  const anguloTela = Number(
    (
      (Math.atan(
        (palco.nivel + 1.0 + palco.ledAltura - alturaOuvido) /
          (foco.x + plateia.raioInicial - (palco.x0 + 0.5))
      ) *
        180) /
      Math.PI
    ).toFixed(1)
  );
  const canais = criterios.fixtures * criterios.canaisPorFixture;
  const universos = Math.ceil(canais / criterios.canaisPorUniverso);

  /// Critério, resultado e — o que importa — a comparação entre os dois. O
  /// "atende" de cada linha é essa comparação, não uma palavra digitada.
  /// `calc` marca as linhas cujo número saiu do modelo desta página; as demais
  /// são dado de projeto, e a folha diz isso em vez de fingir que calculou.
  const checagens = $derived([
    {
      calc: true,
      criterio: r.resultados.crit.t30(fmt.dec(sala.t30Alvo), fmt.dec(t30.tolerancia)),
      valor: r.resultados.val.t30(fmt.dec(sala.t30Calculado)),
      ok: Math.abs(sala.t30Calculado - sala.t30Alvo) <= t30.tolerancia
    },
    {
      calc: true,
      criterio: r.resultados.crit.spl(criterios.splMaximoFaixa),
      valor: r.resultados.val.spl(fmt.dec(cobertura.faixa90, 1)),
      ok: cobertura.faixa90 <= criterios.splMaximoFaixa
    },
    {
      calc: true,
      criterio: r.resultados.crit.sti(fmt.dec(sti.limite, 2)),
      valor: fmt.dec(sti.pior, 2),
      ok: sti.pior >= sti.limite
    },
    {
      calc: false,
      criterio: r.resultados.crit.pag(criterios.pagNagMinimo),
      valor: r.resultados.val.pag(fmt.dec(criterios.pagNag, 1)),
      ok: criterios.pagNag >= criterios.pagNagMinimo
    },
    {
      calc: false,
      criterio: r.resultados.crit.rw(criterios.rwExigido),
      valor: r.resultados.val.rw(criterios.rw),
      ok: criterios.rw >= criterios.rwExigido
    },
    {
      calc: false,
      criterio: r.resultados.crit.ruido(sala.ruidoFundo),
      valor: sala.ruidoFundo,
      ok: true
    },
    {
      calc: true,
      criterio: r.resultados.crit.visada(criterios.anguloTelaMaximo),
      valor: r.resultados.val.visada(fmt.dec(anguloTela, 1)),
      ok: anguloTela <= criterios.anguloTelaMaximo
    },
    {
      calc: true,
      criterio: r.resultados.crit.dmx(criterios.canaisPorUniverso),
      valor: r.resultados.val.dmx(fmt.milhar(canais), universos),
      ok: universos <= criterios.universosPrevistos
    }
  ]);

  const linhas = $derived(
    verificacoes.map((v, i) => ({
      ...v,
      // Em português o texto já está no modelo; o inglês tem a sua tabela.
      oque: r.resultados.oque?.[v.n] ?? v.o_que,
      ...checagens[i],
      y: 666 + i * 36
    }))
  );

  const sumario = $derived([
    { c: r.resultados.sumario.t30, v: `${fmt.dec(sala.t30Calculado)} s` },
    { c: r.resultados.sumario.faixa, v: `${fmt.dec(cobertura.faixa90, 1)} dB` },
    { c: r.resultados.sumario.sti, v: fmt.dec(sti.pior, 2) },
    { c: r.resultados.sumario.ruido, v: sala.ruidoFundo }
  ]);
</script>

<figure class="prancha">
  <svg viewBox="0 0 1200 1190" role="img" aria-label={r.resultados.aria}>
    <rect x="24" y="24" width="1152" height="1142" class="moldura" />

    <!-- ————— o que a sala entrega, em quatro números ————— -->
    {#each sumario as s, i}
      <g transform="translate({60 + i * 270}, 66)">
        <rect x="0" y="0" width="250" height="86" class="celula-sumario" />
        <text x="18" y="26" class="cabecalho">{s.c}</text>
        <text x="18" y="66" class="numero-forte">{s.v}</text>
      </g>
    {/each}

    <!-- ————— T30 por banda ————— -->
    <g class="painel">
      <rect x="60" y="180" width="530" height="376" />
      <text x="80" y="208" class="titulo-bloco">{r.resultados.t30.titulo}</text>

      <!-- faixa do alvo: é onde a curva tratada tem de cair -->
      <rect x={T.x0} y={ty(sala.t30Alvo + t30.tolerancia)} width={T.x1 - T.x0}
            height={ty(sala.t30Alvo - t30.tolerancia) - ty(sala.t30Alvo + t30.tolerancia)}
            class="faixa-alvo" />
      <text x={T.x1} y={ty(sala.t30Alvo + t30.tolerancia) - 6} class="rot-alvo" text-anchor="end">
        {r.resultados.t30.alvo(fmt.dec(sala.t30Alvo), fmt.dec(t30.tolerancia))}
      </text>

      {#each marcasT30 as m}
        <line x1={T.x0} y1={ty(m)} x2={T.x1} y2={ty(m)} class="grade" />
        <text x={T.x0 - 10} y={ty(m) + 4} class="rot-escala" text-anchor="end">{fmt.dec(m, 0)}</text>
      {/each}
      {#each t30.bandas as b, i}
        <text x={tx(i)} y={T.base + 22} class="rot-escala" text-anchor="middle">
          {fmt.milhar(b)}
        </text>
      {/each}
      <text transform="rotate(-90 {T.x0 - 42} {(T.base + T.topo) / 2})"
            x={T.x0 - 42} y={(T.base + T.topo) / 2} class="rot-eixo" text-anchor="middle">
        {r.resultados.t30.eixoY}
      </text>
      <text x={T.x1} y={T.base + 46} class="rot-eixo" text-anchor="end">
        {r.resultados.t30.eixoX}
      </text>

      <path d={serie(t30.antes)} class="curva-antes" />
      <path d={serie(t30.depois)} class="curva-depois" />
      {#each t30.antes as v, i}
        <circle cx={tx(i)} cy={ty(v)} r="3" class="ponto-antes" />
      {/each}
      {#each t30.depois as v, i}
        <circle cx={tx(i)} cy={ty(v)} r="3.6" class="ponto-depois" />
        <!-- Centralizado, o rotulo da ponta fica metade fora do quadro: "2,05"
             saia por cima do eixo e da escala. Nas pontas ele encosta para
             dentro. -->
        <text x={tx(i)} y={ty(v) + 22} class="rot-valor"
              text-anchor={i === 0 ? 'start' : i === t30.depois.length - 1 ? 'end' : 'middle'}
        >{fmt.dec(v)}</text>
      {/each}

      <g transform="translate(80, 232)">
        <line x1="0" y1="0" x2="26" y2="0" class="curva-antes" />
        <text x="34" y="4" class="rot-legenda">{r.resultados.t30.antes}</text>
        <line x1="150" y1="0" x2="176" y2="0" class="curva-depois" />
        <text x="184" y="4" class="rot-legenda">{r.resultados.t30.depois}</text>
      </g>
    </g>

    <!-- ————— STI fileira a fileira ————— -->
    <g class="painel">
      <rect x="610" y="180" width="530" height="376" />
      <text x="630" y="208" class="titulo-bloco">{r.resultados.sti.titulo}</text>

      <rect x={S.x0} y={S.topo} width={S.x1 - S.x0} height={sty(sti.limite) - S.topo}
            class="faixa-boa" />
      <line x1={S.x0} y1={sty(sti.limite)} x2={S.x1} y2={sty(sti.limite)} class="limite" />
      <text x={S.x1} y={sty(sti.limite) + 18} class="rot-alvo" text-anchor="end">
        {r.resultados.sti.limite(fmt.dec(sti.limite, 2))}
      </text>

      {#each marcasSti as m}
        <line x1={S.x0} y1={sty(m)} x2={S.x1} y2={sty(m)} class="grade" />
        <text x={S.x0 - 10} y={sty(m) + 4} class="rot-escala" text-anchor="end">
          {fmt.dec(m, 2)}
        </text>
      {/each}
      <line x1={stx(vaoSti)} y1={S.topo} x2={stx(vaoSti)} y2={S.base} class="divisor" />
      <text transform="rotate(-90 {S.x0 - 46} {(S.base + S.topo) / 2})"
            x={S.x0 - 46} y={(S.base + S.topo) / 2} class="rot-eixo" text-anchor="middle">
        {r.resultados.sti.eixoY}
      </text>
      <text x={S.x1} y={S.base + 46} class="rot-eixo" text-anchor="end">
        {r.resultados.sti.eixoX}
      </text>

      <text x={stx(0)} y={S.base + 22} class="rot-escala">F01</text>
      <text x={stx(vaoSti - 1)} y={S.base + 22} class="rot-escala" text-anchor="end">F32</text>
      <text x={stx(vaoSti + 1)} y={S.base + 22} class="rot-escala">M01</text>
      <text x={stx(totalSti - 1)} y={S.base + 22} class="rot-escala" text-anchor="end">M12</text>

      <path d={curvaSti(sti.perfil, 0)} class="curva-terrea" />
      <path d={curvaSti(sti.perfilMezanino, vaoSti + 1)} class="curva-mez" />
      <circle cx={stx(piorSti.i)} cy={sty(piorSti.v)} r="4.2" class="ponto-pior" />
      <text x={stx(piorSti.i)} y={sty(piorSti.v) + 26} class="rot-critico" text-anchor="end">
        {r.resultados.sti.pior(fmt.dec(sti.pior, 2))}
      </text>

      <g transform="translate(630, 232)">
        <line x1="0" y1="0" x2="26" y2="0" class="curva-terrea" />
        <text x="34" y="4" class="rot-legenda">{r.resultados.sti.terrea}</text>
        <line x1="150" y1="0" x2="176" y2="0" class="curva-mez" />
        <text x="184" y="4" class="rot-legenda">{r.resultados.sti.mezanino}</text>
      </g>
    </g>

    <!-- ————— as oito verificações ————— -->
    <g class="tabela">
      <text x="60" y="596" class="titulo-bloco">{r.resultados.tabela.titulo}</text>
      <line x1="60" y1="612" x2="1140" y2="612" class="linha-tabela" />
      <text x="76" y="632" class="cabecalho">{r.resultados.tabela.n}</text>
      <text x="168" y="632" class="cabecalho">{r.resultados.tabela.norma}</text>
      <text x="372" y="632" class="cabecalho">{r.resultados.tabela.oque}</text>
      <text x="700" y="632" class="cabecalho">{r.resultados.tabela.criterio}</text>
      <text x="940" y="632" class="cabecalho">{r.resultados.tabela.resultado}</text>

      {#each linhas as l}
        <line x1="60" y1={l.y - 24} x2="1140" y2={l.y - 24} class="linha-tabela-fina" />
        <text x="76" y={l.y} class="celula-fraca">{l.n}</text>
        <text x="108" y={l.y} class="marca-fonte">
          {l.calc ? r.resultados.tabela.calc : r.resultados.tabela.proj}
        </text>
        <text x="168" y={l.y} class="celula-forte">{l.norma}</text>
        <text x="372" y={l.y} class="celula">{l.oque}</text>
        <text x="700" y={l.y} class="celula-fraca">{l.criterio}</text>
        <text x="940" y={l.y} class="celula-forte">{l.valor}</text>
        <text x="1140" y={l.y} class={l.ok ? 'atende' : 'nao-atende'} text-anchor="end">
          {l.ok ? r.resultados.tabela.atende : r.resultados.tabela.naoAtende}
        </text>
      {/each}
      <line x1="60" y1="930" x2="1140" y2="930" class="linha-tabela" />
      <text x="60" y="950" class="rodape">{r.resultados.tabela.nota}</text>
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
        {fmt.milhar(sala.volume)} m³ · {fmt.milhar(sala.superficies)} m² · {sala.ruidoFundo}
      </text>
      <text x="48" y="1146" class="carimbo-mini">
        {r.corte.sabine(fmt.milhar(sala.absorcaoTotal))} · α {fmt.dec(sala.alfaMedio, 3)}
      </text>

      <text x="376" y="998" class="carimbo-chave">{r.carimbo.obra}</text>
      <text x="376" y="1016" class="carimbo-valor-forte">{r.obra.nome}</text>
      <text x="376" y="1048" class="carimbo-chave">{r.carimbo.conteudo}</text>
      <text x="376" y="1068" class="carimbo-valor">{r.resultados.conteudo}</text>
      <text x="376" y="1098" class="carimbo-chave">{r.carimbo.lugares}</text>
      <text x="376" y="1118" class="carimbo-valor">
        {r.comum.lugares(
          fmt.milhar(lugares.plateia),
          fmt.milhar(lugares.mezanino),
          fmt.milhar(lugares.total)
        )}
      </text>
      <text x="376" y="1146" class="carimbo-mini">
        {r.resultados.sumario.t30} {fmt.dec(sala.t30Calculado)} s · STI {fmt.dec(sti.pior, 2)}
      </text>

      <text x="750" y="998" class="carimbo-chave">{r.resultados.carimboChave}</text>
      <text x="750" y="1016" class="carimbo-valor">
        {fmt.dec(linhas.filter((l) => l.ok).length, 0)} / {fmt.dec(linhas.length, 0)} · {r
          .resultados.tabela.atende}
      </text>

      <text x="750" y="1048" class="carimbo-chave">{r.carimbo.escala}</text>
      <text x="750" y="1070" class="carimbo-valor">—</text>
      <text x="750" y="1104" class="carimbo-chave">{r.carimbo.data}</text>
      <text x="750" y="1124" class="carimbo-valor">{obra.data}</text>
      <text x="908" y="1048" class="carimbo-chave">{r.carimbo.prancha}</text>
      <text x="908" y="1070" class="carimbo-valor-forte">AC-04</text>
      <text x="908" y="1104" class="carimbo-chave">{r.carimbo.folha}</text>
      <text x="908" y="1124" class="carimbo-valor">4 / 4</text>
      <text x="1054" y="1048" class="carimbo-chave">{r.carimbo.rev}</text>
      <text x="1054" y="1070" class="carimbo-valor-forte">{obra.revisao}</text>
      <text x="1054" y="1104" class="carimbo-chave">{r.carimbo.unid}</text>
      <text x="1054" y="1124" class="carimbo-valor">{r.carimbo.metros}</text>
    </g>
  </svg>

  <figcaption>
    {r.resultados.figcaption(
      fmt.dec(sala.t30Calculado),
      fmt.dec(cobertura.faixa90, 1),
      fmt.dec(sti.pior, 2)
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

  .moldura, .carimbo > rect, .carimbo > line, .painel > rect {
    fill: none;
    stroke: var(--color-neutral-700);
    stroke-width: 1;
  }
  .celula-sumario {
    fill: rgba(248, 244, 244, 0.03);
    stroke: var(--color-neutral-700);
    stroke-width: 1;
  }

  .grade { stroke: var(--color-neutral-800); stroke-width: 1; }
  .divisor { stroke: var(--color-neutral-700); stroke-width: 1; stroke-dasharray: 4 4; }
  .faixa-alvo { fill: rgba(255, 86, 60, 0.14); }
  .faixa-boa { fill: rgba(248, 244, 244, 0.03); }
  .limite { stroke: var(--color-accent-500); stroke-width: 1.4; stroke-dasharray: 10 5; }

  .curva-antes {
    fill: none;
    stroke: var(--color-neutral-500);
    stroke-width: 1.6;
    stroke-dasharray: 8 5;
  }
  .curva-depois { fill: none; stroke: var(--color-accent-500); stroke-width: 2.6; }
  .ponto-antes { fill: var(--color-neutral-500); }
  .ponto-depois { fill: var(--color-accent-400); }
  .curva-terrea { fill: none; stroke: var(--color-neutral-200); stroke-width: 2.2; }
  .curva-mez { fill: none; stroke: var(--color-accent-500); stroke-width: 2.2; }
  .ponto-pior { fill: var(--color-accent-400); stroke: var(--color-text); stroke-width: 1; }

  .linha-tabela { stroke: var(--color-neutral-500); stroke-width: 1.2; }
  .linha-tabela-fina { stroke: var(--color-neutral-800); stroke-width: 1; }

  text { font-family: var(--font-tecnica); fill: var(--color-neutral-400); }
  .titulo-bloco { font-size: 10.5px; letter-spacing: 0.18em; fill: var(--color-neutral-500); }
  .cabecalho { font-size: 9.5px; letter-spacing: 0.16em; fill: var(--color-neutral-600); }
  .numero-forte { font-size: 30px; font-weight: 700; fill: var(--color-neutral-100); }
  .celula { font-size: 12px; fill: var(--color-neutral-300); }
  .celula-forte { font-size: 12px; font-weight: 600; fill: var(--color-neutral-100); }
  .celula-fraca { font-size: 11px; fill: var(--color-neutral-500); }
  .marca-fonte { font-size: 9.5px; letter-spacing: 0.1em; fill: var(--color-neutral-700); }
  .atende { font-size: 11px; letter-spacing: 0.1em; fill: var(--color-accent-400); }
  .nao-atende { font-size: 11px; letter-spacing: 0.1em; font-weight: 700; fill: #ffd166; }
  .rodape { font-size: 10px; fill: var(--color-neutral-600); }

  /* Wipeout: os rotulos dos graficos cruzam a grade e as curvas. */
  .rot-valor, .rot-alvo, .rot-critico, .rot-escala {
    paint-order: stroke;
    stroke: var(--color-text);
    stroke-width: 3px;
    stroke-linejoin: round;
  }
  .rot-escala { font-size: 10.5px; fill: var(--color-neutral-600); }
  .rot-eixo { font-size: 9.5px; letter-spacing: 0.14em; fill: var(--color-neutral-700); }
  .rot-legenda { font-size: 11px; fill: var(--color-neutral-400); }
  .rot-valor { font-size: 10px; fill: var(--color-accent-400); }
  .rot-alvo { font-size: 10px; letter-spacing: 0.06em; fill: var(--color-accent-400); }
  .rot-critico { font-size: 11px; font-weight: 600; fill: var(--color-accent-400); }

  .carimbo-marca { font-family: var(--font-heading); font-size: 20px; font-weight: 800;
                   letter-spacing: 0.13em; fill: var(--color-neutral-100); }
  .carimbo-mini { font-size: 10px; letter-spacing: 0.05em; fill: var(--color-neutral-500); }
  .carimbo-chave { font-size: 9.5px; letter-spacing: 0.16em; fill: var(--color-neutral-600); }
  .carimbo-valor { font-size: 12.5px; fill: var(--color-neutral-300); }
  .carimbo-valor-forte { font-size: 14.5px; font-weight: 600; fill: var(--color-neutral-100); }
</style>
