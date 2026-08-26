<script>
  /// Comparador antes/depois no alto da home.
  ///
  /// Duas vistas do **mesmo** salão, na mesma perspectiva de um ponto: à
  /// esquerda o que existe hoje, à direita o que o projeto entrega. A costura
  /// entre as duas é uma diagonal, não uma vertical — a inclinação faz o corte
  /// parecer um gesto e não um recorte de software.
  ///
  /// A interação inteira sai de um `<input type="range">` transparente por
  /// cima da figura. É ele que dá arrasto com o mouse, arrasto com o dedo,
  /// setas do teclado, foco visível e leitura por leitor de tela — de graça e
  /// correto. Um handler de `pointermove` escrito à mão daria menos e erraria
  /// mais.
  ///
  /// **Imagens reais**: se `antes` e `depois` receberem URLs, elas entram no
  /// lugar do desenho. O desenho é o retrato falado enquanto a fotografia da
  /// obra não existe.
  import { rotulos } from '$lib/desenhos/rotulos.js';

  let { lang = 'pt', antes = '', depois = '' } = $props();
  const r = $derived(rotulos(lang).comparador);

  let pct = $state(50);
  let tocou = $state(false);

  /// A costura pende 9 % para a direita no topo: o polígono que revela o lado
  /// "depois" começa mais tarde em cima e mais cedo embaixo.
  const INCLINACAO = 9;
  const L = 1600;
  const A = 900;
  const topo = $derived(Math.min(100, Math.max(0, pct + INCLINACAO)));
  const base = $derived(Math.min(100, Math.max(0, pct - INCLINACAO)));
  const costura = $derived(
    [`${(pct + INCLINACAO) * (L / 100)} 0`, `${L} 0`, `${L} ${A}`, `${(pct - INCLINACAO) * (L / 100)} ${A}`].join(' ')
  );

  /// As fileiras saem de conta, não de coordenadas escritas uma a uma: em
  /// perspectiva de um ponto, cada fileira à frente é mais alta e mais larga
  /// que a anterior na mesma proporção. Escrever cinco polígonos à mão dá
  /// cinco chances de errar a fuga — e o olho percebe.
  const FUGA_X = 800;
  const bancos = (() => {
    const linhas = [];
    let y = 694;
    let alt = 26;
    let meia = 500;
    for (let i = 0; i < 5; i++) {
      const yb = y + alt;
      const meiaB = meia * 1.075;
      linhas.push({
        encosto: [
          `${FUGA_X - meia},${y}`,
          `${FUGA_X + meia},${y}`,
          `${FUGA_X + meiaB},${yb}`,
          `${FUGA_X - meiaB},${yb}`
        ].join(' '),
        aresta: `M${FUGA_X - meia} ${y} H${FUGA_X + meia}`,
        sombra: [
          `${FUGA_X - meiaB},${yb}`,
          `${FUGA_X + meiaB},${yb}`,
          `${FUGA_X + meiaB * 1.04},${yb + 12}`,
          `${FUGA_X - meiaB * 1.04},${yb + 12}`
        ].join(' '),
        // Encaixes do encosto: a régua de assentos que quebra a tarja preta.
        encaixes: Array.from({ length: 13 }, (_, k) => {
          const x = FUGA_X - meia + ((k + 0.5) * (2 * meia)) / 13;
          return `M${x} ${y} L${x + (x - FUGA_X) * 0.075} ${yb}`;
        }).join(' '),
        y,
        yb
      });
      y = yb + alt * 0.46;
      alt *= 1.22;
      meia = meiaB * 1.045;
    }
    return linhas;
  })();
</script>

