/// Geometria e resultados do templo usado como estudo de caso.
///
/// Este módulo é a **única** fonte dos números que aparecem na home. Os
/// destaques de `conteudo/pt.js` e `conteudo/en.js` são importados daqui — se
/// a geometria mudar, o texto muda junto e nenhum número da página briga com
/// outro.
///
/// Convenção: X é a profundidade (palco à esquerda), Y é a largura, Z é a
/// altura. Tudo em metros. A plateia é um leque de arcos concêntricos com foco
/// sobre o palco, que é como salas deste porte realmente se organizam.

export const obra = {
  nome: 'Templo — auditório principal',
  cliente: 'Estudo de caso',
  prancha: 'AC-01',
  revisao: '04',
  data: '2026-08',
  escalaPlanta: '1:500',
  escalaCorte: '1:400',
  responsavel: 'Garioli Labs · engenharia acústica',
  disciplina: 'Acústica · sonorização · imagem · luz'
};

/// Envoltória e os números que saem do memorial de cálculo.
export const sala = {
  profundidade: 70.0,
  largura: 92.0,
  parede: 0.4,
  area: 6440, // 70,00 × 92,00
  alturaProscenio: 20.0,
  alturaFundo: 14.0,
  alturaMedia: 17.0,
  volume: 109500, // 6 440 × 17,00
  t30Alvo: 1.8,
  ruidoFundo: 'NC 30'
};

/// Foco do leque — o ponto de onde partem os raios das fileiras.
export const foco = { x: 8.0, y: sala.largura / 2 };

/// Palco de 32,00 × 14,00 m, elevado 1,20 m. `x1` é a linha do proscênio.
export const palco = {
  x0: 4.0,
  x1: 18.0,
  largura: 32.0,
  nivel: 1.2,
  ledLargura: 18.0,
  ledAltura: 5.0,
  /// Retornos de palco. Entram na conta do projeto porque quem toca precisa
  /// ouvir a si mesmo sem que o palco vire uma segunda fonte para a plateia.
  monitores: 6,
  /// Telas laterais de imagem ampliada. O painel central de 18,00 m atende o
  /// eixo; as poltronas do extremo do leque veem estas.
  telaLateral: { largura: 6.0, altura: 3.4, dy: 13.5, z: 4.0 }
};

/// Plateia térrea: 32 arcos de raio 15,00 a 46,00 m, cinco blocos separados
/// por quatro corredores radiais.
export const plateia = {
  raioInicial: 15.0,
  passo: 1.0,
  fileiras: 32,
  aberturaGraus: 60,
  corredores: 4,
  corredorLargura: 1.3,
  passoPoltrona: 0.55,
  nivelFrente: 0.0,
  rake: 0.11, // ganho de nível por fileira
  // Nenhuma poltrona pode ficar a montante da boca de cena: quem senta ali não
  // vê o palco. A abertura das primeiras fileiras é limitada por esta linha, e
  // por isso o leque abre progressivamente até os 60° de projeto.
  limitePalco: 18.5
};

/// Mezanino: 12 arcos sobre a circulação traseira, com rake bem mais forte.
export const mezanino = {
  raioInicial: 47.0,
  passo: 1.0,
  fileiras: 12,
  aberturaGraus: 48,
  corredores: 4,
  corredorLargura: 1.3,
  passoPoltrona: 0.55,
  nivelFrente: 7.0,
  rake: 0.4,
  limitePalco: 18.5
};

/// Cabine de operação, no eixo, a 0,6 da maior distância — posição de mixagem.
export const foh = { raio: 40.0, largura: 9.0, profundidade: 4.5 };

/// Ilha de operação. A mesa de som fica no eixo, a 0,6 da maior distância; a
/// cabine de transmissão e a sala de racks ficam ao lado dela, e não numa sala
/// distante — quem opera imagem, som e luz precisa se ver e se ouvir. As duas
/// são caixas envidraçadas sobre um estrado, com pé-direito próprio.
///
/// O estrado nasce a 3,00 m porque o piso da plateia sobe: a 41,50 m ele está
/// a 2,03 m e a 47,00 m já está a 2,64 m. Uma cota fixa abaixo disso deixaria
/// a cabine enterrada no fundo e flutuando na frente.
export const operacao = {
  transmissao: { x0: 41.5, x1: 47.0, dy0: 7.5, dy1: 13.5, z0: 3.0, z1: 6.2, telas: 9 },
  racks: { x0: 41.5, x1: 47.0, dy0: -13.5, dy1: -7.5, z0: 3.0, z1: 6.2, unidades: 8 }
};

const rad = (g) => (g * Math.PI) / 180;

/// Blocos de poltronas de um arco. Os cinco blocos recebem o mesmo número de
/// lugares, o que mantém os corredores alinhados de uma fileira à outra. Cada
/// bloco devolve o ângulo da borda de fora da primeira e da última poltrona —
/// é o que permite desenhar o bloco como um único arco tracejado, com uma
/// lacuna por poltrona, em vez de cinco mil retângulos.
function blocosDe(raio, cfg, abertura) {
  const passoAng = cfg.passoPoltrona / raio;
  const corredorAng = cfg.corredorLargura / raio;
  const util = 2 * abertura - cfg.corredores * corredorAng;
  const porBloco = util / (cfg.corredores + 1);
  const n = Math.floor(porBloco / passoAng);
  const sobra = porBloco - n * passoAng;

  const saida = [];
  let base = -abertura;
  for (let b = 0; b <= cfg.corredores; b++) {
    const a0 = base + sobra / 2;
    saida.push({ a0, a1: a0 + n * passoAng, n, passoAng });
    base += porBloco + corredorAng;
  }
  return saida;
}

