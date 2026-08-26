/// Os textos das pranchas, nos dois idiomas.
///
/// O desenho é o mesmo: mesma geometria, mesmas cotas, mesmos números. O que
/// muda é a legenda — como aconteceria se a mesma prancha fosse emitida para
/// um cliente de fora. Os valores chegam aqui **já formatados** pelo idioma da
/// página (vírgula decimal em português, ponto em inglês), então nenhuma
/// função daqui formata número.

/// Nome e "onde" de cada material do memorial, pela chave estável do material.
const MATERIAIS_EN = {
  concreto: { nome: 'Exposed concrete', onde: 'wall bases · balcony fronts' },
  pisoMadeira: { nome: 'Timber floor', onde: 'stage · 32.00 × 14.00 m' },
  ripado: { nome: 'Timber slats', onde: 'side walls · diffusion' },
  forro: { nome: 'Acoustic ceiling', onde: 'raked plane over the audience' },
  plateia: { nome: 'Occupied audience', onde: (n) => `${n} seats` },
  painel: { nome: 'Absorbing panel', onde: 'rear wall · under the balcony' },
  circulacao: { nome: 'Circulation floor', onde: 'aisles · inner foyer' }
};

const PT = {
  codigo: 'pt',
  locale: 'pt-BR',
  unidades: 'unidades SI · pt-BR',

  obra: {
    nome: 'Templo — auditório principal',
    disciplina: 'Acústica · sonorização · imagem · luz',
    responsavel: 'Garioli Labs · engenharia acústica'
  },

  carimbo: {
    responsavelChave: 'RESPONSÁVEL TÉCNICO',
    sala: 'SALA',
    obra: 'OBRA',
    conteudo: 'CONTEÚDO DESTA PRANCHA',
    lugares: 'LUGARES',
    legenda: 'LEGENDA',
    escala: 'ESCALA',
    data: 'DATA',
    prancha: 'PRANCHA',
    folha: 'FOLHA',
    rev: 'REV.',
    unid: 'UNID.',
    metros: 'metros',
    verificacoes: 'VERIFICAÇÕES DESTE CORTE'
  },

  comum: {
    palco: 'PALCO',
    foh: 'FOH',
    esc: 'esc.',
    painelLed: (l, a) => `PAINEL LED ${l} × ${a} m`,
    sub: (n) => `SUB · ${n} cx`,
    distancia: (d) => `${d} m — arranjo → última poltrona`,
    peDireito: (a, b, media) => `pé-direito ${a} a ${b} m · média ${media} m`,
    lugares: (p, m, t) => `${p} plateia + ${m} mezanino = ${t}`
  },

  planta: {
    aria: (n) => `Planta baixa cotada do auditório de ${n} lugares`,
    conteudo: 'Planta baixa · nível ±0,00',
    salaFicha: (area, volume, ruido) => `${area} m² · ${volume} m³ · ${ruido}`,
    mezaninoAcima: (lug, peitoril, ultima) =>
      `MEZANINO ACIMA · ${lug} lug. · peitoril ▲ +${peitoril} · última fileira ▲ +${ultima}`,
    fileiras: (n, de, ate, graus) =>
      `${n} fileiras · raios ${de}–${ate} m · ±${graus}°`,
    figcaption: (fileiras, mezanino) =>
      `fig. 01 · planta baixa cotada — ${fileiras} arcos concêntricos com foco ` +
      `sobre o palco, cinco blocos separados por quatro corredores radiais, mezanino ` +
      `de ${mezanino} lugares sobre a circulação e cabine de operação no eixo. ` +
      `A cota em vermelho é a que dimensiona todo o sistema de som.`,
    legenda: {
      poltronas: 'poltronas',
      arranjo: 'arranjo',
      delay: 'delay',
      mezanino: 'mezanino acima'
    }
  },

  corte: {
    aria: 'Corte longitudinal A-A do auditório, com forro inclinado, mezanino, linhas de visão e memorial de absorção',
    titulo: (lugares) => `Corte longitudinal A-A · templo com ${lugares} lugares`,
    conteudo: 'Corte longitudinal A-A · pelo eixo',
    salaFicha: (volume, superficies, ruido) => `${volume} m³ · ${superficies} m² · ${ruido}`,
    figcaption: (proscenio, fundo, livre, t30) =>
      `fig. 02 · corte longitudinal A-A. O forro desce de ${proscenio} m na boca de ` +
      `cena para ${fundo} m no fundo, e é essa inclinação que deixa ${livre} m livres ` +
      `sobre a última fileira do mezanino — a folga que decide se um balcão cabe ou ` +
      `não. Abaixo do desenho, o memorial que produz o T30 de ${t30} s citado na ` +
      `página: cada linha é uma superfície real, e a soma α·S é feita na hora em que ` +
      `a página é montada.`,
    ff: (altura) => `FF · 12 cx · ▲ +${altura}`,
    centro: (n, altura) => `C · ${n} cx · ▲ +${altura}`,
    delay: (rotulo, altura, ms) => `${rotulo} · ▲ +${altura} · ${ms} ms`,
    forro: (de, ate) => `FORRO ACÚSTICO · α 0,65 · ${de} → ${ate} m`,
    mezanino: (lug) => `MEZANINO · ${lug} lug.`,
    peDireitoLivre: (v) => `pé-direito livre ${v} m`,
    sobMezanino: (v) => `sob o mezanino ${v} m`,
    arranjo: (base) => `L/R · 16 cx · base ▲ +${base}`,
    memorial: 'MEMORIAL DE ABSORÇÃO · SABINE · 500 Hz',
    colunas: { superficie: 'SUPERFÍCIE', onde: 'ONDE', area: 'ÁREA m²' },
    absorcaoTotal: 'Absorção total A',
    resultado: 'RESULTADO',
    volume: 'V · volume',
    absorcao: 'A · absorção',
    sabine: (v) => `${v} m² Sabine`,
    t30: 'T30 calculado',
    alvo: (v) => `alvo de projeto ${v} s · sala ocupada`,
    verificado: ['Pé-direito livre · folga sob o mezanino', 'Linhas de visão · T30 por banda'],
    visadas: {
      mezanino: 'linha de visão · última fileira do mezanino',
      plateia: 'linha de visão · última fileira da plateia',
      painel: 'topo do painel · primeira fileira'
    },
    materiais: null
  },

  mapa: {
    aria: (n) => `Simulação de cobertura sonora do auditório no software Resonance, com mapa de nível sobre as ${n} poltronas`,
    titulo: 'Resonance · mapa de cobertura sonora a 4 kHz',
    fonte: (rotulo, n) => `${rotulo} · ${n} cx`,
    metros: (n) => `${n} m`,
    figcaption: (lugares, caixas, faixa90) =>
      `fig. 04 · cobertura sonora calculada no Resonance, a ferramenta de projeto da ` +
      `casa. A malha percorre as ${lugares} poltronas do modelo e cada célula é o ` +
      `nível somado em energia das ${caixas} caixas do sistema — arranjos principais, ` +
      `preenchimento de primeira fila, cobertura das poltronas que envolvem o palco e ` +
      `dois anéis de retardo. É esse cálculo, e não uma estimativa, que sustenta a ` +
      `variação de ${faixa90} dB declarada no relatório.`,
    versao: '0.9 · pré-lançamento',
    menus: ['Modelo', 'Materiais', 'Fontes', 'Análise', 'Relatório'],
    menuAtivo: 'Análise',
    modelo: 'MODELO',
    parametrosTitulo: 'PARÂMETROS DA ANÁLISE',
    verificacaoTitulo: 'VERIFICAÇÃO',
    sti: 'IEC 60268-16 · STI',
    stiNota: (v) => `${v} na poltrona mais distante`,
    t30: 'Sabine · T30',
    t30Nota: (v) => `alvo ${v} s · 500 Hz · ocupada`,
    cobertura: 'COBERTURA · SPL DIRETO · 4 kHz',
    plantaNivel: 'planta · nível ±0,00',
    sonda: (db, fileira) => `${db} dB · fileira ${fileira}`,
    nivel: 'NÍVEL · dB SPL',
    estatistica: 'ESTATÍSTICA SOBRE AS POLTRONAS',
    leituraTitulo: 'LEITURA',
    leitura: (variacao, faixa90, headroom) => [
      `A sala inteira cabe em ${variacao} dB,`,
      `e 90 % das poltronas em ${faixa90} dB —`,
      `sem nenhuma caixa acima de ${headroom} dB.`
    ],
    contagem: (receptores, fontes, celulas) =>
      `${receptores} receptores · ${fontes} fontes · ${celulas} células`,
    envoltoriaLinha: (volume, superficies, alfa) =>
      `${volume} m³ · ${superficies} m² · α médio ${alfa}`,
    arvore: {
      envoltoria: (v) => `Envoltória · ${v} m³`,
      superficies: (v) => `Superfícies · ${v} m²`,
      materiais: (v) => `Materiais · ${v} α médio`,
      plateia: (v) => `Plateia · ${v} lug.`,
      mezanino: (v) => `Mezanino · ${v} lug.`,
      fontes: (v) => `Fontes · ${v} caixas`
    },
    parametros: (celulas, receptores) => [
      ['Banda', '4 kHz · 1/1 oit.'],
      ['Campo', 'Direto'],
      ['Malha', `${celulas} células`],
      ['Receptores', receptores],
      ['Ouvido', '1,20 m'],
      ['Somatório', 'Energético']
    ],
    estatisticas: (c) => [
      ['Máximo', `${c.max} dB`],
      ['Mediana', `${c.mediana} dB`],
      ['Mínimo', `${c.min} dB`],
      ['Faixa total', `${c.variacao} dB`],
      ['90 % das poltronas', `${c.faixa90} dB`],
      ['Dentro de ±3 dB', `${c.dentroDe3} %`]
    ]
  },

  axo: {
    aria: (n) =>
      `Axonometria do auditório de ${n} lugares, com plateia, mezanino e sistema de som`,
    conteudo: 'Axonometria · envoltória e sistema',
    titulo: 'AXONOMETRIA ISOMÉTRICA · 30°',
    ficha: (prof, larg, alt) => `${prof} × ${larg} m · ${alt} m na boca de cena`,
    legenda: {
      envoltoria: 'envoltória · forro inclinado',
      terrea: (n) => `plateia térrea · ${n} arcos`,
      mezanino: (n) => `mezanino · ${n} arcos`,
      arranjos: 'arranjos L · C · R',
      complementos: 'delays · subgraves · preenchimento',
      alcance: 'maior distância coberta'
    },
    // Duas linhas soltas no canto do desenho: elas nao quebram sozinhas em SVG.
    nota: (rake, rakeMez) => [
      `Rake de ${rake} m por fileira na plateia e ${rakeMez} m no mezanino:`,
      'cada fileira passa por cima da anterior, na visada e no som direto.'
    ],
    figcaption: (lugares, alturaMez, livre) =>
      `fig. 03 · axonometria da envoltória — o leque de ${lugares} lugares, o mezanino ` +
      `a ${alturaMez} m e o sistema pendurado, tudo lido do mesmo modelo de onde saem a ` +
      `planta e o corte. Sobre a última fileira do mezanino restam ${livre} m livres.`
  },

  resultados: {
    aria: 'Resultados do projeto: T30 por banda, STI fileira a fileira e as oito verificações',
    conteudo: 'Resultados · T30, STI e verificações',
    carimboChave: 'VERIFICAÇÕES',
    t30: {
      titulo: 'T30 POR BANDA DE OITAVA · ISO 3382-2',
      antes: 'sala nua',
      depois: 'com tratamento',
      alvo: (v, tol) => `alvo ${v} s ± ${tol}`,
      eixoX: 'frequência · Hz',
      eixoY: 'T30 · s'
    },
    sti: {
      titulo: 'STI FILEIRA A FILEIRA · IEC 60268-16',
      eixoX: 'fileira',
      eixoY: 'STI',
      terrea: 'plateia térrea',
      mezanino: 'mezanino',
      limite: (v) => `limite de projeto · STI ${v}`,
      pior: (v) => `pior poltrona · ${v}`
    },
    tabela: {
      titulo: 'VERIFICAÇÕES DO PROJETO',
      n: 'Nº',
      norma: 'NORMA / MÉTODO',
      oque: 'O QUE FOI VERIFICADO',
      criterio: 'CRITÉRIO',
      resultado: 'RESULTADO',
      atende: 'atende',
      naoAtende: 'não atende',
      calc: 'calc.',
      proj: 'proj.',
      nota: 'calc. — número que sai do modelo desta página · proj. — dado de projeto,' +
        ' verificado em obra'
    },
    crit: {
      t30: (alvo, tol) => `${alvo} s ± ${tol} a 500 Hz`,
      spl: (v) => `≤ ${v} dB em 90 % das poltronas`,
      sti: (v) => `≥ ${v} em toda a plateia`,
      pag: (v) => `≥ ${v} dB de folga`,
      rw: (v) => `Rw ≥ ${v} dB`,
      ruido: (v) => `${v} com o sistema em espera`,
      visada: (v) => `≤ ${v}° ao topo da tela`,
      dmx: (n) => `≤ ${n} canais por universo`
    },
    val: {
      t30: (v) => `${v} s`,
      spl: (v) => `${v} dB`,
      pag: (v) => `${v} dB`,
      rw: (v) => `Rw ${v} dB`,
      visada: (v) => `${v}°`,
      dmx: (canais, universos) => `${canais} · ${universos} universos`
    },
    sumario: {
      t30: 'T30 · 500 Hz',
      faixa: 'FAIXA DE NÍVEL EM 90 %',
      sti: 'STI MÍNIMO',
      ruido: 'RUÍDO DE FUNDO'
    },
    figcaption: (t30, faixa, sti) =>
      `fig. 05 · folha de resultados — T30 antes e depois do tratamento, STI da primeira ` +
      `fileira à última do mezanino e as oito verificações que decidiram a lista técnica. ` +
      `T30 de ${t30} s, ${faixa} dB entre 90 % das poltronas e STI mínimo de ${sti}. ` +
      `Cada linha da tabela compara critério e resultado calculado — o "atende" não é ` +
      `escrito à mão, é a comparação dos dois.`
  },

  modelo: {
    titulo: 'MODELO INTERATIVO',
    subtitulo: 'o mesmo projeto, girando',
    aria: (n) =>
      `Modelo tridimensional interativo do auditório de ${n} lugares. ` +
      `Arraste para girar; + e − aproximam.`,
    ajuda: 'arraste para girar · + e − aproximam · as setas do teclado giram',
    aproximar: 'aproximar',
    afastar: 'afastar',
    camadas: {
      titulo: 'CAMADAS',
      envoltoria: 'envoltória',
      plateia: 'plateia',
      sistema: 'sistema de som',
      nivel: 'nível por poltrona'
    },
    vistas: { titulo: 'VISTA', iso: 'isométrica', frente: 'frontal', lado: 'lateral', topo: 'superior' },
    escala: (min, max) => `${min} a ${max} dB`,

    rodape: (lugares, caixas) =>
      `${lugares} poltronas · ${caixas} caixas · cor por nível calculado a 4 kHz`,
    figcaption: (lugares, caixas) =>
      `fig. 06 · o modelo do estudo de caso, navegável — as mesmas ${lugares} poltronas e ` +
      `as mesmas ${caixas} caixas das pranchas, com a cor de cada poltrona saindo do nível ` +
      `calculado ali mesmo, no navegador.`
  }
};

