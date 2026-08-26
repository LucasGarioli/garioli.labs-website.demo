<script>
  /// Comparador antes/depois no alto da home.
  ///
  /// É a **mesma sala** dos desenhos técnicos que vêm mais abaixo, agora vista
  /// por dentro: cada ponto desta figura sai de `projeto.js` e passa por uma
  /// projeção de um ponto. Não é um salão genérico — se a geometria do estudo
  /// de caso mudar, esta vista muda junto, e a promessa de que a página inteira
  /// fala de um projeto só continua de pé.
  ///
  /// À esquerda o que existe hoje, à direita o que o projeto entrega. A
  /// costura entre as duas é uma diagonal, não uma vertical — a inclinação faz
  /// o corte parecer um gesto e não um recorte de software.
  ///
  /// A interação inteira sai de um `input type="range"` transparente por cima
  /// da figura. É ele que dá arrasto com o mouse, arrasto com o dedo, setas do
  /// teclado, foco visível e leitura por leitor de tela — de graça e correto.
  /// Um handler de `pointermove` escrito à mão daria menos e erraria mais.
  ///
  /// **Imagens reais**: se `antes` e `depois` receberem URLs, elas entram no
  /// lugar do desenho. O desenho é o retrato falado enquanto a fotografia da
  /// obra não existe.
  import { rotulos } from '$lib/desenhos/rotulos.js';
  import {
    sala, palco, foco, gabinetes, foh, operacao,
    fileirasPlateia, polar, teto, nivelOuvidoEm, alturaOuvido
  } from '$lib/desenhos/projeto.js';

  let { lang = 'pt', antes = '', depois = '' } = $props();
  const r = $derived(rotulos(lang).comparador);

  let pct = $state(50);
  let tocou = $state(false);

  /// A costura pende 9 % para a direita no topo: o polígono que revela o lado
  /// "depois" começa mais tarde em cima e mais cedo embaixo.
  const INCLINACAO = 9;
  const L = 1600;
  const A = 900;

  /// A costura é inclinada, então ela ocupa uma faixa de 2 × INCLINACAO de
  /// largura — o topo entra em quadro antes da base, e sai depois. Levar o
  /// controle de 0 a 100 direto no eixo da figura deixaria, nos extremos, uma
  /// cunha do outro lado sempre visível: no fim do curso o lado revelado
  /// nunca ficava inteiro. O curso do controle vai, por isso, de −INCLINACAO
  /// a 100 + INCLINACAO: em 0 a costura já saiu inteira pela esquerda, em 100
  /// já saiu inteira pela direita.
  const centro = $derived(-INCLINACAO + (pct / 100) * (100 + 2 * INCLINACAO));
  const topo = $derived(centro + INCLINACAO);
  const base = $derived(centro - INCLINACAO);
  const costura = $derived(
    [`${topo * (L / 100)} 0`, `${L} 0`, `${L} ${A}`, `${base * (L / 100)} ${A}`].join(' ')
  );

  /// Cada rótulo pertence ao seu lado. Com o lado inteiro fora de quadro, o
  /// rótulo que ficasse aceso estaria nomeando a imagem errada.
  const opacidade = (v) => Math.min(1, Math.max(0, v / 7));
  const opAntes = $derived(opacidade(pct));
  const opDepois = $derived(opacidade(100 - pct));

  /// A pega marca a costura na meia-altura da figura, que é onde ela cruza o
  /// `centro` — e não o valor bruto do controle, que estaria até nove por
  /// cento longe da linha vermelha. Nos extremos a costura sai de quadro e a
  /// pega encosta na borda: dali em diante quem arrasta é a figura inteira.
  const pega = $derived(Math.min(100, Math.max(0, centro)));

  // ————————————————————— a câmera —————————————————————
  /// Sobre o praticável de transmissão: 8,00 m acima do piso da plateia e
  /// quatro metros atrás da mesa de som. É de onde se fotografa uma sala deste
  /// porte — alto o bastante para a plateia abrir em leque, baixo o bastante
  /// para o palco continuar sendo o assunto.
  const CAM = { x: 56.0, z: 8.0 };
  const VPX = 800;
  const VPY = 470;
  /// Distância focal em pixels. Com 880, o palco de 32,00 m ocupa 741 px de
  /// tela e as paredes laterais ainda entram pelas bordas — mais lente que
  /// isso perde o ripado, menos perde o sistema. Mudar este número é trocar
  /// de lente, não de sala.
  const DIST = 880;

  /// Pixels por metro no plano de profundidade `x`. O piso do `max` evita a
  /// divisão por zero de um ponto que caia sobre a própria lente.
  const kd = (x) => DIST / Math.max(2.5, CAM.x - x);
  const sx = (x, y) => VPX + (y - foco.y) * kd(x);
  const sy = (x, z) => VPY + (CAM.z - z) * kd(x);
  const n1 = (v) => Number(v.toFixed(1));
  const P = (x, y, z) => `${n1(sx(x, y))},${n1(sy(x, z))}`;
  /// Metros a partir do eixo da sala, que é como se pensa em projeto — a
  /// coordenada absoluta de `projeto.js` conta do canto.
  const eixo = (dy) => foco.y + dy;
  const piso = (x) => nivelOuvidoEm(x) - alturaOuvido;

  // ————————————————————— a casca —————————————————————
  const MEIA = sala.largura / 2;
  const F_E = n1(sx(0, eixo(-MEIA)));
  const F_D = n1(sx(0, eixo(MEIA)));
  const F_TETO = n1(sy(0, sala.alturaProscenio));
  const F_PISO = n1(sy(0, 0));

  const pTeto = `0,0 1600,0 ${F_D},${F_TETO} ${F_E},${F_TETO}`;
  const pPiso = `0,900 ${F_E},${F_PISO} ${F_D},${F_PISO} 1600,900`;
  const pParedeE = `0,0 ${F_E},${F_TETO} ${F_E},${F_PISO} 0,900`;
  const pParedeD = `1600,0 ${F_D},${F_TETO} ${F_D},${F_PISO} 1600,900`;

  /// Juntas transversais do forro, na profundidade real. O forro é um plano
  /// inclinado, então cada faixa sobe um pouco em relação à anterior — é essa
  /// diferença, e não uma grade decorativa, que dá a inclinação do teto.
  const juntasTeto = [2, 7, 13, 20, 29, 40].map((x) => ({
    x1: n1(sx(x, eixo(-MEIA))),
    x2: n1(sx(x, eixo(MEIA))),
    y: n1(sy(x, teto(x)))
  }));

  /// E as longitudinais, que fogem para o ponto de fuga.
  const raiosTeto = [-36, -21, -7, 7, 21, 36].map((dy) => ({
    x1: n1(sx(0, eixo(dy))),
    y1: F_TETO,
    x2: n1(sx(46, eixo(dy))),
    y2: n1(sy(46, teto(46)))
  }));

  /// Ripado de difusão: uma ripa a cada 0,80 m de parede. Só os primeiros
  /// metros de sala cabem no quadro — olhando de frente, a parede lateral é
  /// uma cunha estreita, e essa é a leitura correta.
  const ripas = (() => {
    const saida = [];
    for (let x = 0.8; x <= 14; x += 0.8) {
      for (const lado of [-1, 1]) {
        const px = sx(x, eixo(lado * MEIA));
        if (px < -40 || px > 1640) continue;
        saida.push({ x: n1(px), y1: n1(sy(x, teto(x))), y2: n1(sy(x, 0)) });
      }
    }
    return saida;
  })();

  // ————————————————————— o palco —————————————————————
  const MP = palco.largura / 2;
  const deck = [
    P(palco.x0, eixo(-MP), palco.nivel),
    P(palco.x0, eixo(MP), palco.nivel),
    P(palco.x1, eixo(MP), palco.nivel),
    P(palco.x1, eixo(-MP), palco.nivel)
  ].join(' ');
  const deckFrente = [
    P(palco.x1, eixo(-MP), palco.nivel),
    P(palco.x1, eixo(MP), palco.nivel),
    P(palco.x1, eixo(MP), 0),
    P(palco.x1, eixo(-MP), 0)
  ].join(' ');
  const bordaPalco = `M${P(palco.x1, eixo(-MP), palco.nivel)} L${P(palco.x1, eixo(MP), palco.nivel)}`;
  const reflexoPalco = [
    P(palco.x0 + 2, eixo(-12), palco.nivel),
    P(palco.x0 + 2, eixo(12), palco.nivel),
    P(palco.x1, eixo(15), palco.nivel),
    P(palco.x1, eixo(-15), palco.nivel)
  ].join(' ');

  /// Painel de LED sobre o fundo do palco: 18,00 × 5,00 m, a 2,50 m do piso.
  const led = (() => {
    const x = 0.4;
    const k = kd(x);
    const zBase = palco.nivel + 2.5;
    return {
      x: n1(sx(x, eixo(-palco.ledLargura / 2))),
      y: n1(sy(x, zBase + palco.ledAltura)),
      w: n1(palco.ledLargura * k),
      h: n1(palco.ledAltura * k),
      cx: VPX,
      cy: n1(sy(x, zBase + palco.ledAltura / 2))
    };
  })();

  /// Telas laterais de imagem ampliada, para as poltronas do extremo do leque.
  const telasLaterais = [-1, 1].map((lado) => {
    const x = 1.2;
    const k = kd(x);
    const t = palco.telaLateral;
    return {
      x: n1(sx(x, eixo(lado * t.dy - t.largura / 2))),
      y: n1(sy(x, palco.nivel + t.z + t.altura)),
      w: n1(t.largura * k),
      h: n1(t.altura * k)
    };
  });

  /// Painel absorvedor no fundo, de cada lado do palco.
  const painelFundo = [
    { x: F_E, w: n1(sx(0, eixo(-MP)) - F_E) },
    { x: n1(sx(0, eixo(MP))), w: n1(F_D - sx(0, eixo(MP))) }
  ];

  // ————————————————————— o sistema —————————————————————
  /// Todo o sistema sai de `gabinetes`, a mesma lista que a planta, o corte, a
  /// axonometria e o modelo percorrem: as mesmas caixas, nas mesmas cotas, com
  /// a mesma guinada e o mesmo tombo. Esta vista não tem uma segunda versão do
  /// rig — era ela que fazia o subgrave voado aparecer deitado aqui e
  /// empilhado nas pranchas.
  ///
  /// Cada gabinete é projetado canto a canto, e não desenhado como um
  /// retângulo com uma rotação inventada por cima: a caixa tem eixo próprio
  /// (guinada em torno da vertical, tombo em torno da lateral), e o que se vê
  /// é a face que olha para a lente mais a face horizontal que ela alcança. É
  /// daí que sai, de graça, a curvatura do arranjo, o leque do preenchimento
  /// de primeira fila e o retorno deitado para trás no palco.
  const corpo = (g) => {
    const t = ((g.inclinacao ?? 0) * Math.PI) / 180;
    const p = ((g.giro ?? 0) * Math.PI) / 180;
    const u = [Math.cos(p) * Math.cos(t), Math.sin(p) * Math.cos(t), -Math.sin(t)];
    const v = [-Math.sin(p), Math.cos(p)];
    const w = [Math.cos(p) * Math.sin(t), Math.sin(p) * Math.sin(t), Math.cos(t)];
    const a = g.prof / 2;
    const b = g.larg / 2;
    const c = g.alt / 2;
    const pt = ([su, sv, sw]) =>
      P(
        g.x + su * a * u[0] + sv * b * v[0] + sw * c * w[0],
        g.y + su * a * u[1] + sv * b * v[1] + sw * c * w[1],
        g.z + su * a * u[2] + sw * c * w[2]
      );
    // Qual das duas faces opostas está voltada para a lente.
    const dx = CAM.x - g.x;
    const dy = foco.y - g.y;
    const dz = CAM.z - g.z;
    const fu = u[0] * dx + u[1] * dy + u[2] * dz > 0 ? 1 : -1;
    const fw = w[0] * dx + w[1] * dy + w[2] * dz > 0 ? 1 : -1;
    const quad = (cantos) => cantos.map(pt).join(' ');
    return {
      tipo: g.tipo,
      // Quem está mais perto da lente é desenhado por último.
      ordem: g.x,
      frente: quad([[fu, -1, 1], [fu, 1, 1], [fu, 1, -1], [fu, -1, -1]]),
      chanfro: quad([[1, -1, fw], [1, 1, fw], [-1, 1, fw], [-1, -1, fw]])
    };
  };

  const equipamento = gabinetes
    // O que está atrás da lente não entra no quadro — o segundo anel de delay
    // fica sobre a cabeça de quem olha.
    .filter((g) => g.x < CAM.x - 5)
    .map(corpo)
    .sort((a, b) => a.ordem - b.ordem);

  /// Cabo de içamento: toda coluna pendurada nasce no forro. Sem ele a coluna
  /// flutua, e a figura perde a única coisa que ela precisa dizer sobre
  /// aquilo — que está pendurado, e não apoiado.
  const hastes = (() => {
    const topo = new Map();
    for (const g of gabinetes) {
      if (g.z < 6 || g.x > CAM.x - 5) continue;
      const chave = `${g.grupo}|${g.y.toFixed(2)}`;
      const t = topo.get(chave);
      if (!t || g.z > t.z) topo.set(chave, g);
    }
    return [...topo.values()]
      .map((g) => ({
        x: n1(sx(g.x, g.y)),
        y1: n1(sy(g.x, teto(g.x))),
        y2: n1(sy(g.x, g.z + g.alt / 2))
      }))
      .filter((h) => h.x > -140 && h.x < 1740);
  })();

  /// A banda no palco. Sem gente, nenhuma sala tem escala — e é a escala que
  /// separa um desenho de uma fotografia. Cinco silhuetas de 1,75 m sobre um
  /// piso a 1,20 m dizem, sozinhas, que a boca de cena tem trinta e dois
  /// metros.
  const banda = (() => {
    const x = 10.5;
    const k = kd(x);
    return {
      x,
      k: n1(k),
      riser: [
        P(x - 2.8, eixo(-3.2), palco.nivel + 0.6),
        P(x - 2.8, eixo(3.2), palco.nivel + 0.6),
        P(x + 0.2, eixo(3.6), palco.nivel + 0.6),
        P(x + 0.2, eixo(-3.6), palco.nivel + 0.6)
      ].join(' '),
      gente: [-10.5, -5.2, 0.6, 6.4, 11].map((dy, i) => {
        const alt = 1.72 + (i % 2) * 0.06;
        return {
          cx: n1(sx(x, eixo(dy))),
          cy: n1(sy(x, palco.nivel + alt)),
          rx: n1(0.15 * k),
          ry: n1(0.19 * k),
          corpo: [
            `${n1(sx(x, eixo(dy - 0.4)))},${n1(sy(x, palco.nivel))}`,
            `${n1(sx(x, eixo(dy - 0.25)))},${n1(sy(x, palco.nivel + alt - 0.3))}`,
            `${n1(sx(x, eixo(dy + 0.25)))},${n1(sy(x, palco.nivel + alt - 0.3))}`,
            `${n1(sx(x, eixo(dy + 0.4)))},${n1(sy(x, palco.nivel))}`
          ].join(' ')
        };
      })
    };
  })();

  /// Estrutura do forro: as treliças de cobertura, bem acima das de cena. Uma
  /// sala deste volume não tem teto liso — tem estrutura, e ela aparece.
  const estrutura = [24, 34, 46].map((x) => ({
    x1: n1(sx(x, eixo(-MEIA))),
    x2: n1(sx(x, eixo(MEIA))),
    largura: n1(sx(x, eixo(MEIA)) - sx(x, eixo(-MEIA))),
    y: n1(sy(x, teto(x) - 1.3)),
    h: n1(0.9 * kd(x))
  }));

  /// Treliças de cena com refletores móveis. O feixe só existe porque há
  /// fumaça no ar — sem ela, luz de palco não se vê, só se recebe.
  const trelicas = [7, 12, 16.5].map((x) => {
    const k = kd(x);
    const z = teto(x) - 2.6;
    return {
      x1: n1(sx(x, eixo(-MP - 2))),
      x2: n1(sx(x, eixo(MP + 2))),
      y: n1(sy(x, z)),
      h: n1(0.55 * k),
      largura: n1(sx(x, eixo(MP + 2)) - sx(x, eixo(-MP - 2))),
      refletores: Array.from({ length: 7 }, (_, i) => {
        const dy = (i - 3) * 5.2;
        return {
          x: n1(sx(x, eixo(dy)) - (0.5 * k) / 2),
          y: n1(sy(x, z - 0.05)),
          w: n1(0.5 * k),
          h: n1(0.85 * k),
          feixe: [
            `${n1(sx(x, eixo(dy - 0.2)))},${n1(sy(x, z - 0.9))}`,
            `${n1(sx(x, eixo(dy + 0.2)))},${n1(sy(x, z - 0.9))}`,
            `${n1(sx(palco.x0 + 3, eixo(dy * 0.62 + 3.4)))},${n1(sy(palco.x0 + 3, palco.nivel))}`,
            `${n1(sx(palco.x0 + 3, eixo(dy * 0.62 - 3.4)))},${n1(sy(palco.x0 + 3, palco.nivel))}`
          ].join(' ')
        };
      })
    };
  });

  // ————————————————————— a plateia —————————————————————
  /// Cada fileira é um arco de verdade: a plateia é um leque, e em perspectiva
  /// o arco sobe nas pontas porque as pontas estão mais longe da câmera. Os
  /// quatro corredores aparecem sozinhos — os blocos vêm do próprio modelo,
  /// com a lacuna já no lugar certo.
  function arcoDoBloco(f, bloco, dz) {
    const passos = 9;
    const ps = [];
    for (let i = 0; i <= passos; i++) {
      const a = bloco.a0 + (i / passos) * (bloco.a1 - bloco.a0);
      const p = polar(f.raio, a);
      ps.push(P(p.x, p.y, f.nivel + dz));
    }
    return ps;
  }

  const fileiras = fileirasPlateia
    .map((f) => {
      const meio = polar(f.raio, 0);
      return { f, y: sy(meio.x, f.nivel + 1.05), k: kd(meio.x) };
    })
    .filter((o) => o.y < 980)
    .map(({ f, k }) => ({
      blocos: f.blocos.map((b) => {
        const alto = arcoDoBloco(f, b, 1.05);
        const baixo = arcoDoBloco(f, b, 0.4);
        return {
          corpo: [...alto, ...[...baixo].reverse()].join(' '),
          crista: `M${alto.join(' L')}`,
          // Sem esta sombra as fileiras encostam umas nas outras e a plateia
          // vira uma escadaria: é a linha escura na base de um encosto que o
          // separa do encosto de trás.
          sombra: `M${baixo.join(' L')}`
        };
      }),
      /// Um traço por poltrona, num caminho só. Cento e poucas poltronas por
      /// fileira não podem virar cento e poucos nós de DOM numa figura que é o
      /// topo da página — e nas fileiras distantes o traço não seria visto de
      /// qualquer forma.
      encaixes:
        k > 40
          ? f.angulos
              .map((a) => {
                const p = polar(f.raio, a);
                return `M${P(p.x, p.y, f.nivel + 1.0)} L${P(p.x, p.y, f.nivel + 0.5)}`;
              })
              .join(' ')
          : ''
    }));

  // ————————————————————— a ilha de operação —————————————————————
  const mesa = (() => {
    const xf = foco.x + foh.raio - foh.profundidade / 2;
    const xn = foco.x + foh.raio + foh.profundidade / 2;
    const z0 = piso(xf);
    const z1 = z0 + 0.95;
    const meia = foh.largura / 2;
    const k = kd(xf);
    return {
      tampo: [
        P(xf, eixo(-meia), z1), P(xf, eixo(meia), z1),
        P(xn, eixo(meia), z1), P(xn, eixo(-meia), z1)
      ].join(' '),
      frente: [
        P(xn, eixo(-meia), z1), P(xn, eixo(meia), z1),
        P(xn, eixo(meia), z0), P(xn, eixo(-meia), z0)
      ].join(' '),
      telas: Array.from({ length: 5 }, (_, i) => {
        const dy = -3.6 + i * 1.8;
        return {
          x: n1(sx(xf, eixo(dy - 0.6))),
          y: n1(sy(xf, z1 + 0.58)),
          w: n1(1.2 * k),
          h: n1(0.58 * k)
        };
      }),
      gente: [-2.6, 2.1].map((dy) => ({
        cx: n1(sx(xf, eixo(dy))),
        cy: n1(sy(xf, z1 + 0.92)),
        rx: n1(0.19 * k),
        ry: n1(0.24 * k),
        ombro: [
          `${n1(sx(xf, eixo(dy - 0.48)))},${n1(sy(xf, z1))}`,
          `${n1(sx(xf, eixo(dy - 0.3)))},${n1(sy(xf, z1 + 0.72))}`,
          `${n1(sx(xf, eixo(dy + 0.3)))},${n1(sy(xf, z1 + 0.72))}`,
          `${n1(sx(xf, eixo(dy + 0.48)))},${n1(sy(xf, z1))}`
        ].join(' ')
      })),
      /// O "hoje" também opera de algum lugar: uma mesa dobrável no mesmo
      /// ponto, com um mixer de doze canais em cima. É a mesma posição — o que
      /// muda é o que existe nela.
      dobravel: [
        P(xf, eixo(-1.2), z0 + 0.75), P(xf, eixo(1.2), z0 + 0.75),
        P(xn, eixo(1.2), z0 + 0.75), P(xn, eixo(-1.2), z0 + 0.75)
      ].join(' '),
      mixer: {
        x: n1(sx(xf, eixo(-0.55))),
        y: n1(sy(xf, z0 + 0.98)),
        w: n1(1.1 * k),
        h: n1(0.23 * k)
      },
      pernas: `M${n1(sx(xn, eixo(-1.1)))} ${n1(sy(xn, z0 + 0.75))} V${n1(sy(xn, z0))} M${n1(sx(xn, eixo(1.1)))} ${n1(sy(xn, z0 + 0.75))} V${n1(sy(xn, z0))}`
    };
  })();

  /// Cabine de transmissão e sala de racks, uma de cada lado da mesa.
  ///
  /// São duas salas de verdade, e o que faz uma sala se ler como sala é ela
  /// **fechar**: estrado embaixo, laje em cima, parede de fundo, montantes no
  /// vidro. Antes daqui saíam só dois planos soltos, e o que se via era uma
  /// mancha clara com luzinhas — a lente está 1,80 m acima do forro delas, e
  /// de cima um plano sem tampa não tem leitura nenhuma.
  function cabine(c, lado) {
    // A face envidraçada é a que olha para o eixo da sala, onde fica a mesa.
    const dyI = lado < 0 ? c.dy1 : c.dy0;
    const dyE = lado < 0 ? c.dy0 : c.dy1;
    const q = (cantos) => cantos.map(([x, dy, z]) => P(x, eixo(dy), z)).join(' ');
    const montantes = [1, 2, 3].map((i) => {
      const x = c.x0 + ((c.x1 - c.x0) * i) / 4;
      return `M${P(x, eixo(dyI), c.z0)} L${P(x, eixo(dyI), c.z1)}`;
    });
    return {
      /// O estrado acompanha a rampa da plateia: mais alto atrás, mais baixo
      /// na frente. É essa aresta inclinada que assenta a caixa no piso.
      estrado: q([
        [c.x0, dyI, c.z0], [c.x1, dyI, c.z0],
        [c.x1, dyI, piso(c.x1)], [c.x0, dyI, piso(c.x0)]
      ]),
      fundo: q([[c.x0, dyI, c.z1], [c.x0, dyE, c.z1], [c.x0, dyE, c.z0], [c.x0, dyI, c.z0]]),
      vidro: q([[c.x0, dyI, c.z1], [c.x1, dyI, c.z1], [c.x1, dyI, c.z0], [c.x0, dyI, c.z0]]),
      parapeito: q([
        [c.x0, dyI, c.z0 + 0.95], [c.x1, dyI, c.z0 + 0.95],
        [c.x1, dyI, c.z0], [c.x0, dyI, c.z0]
      ]),
      /// A parede de trás, do lado da lente, e a laje de cobertura: são elas
      /// que dão volume à caixa em vez de plano.
      traseira: q([[c.x1, dyI, c.z1], [c.x1, dyE, c.z1], [c.x1, dyE, c.z0], [c.x1, dyI, c.z0]]),
      laje: q([
        [c.x0, dyI, c.z1], [c.x1, dyI, c.z1],
        [c.x1, dyE, c.z1], [c.x0, dyE, c.z1]
      ]),
      montantes
    };
  }

  const salaRacks = cabine(operacao.racks, -1);
  const salaTv = cabine(operacao.transmissao, 1);

  /// Racks no estilo de sala de servidores: armários pretos em fila **contra a
  /// parede externa**, e não colados no vidro — encostados no vidro eles
  /// tapavam a sala inteira, que é o que fazia a figura virar um paredão de
  /// luzinhas azuis. Recuados, aparecem atrás de um metro e meio de piso
  /// vazio, que é o que dá a profundidade.
  const racks = Array.from({ length: operacao.racks.unidades }, (_, i) => {
    const c = operacao.racks;
    const x = c.x0 + 0.5 + ((i + 0.5) * (c.x1 - c.x0 - 1)) / c.unidades;
    const k = kd(x);
    // Encostados no fundo da sala eles somem no escuro; encostados no vidro
    // tapam a sala. A fila fica no meio, que é onde ela cabe e onde se vê.
    const dy = c.dy0 + 2.6;
    const larg = 0.75;
    return {
      x: n1(sx(x, eixo(dy)) - (larg * k) / 2),
      y: n1(sy(x, c.z0 + 2.1)),
      w: n1(larg * k),
      h: n1(2.1 * k),
      lx: n1(sx(x, eixo(dy)) - (larg * k) / 2 + larg * k * 0.18),
      lw: n1(larg * k * 0.64),
      leds: Array.from({ length: 6 }, (_, j) => n1(sy(x, c.z0 + 0.35 + j * 0.3)))
    };
  });

  /// Parede de monitores da transmissão: três por três, na parede de fundo da
  /// cabine — de onde quem opera realmente olha para eles.
  const monitoresTv = (() => {
    const c = operacao.transmissao;
    const x = c.x0 + 0.25;
    const k = kd(x);
    const dy = c.dy0 + 2.6;
    return Array.from({ length: 9 }, (_, i) => {
      const col = (i % 3) - 1;
      const lin = Math.floor(i / 3);
      return {
        x: n1(sx(x, eixo(dy + col * 1.2)) - (1.05 * k) / 2),
        y: n1(sy(x, c.z0 + 2.9 - lin * 0.72)),
        w: n1(1.05 * k),
        h: n1(0.62 * k)
      };
    });
  })();

  /// Gente trabalhando dentro das duas salas. Uma sala vazia envidraçada é uma
  /// vitrine; com dois vultos sentados à bancada, ela é o lugar de onde a
  /// transmissão sai. E é a silhueta, de novo, que dá a escala.
  const equipe = [
    { c: operacao.racks, lado: -1, recuo: 1.9, x: 43.4 },
    { c: operacao.transmissao, lado: 1, recuo: 1.9, x: 43.0 },
    { c: operacao.transmissao, lado: 1, recuo: 3.4, x: 43.7 }
  ].map(({ c, lado, recuo, x }) => {
    const k = kd(x);
    // `recuo` conta a partir do vidro para dentro da sala.
    const ydy = (lado < 0 ? c.dy1 : c.dy0) + lado * recuo;
    const z = c.z0 + 0.42;
    return {
      bancada: [
        P(x - 0.7, eixo(ydy - 1.4), z + 0.75),
        P(x - 0.7, eixo(ydy + 1.4), z + 0.75),
        P(x - 0.7, eixo(ydy + 1.4), z + 0.68),
        P(x - 0.7, eixo(ydy - 1.4), z + 0.68)
      ].join(' '),
      corpo: [
        P(x, eixo(ydy - 0.42), z),
        P(x, eixo(ydy - 0.26), z + 0.82),
        P(x, eixo(ydy + 0.26), z + 0.82),
        P(x, eixo(ydy + 0.42), z)
      ].join(' '),
      cx: n1(sx(x, eixo(ydy))),
      cy: n1(sy(x, z + 1.0)),
      rx: n1(0.15 * k),
      ry: n1(0.18 * k)
    };
  });

  // ————————————————————— o que existe hoje —————————————————————
  /// Duas caixas de mercado sobre tripé e uma tela de 5,00 × 3,00 m: é com
  /// isso que uma sala deste porte costuma estar operando quando o
  /// levantamento chega.
  const hoje = (() => {
    const kFundo = kd(0.4);
    return {
      tela: {
        x: n1(sx(0.4, eixo(-2.5))),
        y: n1(sy(0.4, palco.nivel + 5.2)),
        w: n1(5 * kFundo),
        h: n1(3 * kFundo)
      },
      caixas: [-10, 10].map((dy) => {
        const x = palco.x1;
        const k = kd(x);
        const cx = sx(x, eixo(dy));
        const abre = 0.5 * k;
        return {
          x: n1(cx - (0.45 * k) / 2),
          y: n1(sy(x, 2.9)),
          w: n1(0.45 * k),
          h: n1(0.75 * k),
          tripe: `M${n1(cx)} ${n1(sy(x, 2.15))} V${n1(sy(x, 0))} M${n1(cx)} ${n1(sy(x, 0))} L${n1(cx - abre)} ${n1(sy(x, 0) + abre * 0.5)} M${n1(cx)} ${n1(sy(x, 0))} L${n1(cx + abre)} ${n1(sy(x, 0) + abre * 0.5)}`
        };
      }),
      /// Luminárias de trabalho: luz fria, chapada, sem direção nenhuma.
      luminarias: [3, 8, 14, 22].flatMap((x) =>
        [-24, -8, 8, 24].map((dy) => {
          const k = kd(x);
          return {
            x: n1(sx(x, eixo(dy - 1.6))),
            y: n1(sy(x, teto(x) - 0.5)),
            w: n1(3.2 * k),
            h: n1(0.25 * k)
          };
        })
      ),
      /// Alvenaria pintada: nada absorve nada, e a junta é tudo que se vê.
      juntas: `M0 300 L${F_E} 400 M0 520 L${F_E} 480 M0 760 L${F_E} 560 M1600 300 L${F_D} 400 M1600 520 L${F_D} 480 M1600 760 L${F_D} 560`
    };
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
        <linearGradient id="ad-ripado-e" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#4a3524" />
          <stop offset="1" stop-color="#241a12" />
        </linearGradient>
        <linearGradient id="ad-ripado-d" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stop-color="#4a3524" />
          <stop offset="1" stop-color="#241a12" />
        </linearGradient>
        <linearGradient id="ad-led" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#12395c" />
          <stop offset="0.42" stop-color="#3d9ec9" />
          <stop offset="0.62" stop-color="#8fd3e8" />
          <stop offset="1" stop-color="#0e2c40" />
        </linearGradient>
        <!-- O painel é a fonte de luz da sala. Um retângulo chapado não
             ilumina nada: o brilho tem de vazar para fora dele, e o vazamento
             é largo e baixo, não uma bola. -->
        <radialGradient id="ad-brilho" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#bfe6f5" stop-opacity="0.3" />
          <stop offset="0.45" stop-color="#7fc4de" stop-opacity="0.12" />
          <stop offset="1" stop-color="#7fc4de" stop-opacity="0" />
        </radialGradient>
        <!-- Fumaça: sem ela o feixe de um refletor não existe para a câmera. -->
        <radialGradient id="ad-fumaca" cx="0.5" cy="0.42" r="0.58">
          <stop offset="0" stop-color="#cbb08a" stop-opacity="0.16" />
          <stop offset="1" stop-color="#cbb08a" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="ad-frio" cx="0.5" cy="0.2" r="0.75">
          <stop offset="0" stop-color="#cfe3ea" stop-opacity="0.24" />
          <stop offset="1" stop-color="#cfe3ea" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="ad-feixe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffcf8a" stop-opacity="0.34" />
          <stop offset="0.6" stop-color="#ffcf8a" stop-opacity="0.12" />
          <stop offset="1" stop-color="#ffcf8a" stop-opacity="0" />
        </linearGradient>
        <!-- Chave quente sobre o palco: o feixe atravessa o ar, mas quem
             acende a pessoa é a luz que chega nela. -->
        <radialGradient id="ad-chave" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stop-color="#ffd9a0" stop-opacity="0.22" />
          <stop offset="1" stop-color="#ffd9a0" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="ad-vidro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1b242b" stop-opacity="0.92" />
          <stop offset="1" stop-color="#070a0c" stop-opacity="0.96" />
        </linearGradient>

        <!-- Vinheta: nenhuma foto de interior tem os cantos tão claros quanto
             o centro, e sem isto o desenho denuncia que é desenho. -->
        <radialGradient id="ad-vinheta" cx="0.5" cy="0.48" r="0.78">
          <stop offset="0.55" stop-color="#000" stop-opacity="0" />
          <stop offset="1" stop-color="#000" stop-opacity="0.42" />
        </radialGradient>

        <linearGradient id="ad-banco" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#4a3b2c" />
          <stop offset="0.3" stop-color="#241c15" />
          <stop offset="1" stop-color="#12100c" />
        </linearGradient>
        <linearGradient id="ad-banco-claro" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8e8375" />
          <stop offset="0.3" stop-color="#6a6155" />
          <stop offset="1" stop-color="#4c463d" />
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
          <stop offset="0" stop-color="#2b7fa8" stop-opacity="0.3" />
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
        <clipPath id="ad-racks" clipPathUnits="userSpaceOnUse">
          <polygon points={salaRacks.vidro} />
        </clipPath>
        <clipPath id="ad-tv" clipPathUnits="userSpaceOnUse">
          <polygon points={salaTv.vidro} />
        </clipPath>
      </defs>

      {#snippet poltronas(claro)}
        <g>
          {#each fileiras as fila}
            {#each fila.blocos as b}
              <polygon points={b.corpo} fill={claro ? 'url(#ad-banco-claro)' : 'url(#ad-banco)'} />
              <path d={b.sombra} stroke="#000" stroke-width="2" fill="none" opacity="0.45" />
              <path
                d={b.crista}
                stroke={claro ? '#cdc3b2' : '#8a7358'}
                stroke-width="1.2"
                fill="none"
                opacity="0.5"
              />
            {/each}
            {#if fila.encaixes}
              <path
                d={fila.encaixes}
                stroke={claro ? '#3b352d' : '#090705'}
                stroke-width="1.1"
                fill="none"
                opacity="0.55"
              />
            {/if}
          {/each}
        </g>
      {/snippet}

      <g clip-path="url(#ad-sala)">
        <!-- ————— ANTES ————— -->
        {#if antes}
          <image href={antes} x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice" />
        {:else}
          <g>
            <rect width="1600" height="900" fill="#a7aaab" />
            <polygon points={pTeto} fill="url(#ad-teto)" />
            <polygon points={pParedeE} fill="url(#ad-pared-e)" />
            <polygon points={pParedeD} fill="url(#ad-pared-d)" />
            <rect x={F_E} y={F_TETO} width={F_D - F_E} height={F_PISO - F_TETO} fill="#a29c92" />
            <polygon points={pPiso} fill="url(#ad-piso)" />

            <!-- Forro de PVC: as emendas entregam o material. -->
            <g stroke="#7e8588" stroke-width="1.6" opacity="0.8" fill="none">
              {#each raiosTeto as l}
                <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
              {/each}
              {#each juntasTeto as j}
                <line x1={j.x1} y1={j.y} x2={j.x2} y2={j.y} opacity="0.55" />
              {/each}
            </g>

            <g fill="#eef6f8" opacity="0.9">
              {#each hoje.luminarias as u}
                <rect x={u.x} y={u.y} width={u.w} height={u.h} />
              {/each}
            </g>
            <rect width="1600" height="900" fill="url(#ad-frio)" />

            <path d={hoje.juntas} stroke="#7c766d" stroke-width="1.2" opacity="0.35" fill="none" />

            <!-- Tela pequena e lavada pela luz de trabalho. -->
            <rect x={hoje.tela.x} y={hoje.tela.y} width={hoje.tela.w} height={hoje.tela.h} fill="#cdd2d4" />
            <rect
              x={hoje.tela.x} y={hoje.tela.y} width={hoje.tela.w} height={hoje.tela.h}
              fill="none" stroke="#6a7074" stroke-width="2"
            />

            <!-- Palco raso, sem acabamento. -->
            <polygon points={deck} fill="#6f6558" />
            <polygon points={deckFrente} fill="#4d463c" />

            <!-- Duas caixas de mercado sobre tripé, apontando para o nada. -->
            {#each hoje.caixas as c}
              <rect x={c.x} y={c.y} width={c.w} height={c.h} fill="#2f3134" stroke="#5a5f63" stroke-width="1.5" />
              <path d={c.tripe} stroke="#5a5f63" stroke-width="2" fill="none" />
            {/each}

            <g fill="#4b4640">
              {#each banda.gente as g}
                <polygon points={g.corpo} />
                <ellipse cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} />
              {/each}
            </g>

            {@render poltronas(true)}

            <!-- A operação de hoje: uma mesa dobrável no mesmo lugar da futura
                 ilha, com um mixer de doze canais em cima. -->
            <polygon points={mesa.dobravel} fill="#8d8577" stroke="#5f594e" stroke-width="1.5" />
            <rect x={mesa.mixer.x} y={mesa.mixer.y} width={mesa.mixer.w} height={mesa.mixer.h} fill="#3a3d40" />
            <path d={mesa.pernas} stroke="#5f594e" stroke-width="3" fill="none" />

            <polygon points={pParedeE} fill="url(#ad-ao-e)" opacity="0.4" />
            <polygon points={pParedeD} fill="url(#ad-ao-d)" opacity="0.4" />
            <polygon points={pTeto} fill="url(#ad-ao-teto)" opacity="0.3" />
          </g>
        {/if}

        <!-- ————— DEPOIS ————— -->
        <g clip-path="url(#ad-costura)">
          {#if depois}
            <image href={depois} x="0" y="0" width="1600" height="900" preserveAspectRatio="xMidYMid slice" />
          {:else}
            <g>
              <rect width="1600" height="900" fill="#08090a" />
              <polygon points={pTeto} fill="url(#ad-teto-d)" />
              <polygon points={pParedeE} fill="url(#ad-ripado-e)" />
              <polygon points={pParedeD} fill="url(#ad-ripado-d)" />
              <rect x={F_E} y={F_TETO} width={F_D - F_E} height={F_PISO - F_TETO} fill="#0f1113" />
              <polygon points={pPiso} fill="url(#ad-piso-d)" />

              <!-- Forro absorvente em plano inclinado: módulos, não emendas. -->
              <g stroke="#2c3237" stroke-width="2" opacity="0.85" fill="none">
                {#each juntasTeto as j}
                  <line x1={j.x1} y1={j.y} x2={j.x2} y2={j.y} />
                {/each}
              </g>
              <g stroke="#20262b" stroke-width="1.4" opacity="0.7" fill="none">
                {#each raiosTeto as l}
                  <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
                {/each}
              </g>

              <!-- Ripado de difusão nas laterais: a régua é o material. -->
              <g stroke="#6a4c33" stroke-width="2" opacity="0.5" fill="none">
                {#each ripas as v}
                  <line x1={v.x} y1={v.y1} x2={v.x} y2={v.y2} />
                {/each}
              </g>

              <!-- Painel absorvedor no fundo, dos dois lados do palco. -->
              <g fill="#15181b" opacity="0.9">
                {#each painelFundo as p}
                  <rect x={p.x} y={F_TETO} width={p.w} height={F_PISO - F_TETO} />
                {/each}
              </g>

              <!-- Painel de LED: a fonte de luz da sala agora é a imagem. -->
              <ellipse cx={led.cx} cy={led.cy} rx={led.w * 2.4} ry={led.h * 4.2} fill="url(#ad-brilho)" />
              <rect x={led.x} y={led.y} width={led.w} height={led.h} fill="url(#ad-led)" />
              <!-- Conteúdo no painel: faixas de imagem. Um painel apagado não
                   é um painel, é uma chapa. -->
              <g opacity="0.34">
                <rect x={led.x + led.w * 0.08} y={led.y + led.h * 0.2} width={led.w * 0.3} height={led.h * 0.5} fill="#eaf7ff" />
                <rect x={led.x + led.w * 0.44} y={led.y + led.h * 0.3} width={led.w * 0.2} height={led.h * 0.34} fill="#cfeaf7" />
                <rect x={led.x + led.w * 0.7} y={led.y + led.h * 0.16} width={led.w * 0.22} height={led.h * 0.6} fill="#dff3fb" />
              </g>
              <rect x={led.x} y={led.y} width={led.w} height={led.h} fill="none" stroke="#050708" stroke-width="3" />
              {#each telasLaterais as t}
                <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="url(#ad-led)" opacity="0.82" />
                <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="none" stroke="#0a0c0e" stroke-width="2" />
              {/each}

              <!-- Estrutura de cobertura, bem acima das treliças de cena. -->
              <g fill="#161a1e">
                {#each estrutura as e}
                  <rect x={e.x1} y={e.y} width={e.largura} height={e.h} />
                {/each}
              </g>

              <!-- Treliças e refletores móveis: os feixes vivem na fumaça. -->
              <rect width="1600" height="900" fill="url(#ad-fumaca)" />
              {#each trelicas as t}
                <g fill="url(#ad-feixe)">
                  {#each t.refletores as ref}
                    <polygon points={ref.feixe} />
                  {/each}
                </g>
                <rect x={t.x1} y={t.y} width={t.largura} height={t.h} fill="#22272c" />
                <g fill="#12161a">
                  {#each t.refletores as ref}
                    <rect x={ref.x} y={ref.y} width={ref.w} height={ref.h} />
                  {/each}
                </g>
              {/each}

              <!-- Palco: piso de madeira, degrau iluminado e retornos. -->
              <polygon points={deck} fill="#20180f" />
              <polygon points={deckFrente} fill="#0f0d0c" />
              <path d={bordaPalco} stroke="#c8823c" stroke-width="2.5" opacity="0.55" fill="none" />
              <polygon points={reflexoPalco} fill="url(#ad-reflexo)" />
              <ellipse
                cx={VPX} cy={sy(banda.x, palco.nivel + 1.1)}
                rx={banda.k * 15} ry={banda.k * 2.4} fill="url(#ad-chave)"
              />
              <polygon points={banda.riser} fill="#171310" />
              <g fill="#050607">
                {#each banda.gente as g}
                  <polygon points={g.corpo} />
                  <ellipse cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} />
                {/each}
              </g>
              <!-- O sistema inteiro, do mais distante ao mais próximo da
                   lente: arranjos, cluster, subgraves voados e de piso,
                   preenchimentos, anéis de delay e retornos de palco, todos
                   vindos da mesma lista de gabinetes das pranchas. -->
              <g stroke="#3f484f" stroke-width="1">
                {#each hastes as h}
                  <path d="M{h.x} {h.y1} V{h.y2}" stroke="#39414b" stroke-width="1.6" fill="none" />
                {/each}
                {#each equipamento as e}
                  <polygon points={e.chanfro} fill="#0c0f12" />
                  <polygon points={e.frente} fill="#1b2126" />
                {/each}
              </g>

              <!-- Banho de cor nas laterais, que é o que faz a sala virar cena. -->
              <polygon points={pParedeE} fill="#7b3f18" opacity="0.14" />
              <polygon points={pParedeD} fill="#7b3f18" opacity="0.14" />

              {@render poltronas(false)}

              <!-- Sala de racks e cabine de transmissão, ladeando a mesa.
                   Cada uma é montada de dentro para fora: estrado, parede de
                   fundo, o que há dentro, o vidro, e só então a parede de trás
                   e a laje, que são o que fecha a caixa para quem olha. -->
              <polygon points={salaRacks.estrado} fill="#090b0d" />
              <polygon points={salaTv.estrado} fill="#090b0d" />
              <polygon points={salaRacks.fundo} fill="#0d1114" />
              <polygon points={salaTv.fundo} fill="#0d1114" />
              <g clip-path="url(#ad-racks)">
                {#each racks as rk}
                  <rect x={rk.x} y={rk.y} width={rk.w} height={rk.h} fill="#101418" stroke="#2b333a" stroke-width="1" />
                  {#each rk.leds as ly}
                    <rect x={rk.lx} y={ly} width={rk.lw} height="2" fill="#3fb0d8" opacity="0.7" />
                  {/each}
                {/each}
              </g>
              <g clip-path="url(#ad-tv)">
                {#each monitoresTv as m}
                  <rect x={m.x} y={m.y} width={m.w} height={m.h} fill="#1d5f80" opacity="0.5" />
                  <rect x={m.x} y={m.y} width={m.w} height={m.h} fill="none" stroke="#0a0f13" stroke-width="1.5" />
                {/each}
              </g>
              {#each equipe as p}
                <polygon points={p.bancada} fill="#121619" />
                <polygon points={p.corpo} fill="#07090a" />
                <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill="#07090a" />
              {/each}
              <polygon points={salaRacks.vidro} fill="url(#ad-vidro)" opacity="0.55" />
              <polygon points={salaTv.vidro} fill="url(#ad-vidro)" opacity="0.55" />
              <polygon points={salaRacks.parapeito} fill="#0c0f12" />
              <polygon points={salaTv.parapeito} fill="#0c0f12" />
              <g fill="none" stroke="#39424a" stroke-width="1.5">
                {#each [...salaRacks.montantes, ...salaTv.montantes] as m}
                  <path d={m} />
                {/each}
              </g>
              <g fill="none" stroke="#4c565e" stroke-width="2">
                <polygon points={salaRacks.vidro} />
                <polygon points={salaTv.vidro} />
              </g>
              <polygon points={salaRacks.traseira} fill="#0a0d0f" stroke="#2b3238" stroke-width="1.5" />
              <polygon points={salaTv.traseira} fill="#0a0d0f" stroke="#2b3238" stroke-width="1.5" />
              <polygon points={salaRacks.laje} fill="#15191d" stroke="#2b3238" stroke-width="1.5" />
              <polygon points={salaTv.laje} fill="#15191d" stroke="#2b3238" stroke-width="1.5" />

              <!-- A ilha de operação, no mesmo ponto da mesa dobrável de hoje. -->
              <polygon points={mesa.frente} fill="#0b0d0f" />
              <polygon points={mesa.tampo} fill="#15191c" />
              {#each mesa.telas as t}
                <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="#2a6f8f" opacity="0.9" />
                <rect x={t.x} y={t.y} width={t.w} height={t.h} fill="none" stroke="#080b0d" stroke-width="2" />
              {/each}
              {#each mesa.gente as g}
                <polygon points={g.ombro} fill="#07090a" />
                <ellipse cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fill="#07090a" />
              {/each}

              <polygon points={pParedeE} fill="url(#ad-ao-e)" />
              <polygon points={pParedeD} fill="url(#ad-ao-d)" />
            </g>
          {/if}
        </g>

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

    <span class="marca marca-antes" style="opacity:{opAntes}">{r.antes}</span>
    <span class="marca marca-depois" style="opacity:{opDepois}">{r.depois}</span>

    <div class="pega" style="left:{pega}%">
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
    /* O controle cobre meia tela de altura. Sem isto, no celular o dedo que
       tenta rolar a página em cima do comparador mexe a divisa e não rola
       nada — a pessoa fica presa na figura. `pan-y` devolve o gesto vertical
       ao navegador e guarda só o horizontal para a divisa. */
    touch-action: pan-y;
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