/// Ângulo do centro de cada poltrona de um bloco.
export function assentosDoBloco(bloco) {
  const saida = [];
  for (let i = 0; i < bloco.n; i++) saida.push(bloco.a0 + (i + 0.5) * bloco.passoAng);
  return saida;
}

/// Abertura de uma fileira: a de projeto, salvo quando a boca de cena a fecha.
function aberturaDaFileira(cfg, raio) {
  const projeto = rad(cfg.aberturaGraus);
  if (!cfg.limitePalco) return projeto;
  const corte = (cfg.limitePalco - foco.x) / raio;
  if (corte <= 0) return projeto;
  if (corte >= 1) return 0;
  return Math.min(projeto, Math.acos(corte));
}

/// Uma fileira: raio, nível, blocos e o ângulo de cada poltrona.
function montaFileiras(cfg) {
  const saida = [];
  for (let i = 0; i < cfg.fileiras; i++) {
    const raio = cfg.raioInicial + i * cfg.passo;
    const abertura = aberturaDaFileira(cfg, raio);
    const blocos = blocosDe(raio, cfg, abertura);
    saida.push({
      indice: i + 1,
      raio,
      nivel: Number((cfg.nivelFrente + i * cfg.rake).toFixed(2)),
      abertura,
      blocos,
      angulos: blocos.flatMap(assentosDoBloco)
    });
  }
  return saida;
}

export const fileirasPlateia = montaFileiras(plateia);
export const fileirasMezanino = montaFileiras(mezanino);

const soma = (fs) => fs.reduce((a, f) => a + f.angulos.length, 0);

export const lugares = {
  plateia: soma(fileirasPlateia),
  mezanino: soma(fileirasMezanino)
};
lugares.total = lugares.plateia + lugares.mezanino;

/// Converte polar (raio, ângulo) para o plano da planta.
export function polar(raio, ang) {
  return { x: foco.x + raio * Math.cos(ang), y: foco.y + raio * Math.sin(ang) };
}

/// Sistema principal, delays e subgraves — a **intenção de projeto**: onde
/// cada conjunto está pendurado e com quantas caixas. A geometria caixa a
/// caixa sai daqui em `gabinetes`, e a acústica sai de `gabinetes`. Os três
/// níveis existem para que nenhum desenho invente a sua própria versão do
/// sistema: planta, corte, axonometria, modelo e a vista interna da home
/// percorrem a mesma lista.
///
/// `sens` é o nível a 1,00 m em serviço, `abertura` é o ângulo em que a
/// resposta cai 6 dB, e `mira` é o alvo geométrico — os números que a
/// simulação de cobertura consome.
export const fontes = {
  /// `abertura` é a cobertura **horizontal** do elemento, e 90° é o que um
  /// guia de onda de arranjo entrega de verdade. Com 50°, como estava, o mapa
  /// mostrava um sulco entre o alcance do cluster e o dos arranjos: buraco de
  /// planilha, não de sala.
  principais: [
    { rotulo: 'L', x: 19.5, y: foco.y - 13.0, altura: 14.0, caixas: 16, abertura: 90 },
    { rotulo: 'R', x: 19.5, y: foco.y + 13.0, altura: 14.0, caixas: 16, abertura: 90 }
  ],
  /// Arranjo central. Também é um arranjo, e não uma caixa: os arranjos L/R
  /// miram cada um o seu lado do leque, então quem cobre a faixa do eixo — do
  /// centro da primeira fileira ao centro da última do mezanino — é este.
  centro: {
    rotulo: 'C', x: 19.5, y: foco.y, altura: 13.0, caixas: 8, abertura: 90,
    caixasPorSecao: 2,
    secoes: [
      { alvo: 24, sens: 104.0, aberturaV: 22 },
      { alvo: 32, sens: 108.5, aberturaV: 16 },
      { alvo: 44, sens: 109.0, aberturaV: 12 },
      { alvo: 60, sens: 111.5, aberturaV: 10 }
    ]
  },
  delays: [
    { rotulo: 'D1', raio: 32.0, altura: 10.5, atraso: 36, sens: 107.0, abertura: 55, aberturaV: 35, caixas: 5 },
    /// O segundo anel pende sobre o mezanino, cujo piso sobe até 11,40 m: a
    /// 12,00 m ele ficava **abaixo** da orelha da última fileira, mirando para
    /// baixo e para trás de quem deveria ouvi-lo. Sobe para 15,00 m, com
    /// 0,85 m de folga sob o forro de 15,85 m naquela profundidade.
    { rotulo: 'D2', raio: 46.0, altura: 15.0, atraso: 78, sens: 106.0, abertura: 55, aberturaV: 35, caixas: 5 }
  ],
  subs: { rotulo: 'SUB', x: 18.6, altura: 0, caixas: 12 },
  /// Subgraves voados, **empilhados**: uma coluna vertical no eixo, atrás do
  /// cluster central, e não uma fileira horizontal. É assim que se pendura
  /// grave — a coluna é o que produz o padrão cardioide no plano vertical, com
  /// as duas caixas do meio invertidas para cancelar o que iria para o palco.
  /// Espalhá-los lado a lado daria interferência entre eles e nenhum controle
  /// de direção.
  subsVoados: {
    rotulo: 'SUB·V', x: 20.6, base: 15.0, caixas: 6, invertidas: [2, 3], cardioide: true
  },
  /// Ângulos em que cada anel de delay é pendurado, no plano da planta.
  angulosDelay: [-0.8, -0.4, 0, 0.4, 0.8]
};

