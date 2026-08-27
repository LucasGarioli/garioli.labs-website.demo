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
    /// Um conjunto de caixas, carimbado do mesmo jeito em toda prancha: sigla,
    /// quantidade e cota de voo. A contagem vem do rack de gabinetes, nunca
    /// digitada — foi digitando que a planta já disse dezesseis onde o corte
    /// desenhava doze.
    conjunto: (rotulo, n, voo) => `${rotulo} · ${n} cx · ▲ +${voo}`,
    delay: (rotulo, n, voo, ms) => `${rotulo} · ${n} cx · ▲ +${voo} · ${ms} ms`,
    distancia: (d) => `${d} m — arranjo → última poltrona`,
    peDireito: (a, b, media) => `pé-direito ${a} a ${b} m · média ${media} m`,
    lugares: (p, m, t) => `${p} plateia + ${m} mezanino = ${t}`
  },

  /// Prancha em tela cheia. No telefone a folha inteira cabe na largura, e
  /// nessa escala um rótulo de 10 px vira 3 px: quem quer ler o desenho abre
  /// o visor e o percorre na escala natural, como se faz com papel.
  visor: {
    ampliar: 'ampliar',
    dica: 'toque para ler em tela cheia',
    fechar: 'fechar',
    ajustar: 'ajustar à tela',
    aproximar: 'aproximar',
    afastar: 'afastar',
    arraste: 'arraste para percorrer a prancha',
    nomes: {
      planta: 'AC-01 · planta baixa',
      corte: 'AC-02 · corte longitudinal A-A',
      axo: 'AC-03 · axonometria',
      mapa: 'Mapa de cobertura',
      resultados: 'AC-04 · resultados'
    }
  },

  /// Glossário por prancha: o que o termo é, e para que serve avaliá-lo.
  ///
  /// A primeira linha de cada verbete é escrita para quem projeta; a segunda,
  /// marcada com uma seta, para quem contrata. Nenhum termo entra aqui sem
  /// estar escrito na prancha correspondente.
  glossario: {
    titulo: 'O que cada termo desta prancha quer dizer',
    planta: [
      {
        t: 'Planta baixa cotada',
        d: 'Corte horizontal do pavimento a 1,50 m do piso, com as medidas reais anotadas sobre a geometria: paredes, palco, corredores e a posição de cada fileira.',
        p: 'É a régua de tudo o que vem depois. Enquanto ela não existe, nenhuma caixa, tela ou refletor pode ser escolhido sem chute — quantidade e potência saem de distância medida, não de catálogo.'
      },
      {
        t: 'Plateia em leque',
        d: 'Fileiras dispostas em arcos concêntricos com centro no palco, em vez de linhas retas paralelas.',
        p: 'Mantém toda a plateia dentro do mesmo ângulo de cobertura e a distâncias parecidas do palco. É o que evita a sala dividida entre quem ouve bem e quem ouve o vizinho antes da caixa.'
      },
      {
        t: 'Cota crítica',
        d: 'A maior distância entre o arranjo principal e uma poltrona ocupada — marcada em vermelho na prancha.',
        p: 'É o número que dimensiona o sistema inteiro. O nível cai com a distância, e a caixa tem de entregar na última fileira o mesmo que promete na primeira: é dessa cota que sai a potência necessária.'
      },
      {
        t: 'Delay',
        d: 'Caixa auxiliar no meio da sala, com o sinal atrasado em milissegundos para chegar junto com o som vindo do arranjo principal.',
        p: 'Sem o atraso certo, quem senta perto dela ouve a mesma palavra duas vezes e a fala perde nitidez. Com ele, a caixa reforça sem que ninguém perceba que ela existe.'
      }
    ],
    corte: [
      {
        t: 'Corte longitudinal A-A',
        d: 'A sala vista como se tivesse sido serrada pelo eixo, do palco ao fundo, com as alturas reais anotadas.',
        p: 'Altura é onde os problemas se escondem. Forro, mezanino e inclinação do piso só se verificam de lado — em planta, os três são invisíveis.'
      },
      {
        t: 'Pé-direito livre',
        d: 'Distância vertical entre o piso e o obstáculo mais baixo acima dele: forro, viga ou a laje do mezanino.',
        p: 'É o que decide se um balcão cabe, se o projetor alcança a tela e se quem está na última fileira levanta sem bater a cabeça. Descobrir isso na obra custa muito mais do que descobrir aqui.'
      },
      {
        t: 'Coeficiente de absorção α',
        d: 'Fração da energia sonora que uma superfície absorve em vez de devolver à sala, de 0 (espelho acústico) a 1 (absorve tudo), medida por banda de frequência.',
        p: 'É o que separa tratamento de decoração. Duas superfícies podem ser idênticas na foto e opostas no α — e é o α, multiplicado pela área, que decide se a sala vai ser entendida ou vai ecoar.'
      },
      {
        t: 'Memorial de absorção',
        d: 'Tabela que soma α × área de cada superfície real da sala para obter a absorção total A, da qual sai o tempo de reverberação pela fórmula de Sabine.',
        p: 'É a prova de que o número prometido tem conta atrás dele. Cada linha pode ser conferida, e trocar um material muda o resultado à vista de todos — em vez de pedir confiança.'
      }
    ],
    axo: [
      {
        t: 'Axonometria',
        d: 'Vista tridimensional em que retas paralelas continuam paralelas e a escala se mantém nos três eixos, sem a distorção de perspectiva de uma fotografia.',
        p: 'Serve para entender o volume de uma vez só e para conferir: como não há ponto de fuga, a altura medida no desenho é a altura real.'
      },
      {
        t: 'Envoltória',
        d: 'A superfície fechada que delimita o volume acústico: piso, paredes, forro e as faces do mezanino.',
        p: 'É o recipiente onde o som mora. O volume dela e a área das suas superfícies são as duas entradas de qualquer cálculo de reverberação — mexer na envoltória refaz o projeto inteiro.'
      },
      {
        t: 'Rake',
        d: 'Desnível vertical de cada fileira em relação à fileira imediatamente à frente.',
        p: 'É o que faz cada pessoa enxergar por cima da cabeça da da frente. No som vale o mesmo: sem rake, as primeiras fileiras absorvem o que era para chegar às últimas.'
      },
      {
        t: 'Preenchimento',
        d: 'Caixas menores que cobrem as poltronas fora do alcance útil do arranjo principal: a primeira fila e as laterais que envolvem o palco.',
        p: 'São exatamente os assentos que costumam ser esquecidos e reclamam depois. Cobri-los custa pouco no projeto e é quase impossível de corrigir com a obra pronta.'
      }
    ],
    mapa: [
      {
        t: 'SPL direto',
        d: 'Nível de pressão sonora, em dB, que chega a um ponto vindo direto da caixa, sem contar as reflexões da sala.',
        p: 'É a parte do som que carrega a palavra. Se o direto já chega fraco ou desigual na poltrona, nenhuma equalização conserta — aumentar o volume só piora o resto.'
      },
      {
        t: 'Malha de receptores',
        d: 'Grade de pontos de medição virtual distribuída sobre o plano das poltronas, na altura do ouvido de quem está sentado (1,20 m).',
        p: 'É o que transforma uma impressão de cobertura em um número por assento. Cada célula do mapa é uma conta feita, não uma cor escolhida à mão.'
      },
      {
        t: 'Somatório energético',
        d: 'Forma de somar a contribuição de várias caixas num mesmo ponto pela energia, sem depender da relação de fase entre elas.',
        p: 'É o critério conservador. Ele não promete os reforços de fase que só existem em condição ideal, então a sala tende a entregar melhor do que o papel — nunca pior.'
      },
      {
        t: 'Faixa de nível',
        d: 'Diferença, em dB, entre a poltrona de maior e a de menor nível, declarada para a sala inteira e para os 90 % centrais.',
        p: 'É a medida de justiça do projeto. Três decibéis de faixa tratam todo mundo igual; doze criam plateia de primeira e de segunda classe — e é daí que vem a queixa de que no fundo não se ouve.'
      }
    ],
    resultados: [
      {
        t: 'T30',
        d: 'Tempo, em segundos, que o som leva para cair 60 dB depois que a fonte para, extrapolado a partir dos 30 dB medidos, banda a banda, conforme a ISO 3382-2.',
        p: 'É o número que decide se a sala é entendida. Curto demais, ela soa morta e cansa quem fala; longo demais, cada sílaba atropela a seguinte e a mensagem se perde no meio do salão.'
      },
      {
        t: 'Banda de oitava',
        d: 'Faixa de frequências cuja borda superior é o dobro da inferior: 125, 250, 500, 1 k, 2 k e 4 kHz.',
        p: 'Uma sala não tem um problema só — pode estar certa na voz e errada no grave. Avaliar banda a banda é o que impede um tratamento de resolver metade do problema e criar outro.'
      },
      {
        t: 'STI',
        d: 'Índice de transmissão de fala, de 0 a 1, conforme a IEC 60268-16: quanto da modulação da voz sobrevive ao caminho entre o microfone e o ouvinte.',
        p: 'É a nota final para a única coisa que importa num templo ou auditório: entender o que está sendo dito. Ele é calculado poltrona a poltrona, e o que vale é a pior delas, não a média.'
      },
      {
        t: 'Ganho antes da realimentação',
        d: 'Margem, em dB, entre o nível de operação e o ponto em que o sistema começa a microfonar.',
        p: 'É o fôlego de quem opera ao vivo. Sem margem, o culto acontece com o dedo no fader e a microfonia é questão de tempo — e a causa quase nunca é a mesa, é a geometria entre microfone e caixa.'
      },
      {
        t: 'Ruído de fundo',
        d: 'Nível que a sala apresenta com o sistema ligado e ninguém falando: ar-condicionado, projetor, ventilação e rua.',
        p: 'É o piso do qual a voz precisa subir. Cada decibel de ruído a menos é um decibel que não precisa ser gasto em potência — e é o parâmetro mais barato de resolver antes da obra e mais caro depois.'
      }
    ]
  },

  comparador: {
    aria:
      'Comparação entre o salão como está hoje e o mesmo salão com o projeto ' +
      'executado. Arraste o divisor para revelar mais de um lado ou do outro.',
    antes: 'hoje',
    depois: 'projeto executado',
    dica: 'arraste ou use as setas',
    leitura: (p) => `${p} % do projeto executado visível`,
    figcaption:
      'fig. 00 · o mesmo salão, antes e depois — arraste o divisor. É a sala do ' +
      'estudo de caso desta página, vista de onde fica a mesa de som. À esquerda, o ' +
      'que o levantamento encontra: alvenaria pintada e forro de PVC, superfícies ' +
      'que devolvem à sala quase todo o som que recebem, luz de trabalho chapada e ' +
      'duas caixas de mercado tentando cobrir a plateia inteira. À direita, o que o ' +
      'projeto entrega: forro absorvente em plano inclinado, ripado de difusão nas ' +
      'laterais, arranjos L/R de dezesseis caixas dimensionados para alcançar a ' +
      'última fileira com o mesmo nível da primeira, cluster central, subgraves ' +
      'voados e de piso, preenchimento de primeira fila, retornos de palco, anel de ' +
      'delay sobre a plateia — o segundo anel fica sobre a cabeça de quem olha —, ' +
      'painel de LED com telas laterais, luz de cena em camadas e a ilha de ' +
      'operação, com cabine de transmissão de um lado e sala de racks do outro. A ' +
      'geometria e as poltronas são as mesmas dos dois lados: o que muda é o ' +
      'projeto, não a sala.'
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
    forro: (de, ate) => `FORRO ACÚSTICO · α 0,65 · ${de} → ${ate} m`,
    mezanino: (lug) => `MEZANINO · ${lug} lug.`,
    peDireitoLivre: (v) => `pé-direito livre ${v} m`,
    sobMezanino: (v) => `sob o mezanino ${v} m`,
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
    conjunto: (rotulo, n, voo) => `${rotulo} · ${n} cab. · ▲ +${voo}`,
    delay: (rotulo, n, voo, ms) => `${rotulo} · ${n} cab. · ▲ +${voo} · ${ms} ms`,
    distancia: (d) => `${d} m — array → farthest seat`,
    peDireito: (a, b, media) => `ceiling ${a} to ${b} m · mean ${media} m`,
    lugares: (p, m, t) => `${p} floor + ${m} balcony = ${t}`
  },

  visor: {
    ampliar: 'enlarge',
    dica: 'tap to read it full screen',
    fechar: 'close',
    ajustar: 'fit to screen',
    aproximar: 'zoom in',
    afastar: 'zoom out',
    arraste: 'drag to move around the sheet',
    nomes: {
      planta: 'AC-01 · floor plan',
      corte: 'AC-02 · longitudinal section A-A',
      axo: 'AC-03 · axonometric',
      mapa: 'Coverage map',
      resultados: 'AC-04 · results'
    }
  },

  glossario: {
    titulo: 'What every term on this sheet means',
    planta: [
      {
        t: 'Dimensioned floor plan',
        d: 'A horizontal cut through the floor at 1.50 m, with the real measurements written over the geometry: walls, stage, aisles and the position of every row.',
        p: 'It is the ruler for everything that follows. Until it exists, no loudspeaker, screen or fixture can be chosen without guessing — quantity and power come from measured distance, not from a catalogue.'
      },
      {
        t: 'Fan seating',
        d: 'Rows laid out as concentric arcs centred on the stage rather than as parallel straight lines.',
        p: 'It keeps the whole audience inside the same coverage angle and at comparable distances from the stage. That is what prevents a room split between people who hear well and people who hear their neighbour first.'
      },
      {
        t: 'Critical dimension',
        d: 'The longest distance between the main array and an occupied seat — drawn in red on the sheet.',
        p: 'It is the figure that sizes the entire system. Level falls with distance, and the array has to deliver at the last row what it promises at the first: the required power comes from this dimension.'
      },
      {
        t: 'Delay',
        d: 'A secondary loudspeaker in the middle of the room, fed with the signal delayed by milliseconds so it arrives together with the sound from the main array.',
        p: 'Without the right delay, anyone sitting near it hears the same word twice and speech loses definition. With it, the cabinet reinforces without anyone noticing it is there.'
      }
    ],
    corte: [
      {
        t: 'Longitudinal section A-A',
        d: 'The room seen as if sawn along its centreline, from stage to rear wall, with the real heights written on it.',
        p: 'Height is where the problems hide. Ceiling, balcony and floor rake can only be checked from the side — in plan, all three are invisible.'
      },
      {
        t: 'Clear height',
        d: 'The vertical distance between the floor and the lowest obstruction above it: ceiling, beam or the balcony slab.',
        p: 'It decides whether a balcony fits, whether the projector reaches the screen and whether someone in the last row can stand up without hitting their head. Finding this out on site costs far more than finding it out here.'
      },
      {
        t: 'Absorption coefficient α',
        d: 'The fraction of sound energy a surface absorbs rather than returns to the room, from 0 (an acoustic mirror) to 1 (fully absorbing), measured per frequency band.',
        p: 'It is what separates treatment from decoration. Two surfaces can look identical in a photograph and be opposites in α — and it is α, multiplied by area, that decides whether the room is understood or echoes.'
      },
      {
        t: 'Absorption schedule',
        d: 'A table summing α × area over every real surface in the room to obtain total absorption A, from which the reverberation time follows by the Sabine formula.',
        p: 'It is the proof that the promised figure has arithmetic behind it. Every line can be checked, and swapping a material changes the result in plain sight — instead of asking for trust.'
      }
    ],
    axo: [
      {
        t: 'Axonometric',
        d: 'A three-dimensional view in which parallel lines stay parallel and scale is preserved on all three axes, without the perspective distortion of a photograph.',
        p: 'It exists so the volume can be grasped at once, and so it can be checked: with no vanishing point, a height measured on the drawing is the real height.'
      },
      {
        t: 'Envelope',
        d: 'The closed surface bounding the acoustic volume: floor, walls, ceiling and the faces of the balcony.',
        p: 'It is the container the sound lives in. Its volume and the area of its surfaces are the two inputs to any reverberation calculation — change the envelope and the whole design is redone.'
      },
      {
        t: 'Rake',
        d: 'The vertical rise of each row relative to the row immediately in front of it.',
        p: 'It is what lets each person see over the head in front. The same holds for sound: with no rake, the front rows absorb what was meant to reach the back ones.'
      },
      {
        t: 'Fill',
        d: 'Smaller cabinets covering the seats outside the useful reach of the main array: the front row and the sides that wrap the stage.',
        p: 'These are exactly the seats that get forgotten and complain later. Covering them costs little in design and is close to impossible to correct once the room is built.'
      }
    ],
    mapa: [
      {
        t: 'Direct SPL',
        d: 'The sound pressure level, in dB, arriving at a point straight from the loudspeaker, excluding the reflections of the room.',
        p: 'It is the part of the sound that carries the word. If the direct field already arrives weak or uneven at the seat, no equalisation will fix it — turning it up only makes the rest worse.'
      },
      {
        t: 'Receiver grid',
        d: 'A grid of virtual measurement points spread over the seating plane at the ear height of a seated listener (1.20 m).',
        p: 'It is what turns an impression of coverage into a number per seat. Every cell of the map is a computation, not a colour chosen by hand.'
      },
      {
        t: 'Energetic summation',
        d: 'A way of summing the contribution of several loudspeakers at one point by energy, without relying on the phase relationship between them.',
        p: 'It is the conservative criterion. It does not promise the phase reinforcement that only exists under ideal conditions, so the room tends to deliver better than the paper — never worse.'
      },
      {
        t: 'Level spread',
        d: 'The difference, in dB, between the loudest and the quietest seat, stated for the whole room and for the central 90 %.',
        p: 'It is the fairness measure of the design. Three decibels of spread treat everyone alike; twelve create a first-class and a second-class audience — and that is where the complaint about not hearing at the back comes from.'
      }
    ],
    resultados: [
      {
        t: 'T30',
        d: 'The time, in seconds, for sound to fall 60 dB after the source stops, extrapolated from the measured 30 dB, band by band, per ISO 3382-2.',
        p: 'It is the figure that decides whether the room is understood. Too short and it sounds dead and tires the speaker; too long and each syllable runs into the next, and the message is lost halfway down the hall.'
      },
      {
        t: 'Octave band',
        d: 'A frequency range whose upper edge is twice the lower one: 125, 250, 500, 1 k, 2 k and 4 kHz.',
        p: 'A room never has just one problem — it can be right on speech and wrong on the low end. Assessing band by band is what stops a treatment from solving half the problem and creating another.'
      },
      {
        t: 'STI',
        d: 'The speech transmission index, from 0 to 1, per IEC 60268-16: how much of the modulation of the voice survives the path from microphone to listener.',
        p: 'It is the final mark for the only thing that matters in a temple or an auditorium: understanding what is being said. It is computed seat by seat, and what counts is the worst seat, not the average.'
      },
      {
        t: 'Gain before feedback',
        d: 'The margin, in dB, between the operating level and the point at which the system starts to ring.',
        p: 'It is the headroom of whoever mixes live. With no margin, the service happens with a finger on the fader and feedback is a matter of time — and the cause is almost never the console, it is the geometry between microphone and loudspeaker.'
      },
      {
        t: 'Background noise',
        d: 'The level the room shows with the system powered and nobody speaking: air conditioning, projector, ventilation and street.',
        p: 'It is the floor the voice has to rise above. Every decibel of noise removed is a decibel that need not be spent on power — and it is the cheapest parameter to solve before the work and the dearest afterwards.'
      }
    ]
  },

  comparador: {
    aria:
      'Comparison between the hall as it stands today and the same hall with the ' +
      'project built. Drag the divider to reveal more of either side.',
    antes: 'today',
    depois: 'project built',
    dica: 'drag or use the arrow keys',
    leitura: (p) => `${p} % of the built project visible`,
    figcaption:
      'fig. 00 · the same hall, before and after — drag the divider. It is the room ' +
      'this page studies, seen from where the mixing desk stands. On the left, what ' +
      'the survey finds: painted masonry and a PVC ceiling, surfaces that hand the ' +
      'room back nearly all the sound they receive, flat work light and two consumer ' +
      'cabinets trying to cover the whole audience. On the right, what the project ' +
      'delivers: an absorbing raked ceiling, timber slat diffusion on the side ' +
      'walls, sixteen-box L/R arrays sized to reach the last row at the level of the ' +
      'first, a centre cluster, flown and floor subwoofers, front fill, stage ' +
      'monitors, a delay ring over the audience — the second ring hangs above your ' +
      'own head —, an LED wall with side screens, stage light in layers, and the ' +
      'operating island, with the broadcast booth on one side and the rack room on ' +
      'the other. The geometry and the seats are the same on both sides: what ' +
      'changes is the design, not the room.'
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

    forro: (de, ate) => `ACOUSTIC CEILING · α 0.65 · ${de} → ${ate} m`,
    mezanino: (lug) => `BALCONY · ${lug} seats`,
    peDireitoLivre: (v) => `clear height ${v} m`,
    sobMezanino: (v) => `under the balcony ${v} m`,
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
