<script>
  import {
    sala, foco, palco, mezanino, fontes, gabinetes, fileirasMezanino,
    assentos, niveisPorAssento, lugares, polar, teto, corDeNivel, faixaNivel
  } from './projeto.js';
  import { formatador, rotulos } from './rotulos.js';

  let { lang = 'pt' } = $props();

  const r = $derived(rotulos(lang));
  const fmt = $derived(formatador(lang));

  // ——————————————————————————————————————————————————————————————
  // O modelo. Montado uma vez, na mesma geometria das pranchas: nada aqui é
  // uma segunda versão da sala, é a mesma sala vista de outro lugar.
  // ——————————————————————————————————————————————————————————————

  const P = sala.profundidade;
  const W = sala.largura;
  const primeiroMez = fileirasMezanino[0];
  const ultimoMez = fileirasMezanino.at(-1);

  const seg = (a, b) => [a, b];

  /// Arestas da envoltória, do palco e do peitoril do mezanino.
  const arestas = (() => {
    const s = [];
    const cantos = [[0, 0], [P, 0], [P, W], [0, W]];
    for (let i = 0; i < 4; i++) {
      const [x0, y0] = cantos[i];
      const [x1, y1] = cantos[(i + 1) % 4];
      s.push(seg([x0, y0, 0], [x1, y1, 0]));
      s.push(seg([x0, y0, 0], [x0, y0, teto(x0)]));
    }
    // O forro é um plano quebrado na boca de cena: a linha do topo acompanha.
    const bordaForro = (y) => [
      seg([0, y, teto(0)], [palco.x1, y, teto(palco.x1)]),
      seg([palco.x1, y, teto(palco.x1)], [P, y, teto(P)])
    ];
    s.push(...bordaForro(0), ...bordaForro(W));
    s.push(...[W / 4, W / 2, (3 * W) / 4].flatMap(bordaForro));
    for (const x of [0, palco.x1, P]) s.push(seg([x, 0, teto(x)], [x, W, teto(x)]));

    // Palco: caixa fechada, mais a linha da boca de cena.
    const [py0, py1] = [foco.y - palco.largura / 2, foco.y + palco.largura / 2];
    for (const z of [0, palco.nivel]) {
      s.push(seg([palco.x0, py0, z], [palco.x1, py0, z]));
      s.push(seg([palco.x1, py0, z], [palco.x1, py1, z]));
      s.push(seg([palco.x1, py1, z], [palco.x0, py1, z]));
      s.push(seg([palco.x0, py1, z], [palco.x0, py0, z]));
    }
    for (const [x, y] of [[palco.x0, py0], [palco.x1, py0], [palco.x1, py1], [palco.x0, py1]]) {
      s.push(seg([x, y, 0], [x, y, palco.nivel]));
    }
    return s;
  })();

  /// Arco amostrado de uma fileira, para as superfícies do mezanino.
  function arco(raio, abertura, z, n = 48) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = -abertura + (2 * abertura * i) / n;
      const q = polar(raio, a);
      pts.push([q.x, q.y, z]);
    }
    return pts;
  }

  const raioPeitoril = mezanino.raioInicial - 0.7;
  /// Laje do mezanino e o peitoril, as duas superfícies que escondem parte da
  /// plateia térrea — e é isso mesmo que elas fazem na sala.
  const lajeMez = [
    ...arco(raioPeitoril, primeiroMez.abertura, mezanino.nivelFrente),
    ...arco(ultimoMez.raio + 1.2, ultimoMez.abertura, ultimoMez.nivel).reverse()
  ];
  const peitorilMez = [
    ...arco(raioPeitoril, primeiroMez.abertura, mezanino.nivelFrente),
    ...arco(raioPeitoril, primeiroMez.abertura, mezanino.nivelFrente - 2.2).reverse()
  ];
  const painelLed = [
    [palco.x0, foco.y - palco.ledLargura / 2, palco.nivel],
    [palco.x0, foco.y + palco.ledLargura / 2, palco.nivel],
    [palco.x0, foco.y + palco.ledLargura / 2, palco.nivel + palco.ledAltura],
    [palco.x0, foco.y - palco.ledLargura / 2, palco.nivel + palco.ledAltura]
  ];

  /// As poltronas, agrupadas pelo nível arredondado: assim o navegador troca a
  /// cor umas dez vezes por quadro, e não cinco mil.
  const poltronas = new Float32Array(assentos.length * 3);
  assentos.forEach((a, i) => {
    poltronas[i * 3] = a.x;
    poltronas[i * 3 + 1] = a.y;
    poltronas[i * 3 + 2] = a.z - 0.6; // do ouvido para o encosto
  });
  const grupos = (() => {
    const m = new Map();
    assentos.forEach((a, i) => {
      const n = Math.round(niveisPorAssento[i]);
      const chave = a.mez ? `m${n}` : `p${n}`;
      if (!m.has(chave)) m.set(chave, { n, mez: a.mez, i: [] });
      m.get(chave).i.push(i);
    });
    return [...m.values()];
  })();

  /// Cada gabinete do sistema como um paralelepípedo, no lugar e no tamanho em
  /// que está pendurado. As dezesseis caixas de um arranjo aparecem uma a uma:
  /// é essa coluna que faz a sala funcionar, e ela não é um ponto. A lista é a
  /// mesma que a planta, o corte e a axonometria desenham.
  const equipamento = gabinetes.map((g) => ({
    x: g.x,
    y: g.y,
    z: g.z,
    dx: g.prof,
    dy: g.larg,
    dz: g.alt,
    grupo: g.tipo
  }));

  // As seis faces de um cubo, pelos índices dos cantos (bit 1 = x, 2 = y, 4 = z).
  const FACES = [
    [0, 1, 3, 2], [4, 6, 7, 5],
    [0, 4, 5, 1], [2, 3, 7, 6],
    [0, 2, 6, 4], [1, 5, 7, 3]
  ];
  const BRILHO = [0.55, 1, 0.78, 0.78, 0.66, 0.66];

  // ——————————————————————————————————————————————————————————————
  // Câmera e interação
  // ——————————————————————————————————————————————————————————————

  const ALVO = { x: 36, y: W / 2, z: 5 };
  const VISTAS = {
    iso: { giro: -1.05, altura: 0.42, dist: 102 },
    frente: { giro: -Math.PI / 2, altura: 0.2, dist: 112 },
    lado: { giro: 0, altura: 0.16, dist: 118 },
    topo: { giro: -Math.PI / 2, altura: 1.4, dist: 112 }
  };

  let vista = $state('iso');
  let cam = $state({ ...VISTAS.iso });
  let camadas = $state({ envoltoria: true, plateia: true, sistema: true, nivel: true });
  let tela = $state(null);
  let arrastando = $state(false);
  let larguraCss = 1200;
  let alturaCss = 660;

  function poeVista(nome) {
    vista = nome;
    cam = { ...VISTAS[nome] };
  }
  function gira(dGiro, dAltura) {
    cam = {
      ...cam,
      giro: cam.giro + dGiro,
      altura: Math.min(1.5, Math.max(0.04, cam.altura + dAltura))
    };
  }
  function aproxima(fator) {
    cam = { ...cam, dist: Math.min(230, Math.max(64, cam.dist * fator)) };
  }

  let ultimo = null;
  function inicia(e) {
    arrastando = true;
    ultimo = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function move(e) {
    if (!arrastando || !ultimo) return;
    gira((e.clientX - ultimo.x) * -0.006, (e.clientY - ultimo.y) * 0.005);
    ultimo = { x: e.clientX, y: e.clientY };
  }
  function solta(e) {
    arrastando = false;
    ultimo = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  }
  function tecla(e) {
    const passo = 0.09;
    if (e.key === 'ArrowLeft') gira(-passo, 0);
    else if (e.key === 'ArrowRight') gira(passo, 0);
    else if (e.key === 'ArrowUp') gira(0, -passo);
    else if (e.key === 'ArrowDown') gira(0, passo);
    else if (e.key === '+' || e.key === '=') aproxima(1 / 1.12);
    else if (e.key === '-') aproxima(1.12);
    else return;
    e.preventDefault();
  }

  // ——————————————————————————————————————————————————————————————
  // Desenho
  // ——————————————————————————————————————————————————————————————

  let paleta = {
    linha: '#6b6663',
    forro: '#c9c2bf',
    piso: '#3a3634',
    poltrona: '#8d8683',
    arranjo: '#ff563c',
    delay: '#ff765c',
    fill: '#8c2618',
    sub: '#6b1c10',
    laje: 'rgba(255, 86, 60, 0.10)',
    peitoril: 'rgba(255, 86, 60, 0.22)',
    led: '#ff563c'
  };

  function lePaleta() {
    if (!tela) return;
    const cs = getComputedStyle(tela);
    const v = (nome, atual) => cs.getPropertyValue(nome).trim() || atual;
    paleta = {
      ...paleta,
      linha: v('--color-neutral-600', paleta.linha),
      forro: v('--color-neutral-200', paleta.forro),
      piso: v('--color-neutral-800', paleta.piso),
      poltrona: v('--color-neutral-400', paleta.poltrona),
      arranjo: v('--color-accent-500', paleta.arranjo),
      delay: v('--color-accent-400', paleta.delay),
      fill: v('--color-accent-700', paleta.fill),
      sub: v('--color-accent-800', paleta.sub),
      led: v('--color-accent-600', paleta.led)
    };
  }

  function desenha() {
    if (!tela) return;
    const ctx = tela.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const L = larguraCss;
    const A = alturaCss;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, L, A);

    const cg = Math.cos(cam.giro);
    const sg = Math.sin(cam.giro);
    const ca = Math.cos(cam.altura);
    const sa = Math.sin(cam.altura);
    const f = L * 0.92;
    const meioX = L / 2;
    const meioY = A * 0.54;

    /// Um ponto do mundo na tela. Devolve `null` atrás da câmera.
    function proj(x, y, z) {
      const dx = x - ALVO.x;
      const dy = y - ALVO.y;
      const dz = z - ALVO.z;
      const x1 = dx * cg + dy * sg;
      const y1 = -dx * sg + dy * cg;
      const prof = y1 * ca + dz * sa;
      const alto = -y1 * sa + dz * ca;
      const d = cam.dist - prof;
      if (d < 8) return null;
      const k = f / d;
      return { X: meioX + x1 * k, Y: meioY - alto * k, d };
    }

    function caminho(pts, fecha) {
      ctx.beginPath();
      let comecou = false;
      for (const [x, y, z] of pts) {
        const q = proj(x, y, z);
        if (!q) return false;
        if (comecou) ctx.lineTo(q.X, q.Y);
        else {
          ctx.moveTo(q.X, q.Y);
          comecou = true;
        }
      }
      if (fecha) ctx.closePath();
      return comecou;
    }

    // ————— envoltória —————
    if (camadas.envoltoria) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = paleta.linha;
      ctx.globalAlpha = 0.85;
      for (const [a, b] of arestas) {
        const p0 = proj(a[0], a[1], a[2]);
        const p1 = proj(b[0], b[1], b[2]);
        if (!p0 || !p1) continue;
        ctx.beginPath();
        ctx.moveTo(p0.X, p0.Y);
        ctx.lineTo(p1.X, p1.Y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (caminho(painelLed, true)) {
        ctx.fillStyle = paleta.led;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // ————— poltronas —————
    if (camadas.plateia) {
      // A laje do mezanino é desenhada entre as duas plateias: ela esconde as
      // últimas fileiras térreas, exatamente como esconde na sala.
      const desenhaPoltronas = (mez) => {
        for (const g of grupos) {
          if (g.mez !== mez) continue;
          ctx.fillStyle = camadas.nivel ? corDeNivel(g.n) : paleta.poltrona;
          for (const i of g.i) {
            const q = proj(poltronas[i * 3], poltronas[i * 3 + 1], poltronas[i * 3 + 2]);
            if (!q) continue;
            const s = Math.max(1.1, (0.55 * f) / q.d);
            ctx.fillRect(q.X - s / 2, q.Y - s / 2, s, s);
          }
        }
      };
      desenhaPoltronas(false);
      if (caminho(lajeMez, true)) {
        ctx.fillStyle = paleta.laje;
        ctx.fill();
      }
      if (caminho(peitorilMez, true)) {
        ctx.fillStyle = paleta.peitoril;
        ctx.fill();
        ctx.strokeStyle = paleta.arranjo;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      desenhaPoltronas(true);
    }

    // ————— sistema de som —————
    if (camadas.sistema) {
      const quads = [];
      for (const c of equipamento) {
        const cantos = [];
        let fora = false;
        for (let i = 0; i < 8; i++) {
          const q = proj(
            c.x + (i & 1 ? c.dx : -c.dx) / 2,
            c.y + (i & 2 ? c.dy : -c.dy) / 2,
            c.z + (i & 4 ? c.dz : -c.dz) / 2
          );
          if (!q) {
            fora = true;
            break;
          }
          cantos.push(q);
        }
        if (fora) continue;
        FACES.forEach((face, k) => {
          const pts = face.map((i) => cantos[i]);
          quads.push({
            pts,
            cor: paleta[c.grupo],
            brilho: BRILHO[k],
            d: (pts[0].d + pts[1].d + pts[2].d + pts[3].d) / 4
          });
        });
      }
      quads.sort((a, b) => b.d - a.d);
      for (const q of quads) {
        ctx.beginPath();
        ctx.moveTo(q.pts[0].X, q.pts[0].Y);
        for (let i = 1; i < 4; i++) ctx.lineTo(q.pts[i].X, q.pts[i].Y);
        ctx.closePath();
        ctx.globalAlpha = q.brilho;
        ctx.fillStyle = q.cor;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  // O canvas acompanha a largura do contêiner, e o buffer acompanha a tela do
  // aparelho — senão o desenho sai borrado onde mais se olha para ele.
  function ajusta() {
    if (!tela) return;
    const dpr = window.devicePixelRatio || 1;
    larguraCss = Math.max(320, tela.clientWidth || 1200);
    alturaCss = Math.round(Math.min(720, Math.max(380, larguraCss * 0.56)));
    tela.style.height = `${alturaCss}px`;
    tela.width = Math.round(larguraCss * dpr);
    tela.height = Math.round(alturaCss * dpr);
    desenha();
  }

  $effect(() => {
    if (!tela) return;
    lePaleta();
    ajusta();
    const obs = new ResizeObserver(() => ajusta());
    obs.observe(tela);
    return () => obs.disconnect();
  });

  // Redesenha quando a câmera ou as camadas mudam.
  $effect(() => {
    void cam.giro;
    void cam.altura;
    void cam.dist;
    void camadas.envoltoria;
    void camadas.plateia;
    void camadas.sistema;
    void camadas.nivel;
    desenha();
  });

  const escala = (() => {
    const passos = [];
    // A régua corre da esquerda para a direita, do nível mais baixo ao mais alto.
    for (let n = faixaNivel.de; n <= faixaNivel.ate; n++) passos.push({ n, c: corDeNivel(n) });
    return passos;
  })();

  const listaVistas = $derived([
    ['iso', r.modelo.vistas.iso],
    ['frente', r.modelo.vistas.frente],
    ['lado', r.modelo.vistas.lado],
    ['topo', r.modelo.vistas.topo]
  ]);
  const listaCamadas = $derived([
    ['envoltoria', r.modelo.camadas.envoltoria],
    ['plateia', r.modelo.camadas.plateia],
    ['sistema', r.modelo.camadas.sistema],
    ['nivel', r.modelo.camadas.nivel]
  ]);
</script>

<figure class="modelo">
  <div class="quadro">
    <header>
      <div>
        <span class="label rotulo">{r.modelo.titulo}</span>
        <span class="sub">{r.modelo.subtitulo}</span>
      </div>
      <div class="vistas" role="group" aria-label={r.modelo.vistas.titulo}>
        {#each listaVistas as [chave, nome]}
          <button type="button" class:ativa={vista === chave} onclick={() => poeVista(chave)}>
            {nome}
          </button>
        {/each}
        <button type="button" class="zoom" onclick={() => aproxima(1 / 1.15)}
                aria-label={r.modelo.aproximar}>+</button>
        <button type="button" class="zoom" onclick={() => aproxima(1.15)}
                aria-label={r.modelo.afastar}>−</button>
      </div>
    </header>

    <!-- Sem `role`: a tela não é uma estampa parada (arrastar gira, as setas
         giram, + e − aproximam), e também não é um controle de formulário —
         qualquer papel fixo mentiria sobre uma das duas coisas. Ela é
         focalizável e tem nome; quem navega por teclado alcança cada
         orientação útil pelos botões de vista, que são botões de verdade. -->
    <canvas
      bind:this={tela}
      class:arrastando
      tabindex="0"
      aria-label={r.modelo.aria(fmt.milhar(lugares.total))}
      onpointerdown={inicia}
      onpointermove={move}
      onpointerup={solta}
      onpointercancel={solta}
      onkeydown={tecla}
    ></canvas>

    <div class="rodape">
      <div class="camadas" role="group" aria-label={r.modelo.camadas.titulo}>
        {#each listaCamadas as [chave, nome]}
          <label>
            <input type="checkbox" bind:checked={camadas[chave]} />
            <span>{nome}</span>
          </label>
        {/each}
      </div>

      <div class="escala" aria-hidden="true">
        <span class="ponta">{fmt.dec(faixaNivel.de, 0)}</span>
        <span class="regua">
          {#each escala as passo}
            <i style="background:{passo.c}"></i>
          {/each}
        </span>
        <span class="ponta">{fmt.dec(faixaNivel.ate, 0)} dB</span>
      </div>
    </div>

    <p class="ajuda">{r.modelo.ajuda} · {r.modelo.rodape(fmt.milhar(lugares.total), gabinetes.length)}</p>
  </div>

  <figcaption>{r.modelo.figcaption(fmt.milhar(lugares.total), gabinetes.length)}</figcaption>
</figure>

<style>
  .modelo { margin: 0; }

  .quadro {
    border: 1px solid var(--color-neutral-800);
    background: rgba(248, 244, 244, 0.015);
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: baseline;
    justify-content: space-between;
    padding: 16px 18px 12px;
    border-bottom: 1px solid var(--color-neutral-800);
  }
  .rotulo { color: var(--color-neutral-300); }
  .sub {
    font-family: var(--font-tecnica);
    font-size: 11.5px;
    color: var(--color-neutral-600);
    margin-left: 12px;
  }

  .vistas { display: flex; gap: 6px; flex-wrap: wrap; }
  .vistas button {
    font-family: var(--font-tecnica);
    font-size: 11px;
    letter-spacing: 0.08em;
    padding: 5px 11px;
    color: var(--color-neutral-500);
    background: transparent;
    border: 1px solid var(--color-neutral-800);
    cursor: pointer;
  }
  .vistas button:hover { color: var(--color-neutral-200); border-color: var(--color-neutral-600); }
  .vistas button.ativa {
    color: var(--color-accent-400);
    border-color: var(--color-accent-700);
    background: rgba(255, 86, 60, 0.08);
  }
  .vistas .zoom { min-width: 32px; text-align: center; font-size: 13px; }
  /* Girar o modelo com o dedo exige acertar o botao com o dedo. */
@media (pointer: coarse), (max-width: 620px) {
    .vistas button { padding: 13px 14px; }
    .vistas .zoom { min-width: 44px; }
  }

  canvas {
    display: block;
    width: 100%;
    height: 520px;
    touch-action: none;
    cursor: grab;
  }
  canvas.arrastando { cursor: grabbing; }
  canvas:focus-visible { outline: 1px solid var(--color-accent-600); outline-offset: -1px; }

  .rodape {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    padding: 12px 18px;
    border-top: 1px solid var(--color-neutral-800);
  }
  .camadas { display: flex; gap: 16px; flex-wrap: wrap; }
  .camadas label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-family: var(--font-tecnica);
    font-size: 11.5px;
    color: var(--color-neutral-500);
    cursor: pointer;
  }
  .camadas input { accent-color: var(--color-accent-600); }

  .escala { display: flex; align-items: center; gap: 8px; }
  .escala .ponta { font-family: var(--font-tecnica); font-size: 10.5px; color: var(--color-neutral-600); }
  .regua { display: flex; height: 10px; }
  .regua i { display: block; width: 9px; height: 100%; }

  .ajuda {
    margin: 0;
    padding: 0 18px 14px;
    font-family: var(--font-tecnica);
    font-size: 10.5px;
    color: var(--color-neutral-700);
  }

  figcaption {
    margin-top: 16px;
    font-family: var(--font-tecnica);
    font-size: 11.5px;
    line-height: 1.65;
    color: var(--color-neutral-500);
    max-width: 88ch;
  }

  @media (max-width: 720px) {
    header { flex-direction: column; align-items: flex-start; }
    .sub { margin-left: 0; display: block; margin-top: 4px; }
  }
</style>