/// Altura do ouvido de quem está sentado na profundidade `x`.
export function nivelOuvidoEm(x) {
  const piso =
    x >= foco.x + mezanino.raioInicial
      ? mezanino.nivelFrente + (x - (foco.x + mezanino.raioInicial)) * mezanino.rake
      : Math.max(0, (x - (foco.x + plateia.raioInicial)) * plateia.rake);
  return piso + 1.2;
}

/// Um arranjo não é um alto-falante: as dezesseis caixas se dividem em quatro
/// seções com mira própria — a de baixo cobre as primeiras fileiras, a de cima
/// alcança o mezanino. É essa divisão, e não potência, que sustenta pouca
/// variação de nível ao longo de quarenta e seis metros.
/// Os ganhos não são escolhidos no olho: saem de um ajuste que percorre as
/// 5 065 poltronas e procura o conjunto que fecha a menor dispersão, com a
/// restrição de que a seção que atende mais longe nunca seja acionada mais
/// baixo que a que atende mais perto — shading monotônico, que é o que se
/// pendura de verdade.
const secoesArranjo = [
  // Os alvos são profundidades da plateia, que começa em x = 23,00 m: mirar
  // antes disso é apontar a caixa para o vão entre a boca de cena e a primeira
  // fileira, onde não há ninguém.
  { alvo: 24, sens: 97.0, aberturaV: 20 },
  { alvo: 27, sens: 101.5, aberturaV: 18 },
  { alvo: 31, sens: 107.0, aberturaV: 16 },
  { alvo: 36, sens: 108.0, aberturaV: 14 },
  { alvo: 42, sens: 108.0, aberturaV: 12 },
  { alvo: 49, sens: 108.0, aberturaV: 11 },
  { alvo: 57, sens: 108.0, aberturaV: 10 },
  { alvo: 64, sens: 114.0, aberturaV: 9 }
];

/// Reforços que toda sala deste porte tem e que quase nunca aparecem no
/// desenho: preenchimento de primeira fila e cobertura das poltronas extremas.
export const reforcos = {
  frontFill: { x: 18.4, z: 1.9, caixas: 12, sens: 96.5, abertura: 90, aberturaV: 45 },
  /// As poltronas do extremo do leque não são vistas por nenhum arranjo
  /// principal. Quem as cobre é um pequeno arranjo por lado — três caixas
  /// empilhadas, com mira própria em cada uma —, e não uma caixa só: uma caixa
  /// única atendendo trinta metros de fatia é a definição de campo desigual,
  /// escaldante embaixo dela e insuficiente no fim.
  outFill: {
    x: 18.0, dy: 17.0, base: 10.4, abertura: 55, caixasPorSecao: 2,
    secoes: [
      { alvoRaio: 18, alvoGraus: 58, sens: 103.5, aberturaV: 22 },
      { alvoRaio: 26, alvoGraus: 57, sens: 105.5, aberturaV: 17 },
      { alvoRaio: 35, alvoGraus: 57, sens: 105.5, aberturaV: 13 },
      { alvoRaio: 46, alvoGraus: 57, sens: 109.0, aberturaV: 10 }
    ]
  }
};

// ————————————————————— o rack de gabinetes —————————————————————

/// Tamanho real de cada tipo de gabinete, em metros. Uma caixa desenhada sem
/// tamanho é um retângulo qualquer, e foi por isso que o mesmo arranjo já
/// apareceu curto na planta e comprido no corte.
export const gabinete = {
  arranjo: { larg: 1.15, prof: 0.55, alt: 0.32 },
  cluster: { larg: 0.9, prof: 0.5, alt: 0.3 },
  sub: { larg: 1.2, prof: 0.85, alt: 0.6 },
  fill: { larg: 0.34, prof: 0.3, alt: 0.3 },
  delay: { larg: 0.6, prof: 0.5, alt: 0.62 },
  monitor: { larg: 0.62, prof: 0.45, alt: 0.42 }
};

const grau = 180 / Math.PI;

/// Inclinação de uma caixa: o ângulo, em graus abaixo da horizontal, entre o
/// centro do gabinete e o alvo que ele atende. Não é decoração — é o que faz o
/// arranjo parecer um arranjo em todos os desenhos, e sai da mesma mira que a
/// simulação usa.
const tombo = (x, z, alvoX, alvoZ) => Number((Math.atan2(z - alvoZ, alvoX - x) * grau).toFixed(1));