const EN = {
  codigo: 'en',
  locale: 'en-US',
  unidades: 'SI units · en',

  obra: {
    nome: 'Temple — main auditorium',
    disciplina: 'Acoustics · sound · image · light',
    responsavel: 'Garioli Labs · acoustic engineering'
  },

  carimbo: {
    responsavelChave: 'ENGINEER IN CHARGE',
    sala: 'ROOM',
    obra: 'PROJECT',
    conteudo: 'CONTENT OF THIS SHEET',
    lugares: 'SEATS',
    legenda: 'KEY',
    escala: 'SCALE',
    data: 'DATE',
    prancha: 'SHEET NO.',
    folha: 'SHEET',
    rev: 'REV.',
    unid: 'UNITS',
    metros: 'metres',
    verificacoes: 'CHECKS ON THIS SECTION'
  },

  comum: {
    palco: 'STAGE',
    foh: 'FOH',
    esc: 'scale',
    painelLed: (l, a) => `LED WALL ${l} × ${a} m`,
    sub: (n) => `SUB · ${n} cab.`,
    distancia: (d) => `${d} m — array → farthest seat`,
    peDireito: (a, b, media) => `ceiling ${a} to ${b} m · mean ${media} m`,
    lugares: (p, m, t) => `${p} floor + ${m} balcony = ${t}`
  },

  planta: {
    aria: (n) => `Dimensioned floor plan of the ${n}-seat auditorium`,
    conteudo: 'Floor plan · level ±0.00',
    salaFicha: (area, volume, ruido) => `${area} m² · ${volume} m³ · ${ruido}`,
    mezaninoAcima: (lug, peitoril, ultima) =>
      `BALCONY ABOVE · ${lug} seats · front ▲ +${peitoril} · last row ▲ +${ultima}`,
    fileiras: (n, de, ate, graus) =>
      `${n} fan rows · radii ${de}–${ate} m · ±${graus}°`,
    figcaption: (fileiras, mezanino) =>
      `fig. 01 · dimensioned floor plan — ${fileiras} concentric arcs focused on ` +
      `the stage, five blocks split by four radial aisles, a ${mezanino}-seat ` +
      `balcony over the circulation and the control booth on the centreline. ` +
      `The dimension in red is the one that sizes the whole sound system.`,
    legenda: {
      poltronas: 'seats',
      arranjo: 'array',
      delay: 'delay',
      mezanino: 'balcony above'
    }
  },

  corte: {
    aria: 'Longitudinal section A-A of the auditorium, with the raked ceiling, the balcony, the sight lines and the absorption schedule',
    titulo: (lugares) => `Longitudinal section A-A · ${lugares}-seat temple`,
    conteudo: 'Longitudinal section A-A · on the centreline',
    salaFicha: (volume, superficies, ruido) => `${volume} m³ · ${superficies} m² · ${ruido}`,
    figcaption: (proscenio, fundo, livre, t30) =>
      `fig. 02 · longitudinal section A-A. The ceiling falls from ${proscenio} m at ` +
      `the proscenium to ${fundo} m at the rear, and it is that rake that leaves ` +
      `${livre} m clear over the last balcony row — the headroom that decides whether ` +
      `a balcony fits at all. Below the drawing, the schedule that produces the ` +
      `${t30} s T30 quoted on the page: every line is a real surface, and the α·S sum ` +
      `is computed as the page is built.`,
    ff: (altura) => `FF · 12 cab. · ▲ +${altura}`,
    centro: (n, altura) => `C · ${n} cab. · ▲ +${altura}`,
    delay: (rotulo, altura, ms) => `${rotulo} · ▲ +${altura} · ${ms} ms`,
    forro: (de, ate) => `ACOUSTIC CEILING · α 0.65 · ${de} → ${ate} m`,
    mezanino: (lug) => `BALCONY · ${lug} seats`,
    peDireitoLivre: (v) => `clear height ${v} m`,
    sobMezanino: (v) => `under the balcony ${v} m`,
    arranjo: (base) => `L/R · 16 cab. · base ▲ +${base}`,
    memorial: 'ABSORPTION SCHEDULE · SABINE · 500 Hz',
    colunas: { superficie: 'SURFACE', onde: 'WHERE', area: 'AREA m²' },
    absorcaoTotal: 'Total absorption A',
    resultado: 'RESULT',
    volume: 'V · volume',
    absorcao: 'A · absorption',
    sabine: (v) => `${v} m² Sabine`,
    t30: 'T30 calculated',
    alvo: (v) => `design target ${v} s · room occupied`,
    verificado: ['Clear height · headroom under the balcony', 'Sight lines · T30 by band'],
    visadas: {
      mezanino: 'sight line · last balcony row',
      plateia: 'sight line · last floor row',
      painel: 'top of the wall · front row'
    },
    materiais: MATERIAIS_EN
  },

  mapa: {
    aria: (n) => `Sound coverage simulation of the auditorium in the Resonance software, mapping level over the ${n} seats`,
    titulo: 'Resonance · sound coverage map at 4 kHz',
    fonte: (rotulo, n) => `${rotulo} · ${n} cab.`,
    metros: (n) => `${n} m`,
    figcaption: (lugares, caixas, faixa90) =>
      `fig. 04 · sound coverage computed in Resonance, the studio's own design tool. ` +
      `The grid sweeps the ${lugares} seats of the model and each cell is the ` +
      `energy sum of the ${caixas} loudspeakers in the system — main arrays, front ` +
      `fill, coverage for the seats that wrap the stage and two delay rings. It is ` +
      `this calculation, not an estimate, that backs the ${faixa90} dB spread quoted ` +
      `in the report.`,
    versao: '0.9 · pre-release',
    menus: ['Model', 'Materials', 'Sources', 'Analysis', 'Report'],
    menuAtivo: 'Analysis',
    modelo: 'MODEL',
    parametrosTitulo: 'ANALYSIS PARAMETERS',
    verificacaoTitulo: 'CHECK',
    sti: 'IEC 60268-16 · STI',
    stiNota: (v) => `${v} at the most distant seat`,
    t30: 'Sabine · T30',
    t30Nota: (v) => `target ${v} s · 500 Hz · occupied`,
    cobertura: 'COVERAGE · DIRECT SPL · 4 kHz',
    plantaNivel: 'plan · level ±0.00',
    sonda: (db, fileira) => `${db} dB · row ${fileira}`,
    nivel: 'LEVEL · dB SPL',
    estatistica: 'STATISTICS OVER THE SEATS',
    leituraTitulo: 'READING',
    // Tres linhas curtas: elas moram numa caixa de 218 unidades do visor, e o
    // ingles precisa caber na mesma largura que o portugues.
    leitura: (variacao, faixa90, headroom) => [
      `The whole room fits in ${variacao} dB,`,
      `90 % of the seats in ${faixa90} dB —`,
      `no cabinet above ${headroom} dB.`
    ],
    contagem: (receptores, fontes, celulas) =>
      `${receptores} receivers · ${fontes} sources · ${celulas} cells`,
    envoltoriaLinha: (volume, superficies, alfa) =>
      `${volume} m³ · ${superficies} m² · mean α ${alfa}`,
    arvore: {
      envoltoria: (v) => `Envelope · ${v} m³`,
      superficies: (v) => `Surfaces · ${v} m²`,
      materiais: (v) => `Materials · ${v} mean α`,
      plateia: (v) => `Floor · ${v} seats`,
      mezanino: (v) => `Balcony · ${v} seats`,
      fontes: (v) => `Sources · ${v} cabinets`
    },
    parametros: (celulas, receptores) => [
      ['Band', '4 kHz · 1/1 oct.'],
      ['Field', 'Direct'],
      ['Grid', `${celulas} cells`],
      ['Receivers', receptores],
      ['Ear', '1.20 m'],
      ['Summation', 'Energetic']
    ],
    estatisticas: (c) => [
      ['Maximum', `${c.max} dB`],
      ['Median', `${c.mediana} dB`],
      ['Minimum', `${c.min} dB`],
      ['Full range', `${c.variacao} dB`],
      ['90 % of seats', `${c.faixa90} dB`],
      ['Within ±3 dB', `${c.dentroDe3} %`]
    ]
  },

  axo: {
    aria: (n) =>
      `Axonometric view of the ${n}-seat auditorium, with stalls, balcony and sound system`,
    conteudo: 'Axonometric · envelope and system',
    titulo: 'ISOMETRIC AXONOMETRIC · 30°',
    ficha: (prof, larg, alt) => `${prof} × ${larg} m · ${alt} m at the proscenium`,
    legenda: {
      envoltoria: 'envelope · raked ceiling',
      terrea: (n) => `stalls · ${n} arcs`,
      mezanino: (n) => `balcony · ${n} arcs`,
      arranjos: 'arrays L · C · R',
      complementos: 'delays · subs · fill',
      alcance: 'longest throw covered'
    },
    nota: (rake, rakeMez) => [
      `A rake of ${rake} m per row in the stalls and ${rakeMez} m on the balcony:`,
      'every row clears the one in front — for sightlines and for direct sound.'
    ],
    figcaption: (lugares, alturaMez, livre) =>
      `fig. 03 · axonometric of the envelope — the fan of ${lugares} seats, the balcony at ` +
      `${alturaMez} m and the flown system, all read from the same model the plan and the ` +
      `section come from. ${livre} m of clearance remain over the last balcony row.`
  },

  resultados: {
    aria: 'Project results: T30 per band, STI row by row and the eight verifications',
    conteudo: 'Results · T30, STI and verifications',
    carimboChave: 'VERIFICATIONS',
    t30: {
      titulo: 'T30 PER OCTAVE BAND · ISO 3382-2',
      antes: 'bare room',
      depois: 'treated',
      alvo: (v, tol) => `target ${v} s ± ${tol}`,
      eixoX: 'frequency · Hz',
      eixoY: 'T30 · s'
    },
    sti: {
      titulo: 'STI ROW BY ROW · IEC 60268-16',
      eixoX: 'row',
      eixoY: 'STI',
      terrea: 'stalls',
      mezanino: 'balcony',
      limite: (v) => `design limit · STI ${v}`,
      pior: (v) => `worst seat · ${v}`
    },
    tabela: {
      titulo: 'PROJECT VERIFICATIONS',
      n: 'No.',
      norma: 'STANDARD / METHOD',
      oque: 'WHAT WAS VERIFIED',
      criterio: 'CRITERION',
      resultado: 'RESULT',
      atende: 'pass',
      naoAtende: 'fail',
      calc: 'calc.',
      proj: 'spec',
      nota: 'calc. — figure produced by the model on this page · spec — design datum,' +
        ' verified on site'
    },
    oque: {
      '01': 'Reverberation time per octave band',
      '02': 'Sound coverage over the audience',
      '03': 'Speech intelligibility (STI)',
      '04': 'Gain before feedback',
      '05': 'Envelope sound insulation (Rw)',
      '06': 'Background noise',
      '07': 'Sightlines and screen height',
      '08': 'Lighting channels and DMX universes'
    },
    crit: {
      t30: (alvo, tol) => `${alvo} s ± ${tol} at 500 Hz`,
      spl: (v) => `≤ ${v} dB across 90 % of the seats`,
      sti: (v) => `≥ ${v} everywhere in the audience`,
      pag: (v) => `≥ ${v} dB of headroom`,
      rw: (v) => `Rw ≥ ${v} dB`,
      ruido: (v) => `${v} with the system idling`,
      visada: (v) => `≤ ${v}° to the top of the screen`,
      dmx: (n) => `≤ ${n} channels per universe`
    },
    val: {
      t30: (v) => `${v} s`,
      spl: (v) => `${v} dB`,
      pag: (v) => `${v} dB`,
      rw: (v) => `Rw ${v} dB`,
      visada: (v) => `${v}°`,
      dmx: (canais, universos) => `${canais} · ${universos} universes`
    },
    sumario: {
      t30: 'T30 · 500 Hz',
      faixa: 'LEVEL RANGE OVER 90 %',
      sti: 'LOWEST STI',
      ruido: 'BACKGROUND NOISE'
    },
    figcaption: (t30, faixa, sti) =>
      `fig. 05 · results sheet — T30 before and after treatment, STI from the first row to ` +
      `the last balcony row, and the eight verifications behind the equipment list. ` +
      `T30 of ${t30} s, ${faixa} dB across 90 % of the seats and a lowest STI of ${sti}. ` +
      `Each row compares criterion against computed result — the "pass" is not typed in, ` +
      `it is that comparison.`
  },

  modelo: {
    titulo: 'INTERACTIVE MODEL',
    subtitulo: 'the same project, turning',
    aria: (n) =>
      `Interactive three-dimensional model of the ${n}-seat auditorium. ` +
      `Drag to orbit; + and − zoom.`,
    ajuda: 'drag to orbit · + and − zoom · arrow keys turn the model',
    aproximar: 'zoom in',
    afastar: 'zoom out',
    camadas: {
      titulo: 'LAYERS',
      envoltoria: 'envelope',
      plateia: 'seating',
      sistema: 'sound system',
      nivel: 'level per seat'
    },
    vistas: { titulo: 'VIEW', iso: 'isometric', frente: 'front', lado: 'side', topo: 'top' },
    escala: (min, max) => `${min} to ${max} dB`,

    rodape: (lugares, caixas) =>
      `${lugares} seats · ${caixas} cabinets · colour from the level computed at 4 kHz`,
    figcaption: (lugares, caixas) =>
      `fig. 06 · the case-study model, navigable — the same ${lugares} seats and the same ` +
      `${caixas} cabinets as the sheets, each seat coloured by the level computed right ` +
      `there, in the browser.`
  }
};

export function rotulos(lang) {
  return lang === 'en' ? EN : PT;
}

/// Formatação de número no idioma da prancha. O desenho é o mesmo; o que muda
/// é a vírgula decimal, que em inglês vira ponto.
export function formatador(lang) {
  return lang === 'en'
    ? {
        milhar: (n) => n.toLocaleString('en-US'),
        dec: (n, casas = 2) => n.toFixed(casas)
      }
    : {
        milhar: (n) => n.toLocaleString('pt-BR'),
        dec: (n, casas = 2) => n.toFixed(casas).replace('.', ',')
      };
}

/// Nome e local de um material do memorial, no idioma pedido.
export function material(m, lang, quantidade) {
  if (lang !== 'en') return { nome: m.nome, onde: m.onde };
  const t = MATERIAIS_EN[m.id];
  if (!t) return { nome: m.nome, onde: m.onde };
  return { nome: t.nome, onde: typeof t.onde === 'function' ? t.onde(quantidade) : t.onde };
}