<figure class="comparador">
  <div class="quadro">
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={r.aria}
    >
      <defs>
        <!-- Profundidade: o fundo da sala é sempre mais escuro que a boca. -->
        <!-- Hoje: fluorescente acesa. Uma sala sem projeto nao e' escura, e'
             chapada — clara, fria e sem sombra nenhuma. Desenha-la escura
             seria trapacear na comparacao. -->
        <linearGradient id="ad-teto" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#c6cacb" />
          <stop offset="1" stop-color="#9aa1a4" />
        </linearGradient>
        <linearGradient id="ad-piso" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#7d746a" />
          <stop offset="1" stop-color="#5b544c" />
        </linearGradient>
        <linearGradient id="ad-pared-e" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#b3ada3" />
          <stop offset="1" stop-color="#8b867d" />
        </linearGradient>
        <linearGradient id="ad-pared-d" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stop-color="#b3ada3" />
          <stop offset="1" stop-color="#8b867d" />
        </linearGradient>

        <!-- Depois: a sala projetada e' escura por escolha; a luz passa a vir
             do palco e das camadas de cena, nao do teto inteiro. -->
        <linearGradient id="ad-teto-d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#0a0b0c" />
          <stop offset="1" stop-color="#191c20" />
        </linearGradient>
        <linearGradient id="ad-piso-d" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#191512" />
          <stop offset="1" stop-color="#0e0d0c" />
        </linearGradient>

        <!-- Depois: madeira ripada e forro tratado ganham cor própria. -->
        <linearGradient id="ad-ripado-e" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#4a3524" />
          <stop offset="1" stop-color="#241a12" />
        </linearGradient>
        <linearGradient id="ad-ripado-d" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stop-color="#4a3524" />
          <stop offset="1" stop-color="#241a12" />
        </linearGradient>
        <linearGradient id="ad-led" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1f4f7a" />
          <stop offset="0.55" stop-color="#2b7fa8" />
          <stop offset="1" stop-color="#123449" />
        </linearGradient>
        <radialGradient id="ad-brilho" cx="0.5" cy="0.45" r="0.62">
          <stop offset="0" stop-color="#ffd9a8" stop-opacity="0.5" />
          <stop offset="1" stop-color="#ffd9a8" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="ad-frio" cx="0.5" cy="0.2" r="0.75">
          <stop offset="0" stop-color="#cfe3ea" stop-opacity="0.24" />
          <stop offset="1" stop-color="#cfe3ea" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="ad-feixe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffcf8a" stop-opacity="0.42" />
          <stop offset="1" stop-color="#ffcf8a" stop-opacity="0" />
        </linearGradient>

        <!-- Vinheta: nenhuma foto de interior tem os cantos tão claros quanto
             o centro, e sem isto o desenho denuncia que é desenho. -->
        <radialGradient id="ad-vinheta" cx="0.5" cy="0.48" r="0.78">
          <stop offset="0.55" stop-color="#000" stop-opacity="0" />
          <stop offset="1" stop-color="#000" stop-opacity="0.4" />
        </radialGradient>

        <!-- Bancos: madeira escura com o topo pegando a luz que vem de cima. -->
        <linearGradient id="ad-banco" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#4a3b2c" />
          <stop offset="0.28" stop-color="#2b2119" />
          <stop offset="1" stop-color="#14100c" />
        </linearGradient>
        <!-- Oclusão: o canto entre duas superfícies nunca recebe a mesma luz
             que o meio delas. É a falta disto que faz um desenho parecer
             desenho. -->
        <linearGradient id="ad-ao-e" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#000" stop-opacity="0.55" />
          <stop offset="1" stop-color="#000" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="ad-ao-d" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stop-color="#000" stop-opacity="0.55" />
          <stop offset="1" stop-color="#000" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="ad-ao-teto" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#000" stop-opacity="0.45" />
          <stop offset="1" stop-color="#000" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="ad-reflexo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2b7fa8" stop-opacity="0.34" />
          <stop offset="1" stop-color="#2b7fa8" stop-opacity="0" />
        </linearGradient>

        <!-- Grão: ruído fino por cima de tudo, como sensor de câmera. -->
        <filter id="ad-grao" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.86" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        <clipPath id="ad-costura" clipPathUnits="userSpaceOnUse">
          <polygon points={costura} />
        </clipPath>
        <clipPath id="ad-sala">
          <rect x="0" y="0" width="1600" height="900" />
        </clipPath>
      </defs>

      <g clip-path="url(#ad-sala)">
        <!-- ————— ANTES ————— -->
        {#if antes}
          <image href={antes} x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice" />
        {:else}
          <g>
            <rect width="1600" height="900" fill="#a7aaab" />
            <polygon points="0,0 1600,0 1180,300 420,300" fill="url(#ad-teto)" />
            <polygon points="0,0 420,300 420,620 0,900" fill="url(#ad-pared-e)" />
            <polygon points="1600,0 1180,300 1180,620 1600,900" fill="url(#ad-pared-d)" />
            <rect x="420" y="300" width="760" height="320" fill="#a29c92" />
            <polygon points="0,900 420,620 1180,620 1600,900" fill="url(#ad-piso)" />

            <!-- Forro de PVC: as emendas entregam o material. -->
            <g stroke="#7e8588" stroke-width="1.6" opacity="0.85">
              <path d="M0 0 L420 300 M200 0 L505 300 M400 0 L590 300 M600 0 L675 300
                       M800 0 L800 300 M1000 0 L925 300 M1200 0 L1010 300
                       M1400 0 L1095 300 M1600 0 L1180 300" />
              <path d="M300 62 L1300 62 M362 130 L1238 130 M400 200 L1200 200" opacity="0.5" />
            </g>

            <!-- Luminárias fluorescentes: luz fria, chapada, sem direção. -->
            <g fill="#e8f2f5" opacity="0.9">
              <rect x="530" y="86" width="150" height="12" />
              <rect x="920" y="86" width="150" height="12" />
              <rect x="560" y="158" width="130" height="10" />
              <rect x="910" y="158" width="130" height="10" />
            </g>
            <rect width="1600" height="900" fill="url(#ad-frio)" />
            <!-- Sem sombra: a luz chapada e o sintoma visivel do problema. -->

            <!-- Ventilador de teto e eletroduto aparente. -->
            <g stroke="#575c60" stroke-width="3" fill="none">
              <path d="M800 130 v26" />
              <path d="M712 158 h176 M800 148 l-56 20 M800 148 l56 20" stroke-width="5" />
            </g>
            <path d="M420 330 H1180" stroke="#6d7276" stroke-width="5" fill="none" />
            <path d="M470 330 v-18 M690 330 v-18 M930 330 v-18 M1130 330 v-18"
                  stroke="#6d7276" stroke-width="3" fill="none" />

            <!-- Alvenaria pintada: nada absorve nada. -->
            <g stroke="#7c766d" stroke-width="1.2" opacity="0.4">
              <path d="M0 300 L420 420 M0 470 L420 500 M0 640 L420 580" />
              <path d="M1600 300 L1180 420 M1600 470 L1180 500 M1600 640 L1180 580" />
            </g>

            <!-- Tela pequena e lavada pela luz de trabalho. -->
            <rect x="640" y="352" width="320" height="182" fill="#cdd2d4" />
            <rect x="650" y="360" width="300" height="166" fill="#b7c0c4" opacity="0.85" />
            <rect x="640" y="352" width="320" height="182" fill="none" stroke="#6a7074" stroke-width="3" />

            <!-- Duas caixas de mercado sobre tripé, apontando para o nada. -->
            <g fill="#2f3134" stroke="#5a5f63" stroke-width="2">
              <rect x="476" y="392" width="46" height="82" />
              <rect x="1078" y="392" width="46" height="82" />
            </g>
            <g stroke="#5a5f63" stroke-width="3" fill="none">
              <path d="M499 474 v96 M499 570 l-26 42 M499 570 l26 42" />
              <path d="M1101 474 v96 M1101 570 l-26 42 M1101 570 l26 42" />
            </g>

            <!-- Oclusão de canto: mesmo sob fluorescente, a junção de duas
                 paredes é mais escura que o meio de qualquer uma delas. -->
            <polygon points="0,0 420,300 420,620 0,900" fill="url(#ad-ao-e)" opacity="0.45" />
            <polygon points="1600,0 1180,300 1180,620 1600,900" fill="url(#ad-ao-d)" opacity="0.45" />
            <polygon points="0,0 1600,0 1180,300 420,300" fill="url(#ad-ao-teto)" opacity="0.35" />

            <!-- Púlpito e palco raso. -->
            <polygon points="420,620 1180,620 1300,700 300,700" fill="#6f6558" />
            <rect x="300" y="700" width="1000" height="16" fill="#4d463c" />
            <rect x="770" y="546" width="60" height="74" fill="#4a3f31" />
          </g>
        {/if}

        <!-- ————— DEPOIS ————— -->
        <g clip-path="url(#ad-costura)">
          {#if depois}
            <image href={depois} x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice" />
          {:else}
            <g>
              <rect width="1600" height="900" fill="#08090a" />
              <polygon points="0,0 1600,0 1180,300 420,300" fill="url(#ad-teto-d)" />
              <polygon points="0,0 420,300 420,620 0,900" fill="url(#ad-ripado-e)" />
              <polygon points="1600,0 1180,300 1180,620 1600,900" fill="url(#ad-ripado-d)" />
              <rect x="420" y="300" width="760" height="320" fill="#0f1113" />
              <polygon points="0,900 420,620 1180,620 1600,900" fill="url(#ad-piso-d)" />

              <!-- Forro acústico em plano inclinado: painéis, não emendas. -->
              <g fill="#1c1f22" stroke="#0c0e10" stroke-width="2">
                <polygon points="0,0 1600,0 1180,300 420,300" opacity="0.55" />
              </g>
              <g stroke="#31363b" stroke-width="2" opacity="0.9">
                <path d="M300 58 L1300 58 M356 124 L1244 124 M404 190 L1196 190 M420 256 L1180 256" />
              </g>
              <g fill="#0b0d0f" opacity="0.85">
                <polygon points="330,64 1270,64 1240,118 360,118" />
                <polygon points="386,130 1214,130 1190,184 410,184" />
              </g>

              <!-- Ripado de difusão nas laterais: a régua vertical é o material. -->
              <g stroke="#6a4c33" stroke-width="2" opacity="0.55">
                <path d="M40 26 L40 874 M110 76 L110 824 M180 126 L180 774
                         M250 176 L250 724 M320 226 L320 674 M390 276 L390 624" />
                <path d="M1560 26 L1560 874 M1490 76 L1490 824 M1420 126 L1420 774
                         M1350 176 L1350 724 M1280 226 L1280 674 M1210 276 L1210 624" />
              </g>

              <!-- Painel de LED: a fonte de luz da sala agora é a imagem. -->
              <rect x="556" y="336" width="488" height="252" fill="url(#ad-led)" />
              <rect x="556" y="336" width="488" height="252" fill="none" stroke="#0a0c0e" stroke-width="4" />
              <g stroke="#0d1a24" stroke-width="1" opacity="0.35">
                <path d="M556 400 h488 M556 464 h488 M556 528 h488
                         M680 336 v252 M800 336 v252 M920 336 v252" />
              </g>
              <ellipse cx="800" cy="462" rx="330" ry="180" fill="url(#ad-brilho)" />

              <!-- Arranjos L/R pendurados, com a curvatura que os define. -->
              <g fill="#14171a" stroke="#2c3237" stroke-width="1.6">
                <path d="M470 300 v18" stroke-width="3" />
                <rect x="452" y="318" width="38" height="16" />
                <rect x="453" y="336" width="36" height="16" transform="rotate(4 471 344)" />
                <rect x="455" y="354" width="34" height="16" transform="rotate(9 472 362)" />
                <rect x="457" y="372" width="32" height="16" transform="rotate(15 473 380)" />
                <rect x="460" y="390" width="30" height="16" transform="rotate(22 475 398)" />
                <path d="M1130 300 v18" stroke-width="3" />
                <rect x="1110" y="318" width="38" height="16" />
                <rect x="1111" y="336" width="36" height="16" transform="rotate(-4 1129 344)" />
                <rect x="1111" y="354" width="34" height="16" transform="rotate(-9 1128 362)" />
                <rect x="1111" y="372" width="32" height="16" transform="rotate(-15 1127 380)" />
                <rect x="1110" y="390" width="30" height="16" transform="rotate(-22 1125 398)" />
              </g>

              <!-- Treliça e refletores móveis: os feixes vivem na fumaça. -->
              <g stroke="#3a4046" stroke-width="3" fill="none">
                <path d="M330 236 H1270" />
                <path d="M330 250 H1270" />
                <path d="M330 236 l38 14 l38 -14 l38 14 l38 -14 l38 14 l38 -14 l38 14 l38 -14
                         l38 14 l38 -14 l38 14 l38 -14 l38 14 l38 -14 l38 14 l38 -14 l38 14
                         l38 -14 l38 14 l38 -14 l38 14 l38 -14 l38 14 l38 -14" />
              </g>
              <g fill="#191d21">
                <rect x="392" y="250" width="22" height="26" />
                <rect x="592" y="250" width="22" height="26" />
                <rect x="792" y="250" width="22" height="26" />
                <rect x="992" y="250" width="22" height="26" />
                <rect x="1186" y="250" width="22" height="26" />
              </g>
              <g fill="url(#ad-feixe)">
                <polygon points="398,276 408,276 512,700 330,700" />
                <polygon points="598,276 608,276 700,700 520,700" />
                <polygon points="798,276 808,276 900,700 706,700" />
                <polygon points="998,276 1008,276 1096,700 908,700" />
                <polygon points="1192,276 1202,276 1290,700 1102,700" />
              </g>

              <!-- Banho de cor nas laterais, que é o que faz a sala virar cena. -->
              <polygon points="0,300 420,420 420,620 0,900" fill="#7b3f18" opacity="0.16" />
              <polygon points="1600,300 1180,420 1180,620 1600,900" fill="#7b3f18" opacity="0.16" />

              <!-- Palco com face nova e degrau iluminado. -->
              <polygon points="420,620 1180,620 1300,700 300,700" fill="#191613" />
              <rect x="300" y="700" width="1000" height="16" fill="#0f0d0c" />
              <path d="M300 700 H1300" stroke="#c8823c" stroke-width="3" opacity="0.6" fill="none" />
              <rect x="770" y="540" width="60" height="80" fill="#241d16" />

              <!-- O painel devolve luz ao piso do palco: sem esse reflexo a
                   fonte de luz mais forte da sala não ilumina nada. -->
              <polygon points="580,620 1020,620 1080,700 520,700" fill="url(#ad-reflexo)" />
              <polygon points="0,0 420,300 420,620 0,900" fill="url(#ad-ao-e)" />
              <polygon points="1600,0 1180,300 1180,620 1600,900" fill="url(#ad-ao-d)" />
            </g>
          {/if}
        </g>

        <!-- ————— comum aos dois lados —————
             As poltronas são as mesmas dos dois lados da costura: é o que
             prova que a sala é a mesma e só o projeto mudou. -->
        {#each bancos as b}
          <polygon points={b.sombra} fill="#000" opacity="0.42" />
          <polygon points={b.encosto} fill="url(#ad-banco)" />
          <path d={b.encaixes} stroke="#0c0906" stroke-width="1.3" fill="none" opacity="0.75" />
          <path d={b.aresta} stroke="#8a7358" stroke-width="1.8" fill="none" opacity="0.5" />
        {/each}

        <rect width="1600" height="900" fill="url(#ad-vinheta)" />
        <rect width="1600" height="900" filter="url(#ad-grao)" opacity="0.085" style="mix-blend-mode:overlay" />
      </g>

      <!-- A linha da costura por cima de tudo, em coordenadas da própria
           figura: assim ela acompanha o corte exatamente, sem um segundo SVG
           esticado por preserveAspectRatio="none". -->
      <line
        x1={topo * (L / 100)} y1="0"
        x2={base * (L / 100)} y2="900"
        stroke="var(--color-accent-600)" stroke-width="3" vector-effect="non-scaling-stroke"
      />
    </svg>

    <span class="marca marca-antes">{r.antes}</span>
    <span class="marca marca-depois">{r.depois}</span>

    <div class="pega" style="left:{pct}%">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9 6 L4 12 L9 18 M15 6 L20 12 L15 18" />
      </svg>
    </div>

    <!-- O controle real. Transparente e do tamanho da figura: arrastar em
         cima da imagem é arrastar o range. -->
    <input
      class="controle"
      type="range" min="0" max="100" step="0.5"
      bind:value={pct}
      oninput={() => (tocou = true)}
      aria-label={r.aria}
      aria-valuetext={r.leitura(Math.round(pct))}
    />

    <span class="dica" style="opacity:{tocou ? 0 : 1}">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
           stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9 6 L4 12 L9 18 M15 6 L20 12 L15 18" />
      </svg>
      {r.dica}
    </span>
  </div>

  <figcaption>{r.figcaption}</figcaption>
</figure>

<style>
  .comparador { margin: 0; }
  .quadro {
    position: relative;
    overflow: hidden;
    background: #0b0c0d;
    border-top: 2px solid var(--color-text);
    border-bottom: 2px solid var(--color-text);
  }
  /* Filho direto, nao descendente: o seletor antigo esticava tambem o icone
     do puxador e o da dica ate 100 % x 780 px. */
  .quadro > svg {
    display: block;
    width: 100%;
    height: min(72vh, 780px);
  }
  .pega svg,
  .dica svg { flex: none; }

  .marca {
    position: absolute;
    top: 18px;
    font-family: var(--font-tecnica);
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 7px 12px;
    background: rgba(10, 11, 12, 0.78);
    pointer-events: none;
  }
  .marca-antes { left: 20px; color: var(--color-neutral-300); }
  .marca-depois { right: 20px; color: var(--color-accent-400); }

  .pega {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 54px;
    height: 54px;
    background: var(--color-neutral-100);
    color: var(--color-text);
    border: 2px solid var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  /* O range some, mas continua sendo ele quem recebe o gesto e o teclado. */
  .controle {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    opacity: 0;
    cursor: ew-resize;
    -webkit-appearance: none;
    appearance: none;
    background: transparent;
  }
  .controle::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 56px;
    height: 100%;
    cursor: ew-resize;
  }
  .controle::-moz-range-thumb {
    width: 56px;
    height: 100%;
    border: 0;
    background: transparent;
    cursor: ew-resize;
  }
  /* Invisível não pode significar inalcançável pelo teclado. */
  .controle:focus-visible {
    outline: 3px solid var(--color-accent-600);
    outline-offset: -3px;
  }

  .dica {
    position: absolute;
    bottom: 18px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 8px 14px;
    background: rgba(10, 11, 12, 0.82);
    border: 1px solid rgba(247, 245, 243, 0.24);
    font-family: var(--font-tecnica);
    font-size: 10.5px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--color-neutral-300);
    pointer-events: none;
    transition: opacity 0.3s;
  }

  figcaption {
    font-family: var(--font-tecnica);
    font-size: 11.5px;
    line-height: 1.6;
    letter-spacing: 0.02em;
    color: var(--color-neutral-700);
    max-width: 1180px;
    margin: 16px auto 0;
    padding: 0 48px;
  }

  @media (max-width: 760px) {
    .quadro svg { height: min(56vh, 460px); }
    .marca { top: 12px; font-size: 10px; padding: 6px 10px; }
    .marca-antes { left: 12px; }
    .marca-depois { right: 12px; }
    .pega { width: 42px; height: 42px; }
    .dica { bottom: 12px; font-size: 9.5px; padding: 7px 11px; }
    figcaption { padding: 0 20px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .dica { transition: none; }
  }
</style>