/// Todos os gabinetes da sala, cada um com centro, tamanho e o grupo a que
/// pertence. **Esta é a lista que todo desenho percorre.**
export const gabinetes = [
  // Arranjos principais: as caixas sobem a partir de `altura`, e cada quarto
  // do arranjo atende uma seção — a de cima, a mais distante.
  ...fontes.principais.flatMap((f) =>
    Array.from({ length: f.caixas }, (_, i) => {
      const g = gabinete.arranjo;
      const sec = secoesArranjo[Math.floor(i / (f.caixas / secoesArranjo.length))];
      const z = f.altura + (i + 0.5) * g.alt;
      return {
        grupo: f.rotulo,
        tipo: 'arranjo',
        rotulo: `${f.rotulo}${i + 1}`,
        x: f.x,
        y: f.y,
        z,
        ...g,
        inclinacao: tombo(f.x, z, sec.alvo, nivelOuvidoEm(sec.alvo))
      };
    })
  ),
  // Cluster central: coluna única sobre o eixo, mirando as primeiras fileiras.
  ...Array.from({ length: fontes.centro.caixas }, (_, i) => {
    const c = fontes.centro;
    const g = gabinete.cluster;
    const sec = c.secoes[Math.floor(i / c.caixasPorSecao)];
    const z = c.altura + (i + 0.5) * g.alt;
    return {
      grupo: 'C',
      tipo: 'cluster',
      rotulo: `C${i + 1}`,
      x: c.x,
      y: c.y,
      z,
      ...g,
      inclinacao: tombo(c.x, z, sec.alvo, nivelOuvidoEm(sec.alvo))
    };
  }),
  // Subgraves de piso, em linha à frente do palco.
  ...Array.from({ length: fontes.subs.caixas }, (_, i) => {
    const g = gabinete.sub;
    const passo = palco.largura / fontes.subs.caixas;
    return {
      grupo: 'SUB',
      tipo: 'sub',
      rotulo: `SUB${i + 1}`,
      x: fontes.subs.x,
      y: foco.y - palco.largura / 2 + (i + 0.5) * passo,
      z: g.alt / 2,
      ...g,
      inclinacao: 0
    };
  }),
  // Subgraves voados: coluna empilhada, duas caixas invertidas no meio.
  ...Array.from({ length: fontes.subsVoados.caixas }, (_, i) => {
    const s = fontes.subsVoados;
    const g = gabinete.sub;
    return {
      grupo: 'SUB·V',
      tipo: 'sub',
      rotulo: `SV${i + 1}`,
      x: s.x,
      y: foco.y,
      z: s.base + (i + 0.5) * g.alt,
      ...g,
      invertida: s.invertidas.includes(i),
      // A caixa invertida é a caixa virada de costas: é isso, e não um ajuste
      // de processador, que faz o cardioide.
      giro: s.invertidas.includes(i) ? 180 : 0,
      inclinacao: 0
    };
  }),
  // Preenchimento de primeira fila, embutido na boca do palco.
  ...Array.from({ length: reforcos.frontFill.caixas }, (_, i) => {
    const ff = reforcos.frontFill;
    const g = gabinete.fill;
    const aMax = Math.atan(palco.largura / 2 / (ff.x - foco.x));
    const ang = -aMax + (i / (ff.caixas - 1)) * 2 * aMax;
    return {
      grupo: 'FF',
      tipo: 'fill',
      rotulo: `FF${i + 1}`,
      x: ff.x,
      y: foco.y + (ff.x - foco.x) * Math.tan(ang),
      z: ff.z,
      ...g,
      giro: Number((ang * grau).toFixed(1)),
      inclinacao: 12
    };
  }),
  // Preenchimento das poltronas extremas: uma coluna de três por lado.
  ...[-1, 1].flatMap((lado) => {
    const of = reforcos.outFill;
    const g = gabinete.arranjo;
    const grupo = lado < 0 ? 'OF·L' : 'OF·R';
    const n = of.secoes.length * of.caixasPorSecao;
    return Array.from({ length: n }, (_, i) => {
      const sec = of.secoes[Math.floor(i / of.caixasPorSecao)];
      const z = of.base + (i + 0.5) * g.alt;
      const alvo = polar(sec.alvoRaio, (lado * sec.alvoGraus) / grau);
      return {
        grupo,
        tipo: 'arranjo',
        rotulo: `${grupo}${i + 1}`,
        x: of.x,
        y: foco.y + lado * of.dy,
        z,
        ...g,
        giro: Number((lado * 38).toFixed(1)),
        inclinacao: tombo(of.x, z, alvo.x, nivelOuvidoEm(alvo.x))
      };
    });
  }),
  // Anéis de delay.
  ...fontes.delays.flatMap((d) =>
    fontes.angulosDelay.map((a, i) => {
      const g = gabinete.delay;
      const p = polar(d.raio, a);
      const q = polar(d.raio + 11, a);
      return {
        grupo: d.rotulo,
        tipo: 'delay',
        rotulo: `${d.rotulo}.${i + 1}`,
        x: p.x,
        y: p.y,
        z: d.altura,
        ...g,
        giro: Number((a * grau).toFixed(1)),
        inclinacao: tombo(p.x, d.altura, q.x, nivelOuvidoEm(q.x))
      };
    })
  ),
  // Retornos de palco, virados para quem toca.
  ...Array.from({ length: palco.monitores }, (_, i) => {
    const g = gabinete.monitor;
    return {
      grupo: 'MON',
      tipo: 'monitor',
      rotulo: `M${i + 1}`,
      x: 13.5,
      y: foco.y + (i - (palco.monitores - 1) / 2) * 4.4,
      z: palco.nivel + g.alt / 2,
      ...g,
      inclinacao: -35
    };
  })
];

/// Um gabinete pelo rótulo — para o desenho que precisa cotar uma caixa
/// específica sem recalcular onde ela está.
export const gabinetesDe = (grupo) => gabinetes.filter((g) => g.grupo === grupo);

/// Os conjuntos como a planta e o corte os carimbam: um retângulo por grupo,
/// com a contagem, a cota de voo e a extensão que ele ocupa. Sai dos mesmos
/// gabinetes — a planta não pode dizer dezesseis caixas enquanto o corte
/// desenha doze.
export const conjuntos = [...new Set(gabinetes.map((g) => g.grupo))].map((grupo) => {
  const gs = gabinetesDe(grupo);
  const alcance = (f, tam) => {
    const min = Math.min(...gs.map((g) => g[f] - g[tam] / 2));
    const max = Math.max(...gs.map((g) => g[f] + g[tam] / 2));
    return { min, max, meio: (min + max) / 2, tam: max - min };
  };
  return {
    grupo,
    tipo: gs[0].tipo,
    caixas: gs.length,
    x: alcance('x', 'prof'),
    y: alcance('y', 'larg'),
    z: alcance('z', 'alt'),
    /// A cota que a prancha carimba é a base do conjunto, que é o que o
    /// rigger mede: a altura do gancho até a caixa de baixo.
    voo: Number(Math.min(...gs.map((g) => g.z - g.alt / 2)).toFixed(2))
  };
});

/// O conjunto de um grupo, pelo nome.
export const conjunto = (grupo) => conjuntos.find((c) => c.grupo === grupo);

// ————————————————————— as fontes da simulação —————————————————————

/// Centro acústico de um conjunto de gabinetes: é dele que a simulação parte,
/// e ele é a média dos gabinetes desenhados. Enquanto os dois eram digitados
/// separadamente, a caixa do desenho e a fonte do cálculo podiam estar a
/// metros uma da outra sem que nada acusasse.
function centroAcustico(gs) {
  const n = gs.length;
  return {
    x: gs.reduce((a, g) => a + g.x, 0) / n,
    y: gs.reduce((a, g) => a + g.y, 0) / n,
    z: gs.reduce((a, g) => a + g.z, 0) / n
  };
}

/// Cada fonte da simulação, com posição herdada dos gabinetes. Subgraves e
/// retornos não entram: o mapa é a 4 kHz, e nessa banda nem o sub emite nem o
/// retorno aponta para a plateia.
export const caixas = [
  ...fontes.principais.flatMap((f) => {
    const coluna = gabinetesDe(f.rotulo);
    const porSecao = coluna.length / secoesArranjo.length;
    return secoesArranjo.map((sec, i) => {
      const c = centroAcustico(coluna.slice(i * porSecao, (i + 1) * porSecao));
      return {
        rotulo: `${f.rotulo}${i + 1}`,
        grupo: f.rotulo,
        ...c,
        sens: sec.sens,
        abertura: f.abertura,
        aberturaV: sec.aberturaV,
        // Cada arranjo cobre o seu lado do leque, mirando a 30° do eixo.
        // Mirando para dentro, como estava, os dois se somavam no centro e
        // deixavam um vale de seis decibéis na diagonal, que é justamente
        // onde fica um terço das poltronas.
        mira: (() => {
          const p = polar(sec.alvo - foco.x, (Math.sign(f.y - foco.y) * 30) / grau);
          return { x: p.x, y: p.y, z: nivelOuvidoEm(p.x) };
        })()
      };
    });
  }),
  ...(() => {
    const c = fontes.centro;
    const coluna = gabinetesDe('C');
    return c.secoes.map((sec, i) => ({
      rotulo: `C${i + 1}`,
      grupo: 'C',
      ...centroAcustico(coluna.slice(i * c.caixasPorSecao, (i + 1) * c.caixasPorSecao)),
      sens: sec.sens,
      abertura: c.abertura,
      aberturaV: sec.aberturaV,
      mira: { x: sec.alvo, y: c.y, z: nivelOuvidoEm(sec.alvo) }
    }));
  })(),
  // O preenchimento de primeira fila mira em leque, como a plateia: cada caixa
  // atende a fatia que fica na sua frente, inclusive as poltronas que envolvem
  // a boca de cena.
  ...gabinetesDe('FF').map((g, i) => {
    const ff = reforcos.frontFill;
    const ang = g.giro / grau;
    const raio = (ff.x - foco.x) / Math.cos(ang);
    const alvo = polar(raio + 6, ang);
    return {
      rotulo: `FF${i + 1}`,
      grupo: 'FF',
      x: g.x,
      y: g.y,
      z: g.z,
      sens: ff.sens,
      abertura: ff.abertura,
      aberturaV: ff.aberturaV,
      mira: { x: alvo.x, y: alvo.y, z: 1.2 }
    };
  }),
  ...[-1, 1].flatMap((lado) => {
    const of = reforcos.outFill;
    const grupo = lado < 0 ? 'OF·L' : 'OF·R';
    const coluna = gabinetesDe(grupo);
    return of.secoes.map((sec, i) => {
      const c = centroAcustico(
        coluna.slice(i * of.caixasPorSecao, (i + 1) * of.caixasPorSecao)
      );
      const alvo = polar(sec.alvoRaio, (lado * sec.alvoGraus) / grau);
      return {
        rotulo: `${grupo}${i + 1}`,
        grupo,
        ...c,
        sens: sec.sens,
        abertura: of.abertura,
        aberturaV: sec.aberturaV,
        mira: { x: alvo.x, y: alvo.y, z: nivelOuvidoEm(alvo.x) }
      };
    });
  }),
  ...fontes.delays.flatMap((d) =>
    gabinetesDe(d.rotulo).map((g, i) => {
      const q = polar(d.raio + 11, fontes.angulosDelay[i]);
      return {
        rotulo: g.rotulo,
        grupo: d.rotulo,
        x: g.x,
        y: g.y,
        z: g.z,
        sens: d.sens,
        abertura: d.abertura,
        aberturaV: d.aberturaV,
        // O delay aponta para a plateia logo à frente do anel.
        mira: { x: q.x, y: q.y, z: nivelOuvidoEm(q.x) }
      };
    })
  )
];

const ultima = fileirasMezanino.at(-1);
export const maiorDistancia = {
  de: { x: fontes.principais[0].x, z: fontes.principais[0].altura },
  ate: { x: foco.x + ultima.raio, z: ultima.nivel },
  valor: Number(
    Math.hypot(
      foco.x + ultima.raio - fontes.principais[0].x,
      ultima.nivel - fontes.principais[0].altura
    ).toFixed(2)
  )
};

/// Perfil do forro: plano sobre o palco e inclinado dali até o fundo. É esse
/// plano que decide se a última fileira do mezanino cabe embaixo dele.
export function teto(x) {
  if (x <= palco.x1) return sala.alturaProscenio;
  const t = (x - palco.x1) / (sala.profundidade - palco.x1);
  return sala.alturaProscenio - t * (sala.alturaProscenio - sala.alturaFundo);
}

const ultimaMez = fileirasMezanino.at(-1);
const ultimaTerrea = fileirasPlateia.at(-1);

/// Pé-direito livre sobre a última fileira do mezanino e altura livre sob o
/// mezanino — as duas folgas que um balcão erra com facilidade.
sala.peDireitoLivre = Number((teto(foco.x + ultimaMez.raio) - ultimaMez.nivel).toFixed(2));
sala.folgaSobMezanino = Number((mezanino.nivelFrente - ultimaTerrea.nivel).toFixed(2));

/// Materiais tabelados no memorial, com o coeficiente de absorção a 500 Hz.
// O `id` é a chave estável do material: o memorial é emitido em português e
// em inglês, e é por ele que a tradução encontra a linha (nunca pelo nome).
export const materiais = [
  { id: 'concreto', alfa: 0.04, nome: 'Concreto aparente', onde: 'base das paredes · peitoris', area: 1628 },
  { id: 'pisoMadeira', alfa: 0.15, nome: 'Piso em madeira', onde: 'palco · 32,00 × 14,00 m', area: 448 },
  { id: 'ripado', alfa: 0.25, nome: 'Ripado de madeira', onde: 'paredes laterais · difusão', area: 2640 },
  { id: 'forro', alfa: 0.65, nome: 'Forro acústico', onde: 'plano inclinado sobre a plateia', area: 6440 },
  { id: 'plateia', alfa: 0.85, nome: 'Plateia ocupada', onde: `${lugares.total.toLocaleString('pt-BR')} poltronas`, area: 4400 },
  { id: 'painel', alfa: 0.9, nome: 'Painel absorvedor', onde: 'parede de fundo · sob o mezanino', area: 1240 },
  { id: 'circulacao', alfa: 0.03, nome: 'Piso de circulação', onde: 'corredores · foyer interno', area: 1592 }
];

/// Absorção total e T30 **calculados**, não afirmados: se um coeficiente ou uma
/// área mudar acima, o número que a página mostra muda junto.
sala.absorcaoTotal = Math.round(materiais.reduce((a, m) => a + m.alfa * m.area, 0));
sala.t30Calculado = Number(((0.161 * sala.volume) / sala.absorcaoTotal).toFixed(2));

/// As paredes fecham: perímetro × altura média = concreto + ripado + painel.
sala.areaParedes = 2 * (sala.profundidade + sala.largura) * sala.alturaMedia;

/// E a envoltória fecha com a tabela: piso + forro + paredes é exatamente a
/// soma das áreas listadas. Se deixar de fechar, o erro aparece aqui e não
/// numa nota de rodapé.
sala.superficies = materiais.reduce((a, m) => a + m.area, 0);
sala.superficiesGeometricas = 2 * sala.area + sala.areaParedes;
sala.alfaMedio = Number((sala.absorcaoTotal / sala.superficies).toFixed(3));

/// ISO 3382-2 — T30 por banda de oitava, sala nua e depois do tratamento.
export const t30 = {
  bandas: [125, 250, 500, 1000, 2000, 4000],
  antes: [4.6, 4.2, 3.9, 3.7, 3.3, 2.6],
  depois: [2.05, 1.9, 1.8, 1.76, 1.68, 1.45],
  alvo: sala.t30Alvo,
  tolerancia: 0.1
};

/// Altura do ouvido sentado, medida do piso da fileira.
export const alturaOuvido = 1.2;

const grausRad = Math.PI / 180;

/// Queda de nível de uma caixa a `d` metros. Arranjo em campo cilíndrico cai
/// perto de 3 dB por dobra de distância, não 6 — é o que sustenta uma sala
/// deste comprimento com 6 dB de variação.
const quedaDistancia = (d) => 12 * Math.log10(Math.max(d, 1));

/// Tamanho aparente de uma caixa, em metros. Uma fonte não é um ponto: de
/// perto, a boca do guia de onda cobre um ângulo largo, e é por isso que a
/// poltrona colada na caixa de preenchimento ouve som e não silêncio.
const TAMANHO_FONTE = 1.2;

/// Perda fora do eixo: -6 dB no ângulo nominal de cobertura, caindo em lei
/// quadrática a partir dele. A cobertura alarga com a proximidade e o piso de
/// -16 dB é o vazamento que toda caixa real tem para trás — sem esses dois
/// termos a simulação inventa buracos que não existem.
function foraDoEixo(cos, meia, d) {
  const ang = Math.acos(Math.min(1, Math.max(-1, cos))) / grausRad;
  const meiaEf = meia + Math.atan(TAMANHO_FONTE / Math.max(d, 0.5)) / grausRad;
  return Math.max(-16, -6 * (ang / meiaEf) ** 2);
}

/// SPL de uma caixa num ponto da plateia, em dB. Exportada porque o ajuste de
/// ganho por seção precisa saber o que cada caixa entrega em cada poltrona —
/// e porque um mapa que mostra "de quem é este decibel" sai daqui.
export function splCaixa(c, p) {
  const v = { x: p.x - c.x, y: p.y - c.y, z: p.z - c.z };
  const d = Math.hypot(v.x, v.y, v.z);
  const m = { x: c.mira.x - c.x, y: c.mira.y - c.y, z: c.mira.z - c.z };
  const dm = Math.hypot(m.x, m.y, m.z);
  // Horizontal e vertical são separadas porque a caixa também é: um arranjo
  // fecha muito mais no plano vertical do que no horizontal.
  const cosH =
    (v.x * m.x + v.y * m.y) / (Math.hypot(v.x, v.y) * Math.hypot(m.x, m.y) || 1);
  const cosV = (v.x * m.x + v.y * m.y + v.z * m.z) / ((d * dm) || 1);
  return (
    c.sens -
    quedaDistancia(d) +
    foraDoEixo(cosH, c.abertura, d) +
    foraDoEixo(cosV, c.aberturaV, d)
  );
}

/// SPL somado em energia de todas as caixas — o mapa que a página mostra.
export function splEm(p) {
  const soma = caixas.reduce((a, c) => a + 10 ** (splCaixa(c, p) / 10), 0);
  return 10 * Math.log10(soma);
}

/// Todas as poltronas como pontos de escuta, com a orelha na altura certa.
export const assentos = [
  ...fileirasPlateia.flatMap((f) =>
    f.angulos.map((a) => {
      const p = polar(f.raio, a);
      return { x: p.x, y: p.y, z: f.nivel + alturaOuvido, mez: false };
    })
  ),
  ...fileirasMezanino.flatMap((f) =>
    f.angulos.map((a) => {
      const p = polar(f.raio, a);
      return { x: p.x, y: p.y, z: f.nivel + alturaOuvido, mez: true };
    })
  )
];

/// SPL a 4 kHz — **medido no modelo**, poltrona por poltrona. Nenhum número
/// desta seção é digitado à mão: se uma caixa mudar de lugar, o mapa, as
/// isolinhas e a variação mudam junto.
/// O nível de cada poltrona, na mesma ordem de `assentos` — o mapa de cobertura
/// e o modelo interativo leem daqui, e ninguém recalcula por conta própria.
export const niveisPorAssento = assentos.map(splEm);
const niveis = niveisPorAssento;
const ordenados = [...niveis].sort((a, b) => a - b);
const percentil = (f) => ordenados[Math.floor((ordenados.length - 1) * f)];
const um = (n) => Number(n.toFixed(1));
const mediana = percentil(0.5);

export const cobertura = {
  max: um(ordenados.at(-1)),
  min: um(ordenados[0]),
  variacao: um(ordenados.at(-1) - ordenados[0]),
  medio: um(niveis.reduce((a, n) => a + n, 0) / niveis.length),
  mediana: um(mediana),
  p05: um(percentil(0.05)),
  p95: um(percentil(0.95)),
  /// A faixa que 90 % das poltronas ocupam — o número que um relatório sério
  /// publica, porque a poltrona isolada colada numa caixa de preenchimento não
  /// descreve a sala.
  faixa90: um(percentil(0.95) - percentil(0.05)),
  dentroDe3: um((100 * niveis.filter((l) => Math.abs(l - mediana) <= 3).length) / niveis.length),
  isolinhas: [Math.round(mediana) + 3, Math.round(mediana), Math.round(mediana) - 3, Math.round(mediana) - 6],
  headroom: 105
};

/// Escala de cor da análise. Sobe de azul a vermelho como toda escala de
/// nível, mas com os passos calibrados para 1 dB — as fronteiras entre as
/// faixas são as próprias isolinhas. Mora aqui, e não dentro de um desenho,
/// porque o mapa de cobertura e o modelo interativo pintam a mesma sala: se a
/// escala fosse de um deles, o outro mentiria por um tom.
const PARADAS_DE_COR = [
  [0.0, [26, 42, 107]],
  [0.2, [31, 123, 182]],
  [0.42, [34, 168, 132]],
  [0.62, [127, 212, 75]],
  [0.79, [244, 208, 63]],
  [0.9, [242, 140, 40]],
  [1.0, [224, 58, 42]]
];

export const faixaNivel = { de: Math.floor(cobertura.min), ate: Math.ceil(cobertura.max) };

export function corDeNivel(nivel) {
  const t = Math.min(1, Math.max(0, (nivel - faixaNivel.de) / (faixaNivel.ate - faixaNivel.de)));
  let i = 0;
  while (i < PARADAS_DE_COR.length - 2 && t > PARADAS_DE_COR[i + 1][0]) i++;
  const [t0, c0] = PARADAS_DE_COR[i];
  const [t1, c1] = PARADAS_DE_COR[i + 1];
  const k = (t - t0) / (t1 - t0);
  const m = c0.map((v, j) => Math.round(v + (c1[j] - v) * k));
  return `rgb(${m[0]} ${m[1]} ${m[2]})`;
}

/// IEC 60268-16 — STI projetado, da primeira fileira à última do mezanino.
export const sti = {
  limite: 0.6,
  perfil: [
    0.72, 0.72, 0.72, 0.71, 0.71, 0.71, 0.71, 0.7, 0.7, 0.7, 0.7, 0.69,
    0.69, 0.69, 0.69, 0.68, 0.68, 0.68, 0.68, 0.68, 0.67, 0.67, 0.67, 0.67,
    0.67, 0.67, 0.66, 0.66, 0.66, 0.66, 0.66, 0.66
  ],
  perfilMezanino: [0.68, 0.68, 0.67, 0.67, 0.67, 0.66, 0.66, 0.66, 0.65, 0.65, 0.64, 0.64]
};
sti.primeira = sti.perfil[0];
sti.ultima = sti.perfilMezanino.at(-1);
sti.pior = Math.min(...sti.perfil, ...sti.perfilMezanino);

/// As oito verificações que decidiram a lista técnica.
export const verificacoes = [
  { n: '01', norma: 'ISO 3382-2', o_que: 'Tempo de reverberação por banda' },
  { n: '02', norma: 'SPL · 4 kHz', o_que: 'Cobertura sonora na plateia' },
  { n: '03', norma: 'IEC 60268-16', o_que: 'Inteligibilidade (STI)' },
  { n: '04', norma: 'PAG / NAG', o_que: 'Ganho antes da realimentação' },
  { n: '05', norma: 'ISO 717-1', o_que: 'Isolamento do fechamento (Rw)' },
  { n: '06', norma: 'NBR 10152', o_que: 'Ruído de fundo' },
  { n: '07', norma: 'SMPTE ST 2046', o_que: 'Linhas de visão e altura de tela' },
  { n: '08', norma: 'DMX512-A', o_que: 'Canais e universos de iluminação' }
];

/// O que a geometria não decide sozinha: os critérios das verificações que
/// dependem de fechamento, de sistema elétrico e de norma. Ficam aqui, e não
/// dentro do desenho, porque a folha de resultados compara critério com
/// resultado — e quem escreve o critério não pode ser quem desenha a coluna.
export const criterios = {
  /// Isolamento exigido entre o auditório e o foyer, e o do fechamento adotado.
  rwExigido: 52,
  rw: 55,
  /// Folga de ganho antes da realimentação.
  pagNagMinimo: 6,
  pagNag: 8.5,
  /// Ângulo vertical máximo da primeira fileira ao topo do painel: acima
  /// disso, quem senta na frente assiste ao culto com a cabeça para trás.
  anguloTelaMaximo: 35,
  /// Iluminação cênica: quantos aparelhos, de quantos canais cada um.
  fixtures: 168,
  canaisPorFixture: 24,
  canaisPorUniverso: 512,
  universosPrevistos: 8,
  /// Variação de nível aceita entre 90 % das poltronas.
  splMaximoFaixa: 8
};

/// Formatação pt-BR usada nos rótulos dos desenhos e no texto da home.
export const fmt = {
  milhar: (n) => n.toLocaleString('pt-BR'),
  dec: (n, casas = 2) => n.toFixed(casas).replace('.', ',')
};
