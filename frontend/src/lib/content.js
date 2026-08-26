export const stats = [
  { v: '12+', t: 'anos de prática em áudio, imagem e projeto' },
  { v: '4', t: 'disciplinas integradas no mesmo documento' },
  { v: 'RT60', t: 'cálculo por Sabine e Eyring antes de qualquer compra' },
  { v: '2 dias', t: 'para retorno da solicitação de orçamento' }
];

export const servicos = [
  { n: '01', t: 'Projeto acústico', d: 'Medição, cálculo de tempo de reverberação e projeto de superfícies absorvedoras e difusoras — com materiais que existem no mercado local.' },
  { n: '02', t: 'Isolamento acústico', d: 'Perda de transmissão, detalhamento construtivo e compatibilização com a obra civil, para o som não entrar nem sair.' },
  { n: '03', t: 'Sonorização', d: 'Dimensionamento de PA, cobertura, fluxo de sinal, ganho de realimentação e memorial descritivo para compra e instalação.' },
  { n: '04', t: 'Iluminação cênica', d: 'Plano de luz em camadas, potências, circuitos, mapa de canais e cenas — pensado também para a câmera.' },
  { n: '05', t: 'Projeção e vídeo', d: 'Avaliação entre projetores e painel de LED, distâncias, luminância, telas, cabeamento e cadeia de transmissão.' },
  { n: '06', t: 'Consultoria de compra', d: 'Lista técnica de referência e critérios de escolha por faixa de preço. Sem comissão de fornecedor — a recomendação é técnica.' }
];

export const processo = [
  { n: '01', t: 'Triagem', d: 'Você responde perguntas simples sobre o espaço. Nada de termo técnico, nada de compromisso.' },
  { n: '02', t: 'Análise', d: 'Um engenheiro lê tudo e diz se falta informação, foto ou visita técnica.' },
  { n: '03', t: 'Proposta', d: 'Escopo, premissas, cronograma e valores, com validade de 15 dias.' },
  { n: '04', t: 'Contrato', d: 'Aceite e assinatura eletrônica pelo Gov.br, com os mesmos termos da proposta.' },
  { n: '05', t: 'Entrega', d: 'Documentos em PDF e acompanhamento pela sua conta — com dúvidas de implantação tiradas sem custo.' }
];

/// Estudo de caso: o que o site diz sobre resultado, e não sobre método.
///
/// `nota` existe para a página nunca apresentar como cliente real um número
/// que não foi conferido — é o campo que muda entre esta versão e a de
/// demonstração.
export const caso = {
  titulo: 'Ninguém elogia o áudio quando ele está certo. É esse o padrão.',
  resumo:
    'Um auditório de 486 lugares, reconstruído no software antes de qualquer compra. ' +
    'Oito verificações no mesmo modelo decidiram o que entrou na lista técnica — e, ' +
    'sobretudo, o que saiu dela.',
  nota: 'Estudo de caso ilustrativo. Os números existem para demonstrar o formato do relatório — nenhum cliente real é identificado nesta demonstração.',
  numeros: [
    { v: '486', t: 'lugares no estudo de caso' },
    { v: '4 210 m³', t: 'volume modelado' },
    { v: '1,0 s', t: 'T30 alvo, atingido em toda a faixa útil' },
    { v: '0,68', t: 'STI na última fileira' },
    { v: '8', t: 'verificações: som, imagem, luz e transmissão' }
  ],
  sala: [
    { k: 'Área útil', v: '680 m²' },
    { k: 'Pé-direito', v: '9,20 m' },
    { k: 'Ruído de fundo', v: 'NC 35' },
    { k: 'Distância máx.', v: '24,0 m' }
  ],
  analises: [
    {
      norma: 'ISO 3382-2',
      t: 'Reverberação por banda',
      d: 'T30 medido e recalculado com o tratamento proposto. Alvo de 1,0 s para palavra falada em toda a faixa útil.'
    },
    {
      norma: 'SPL · 4 kHz',
      t: 'Cobertura sonora',
      d: 'Variação máxima de 6 dB entre a primeira e a última fileira — o limite que mantém a fala uniforme sem excesso à frente.'
    },
    {
      norma: 'IEC 60268-16',
      t: 'Inteligibilidade (STI)',
      d: 'STI acima de 0,60 em todas as posições de plateia, incluindo mezanino e as poltronas fora de eixo.'
    }
  ]
};

export const entregas = [
  { tipo: 'Documento', t: 'Plantas cotadas', d: 'Locação de tratamento, fontes, rigging e infraestrutura, com cotas executáveis em obra.' },
  { tipo: 'Documento', t: 'Memorial de cálculo', d: 'Premissas, coeficientes, resultados por banda e a justificativa técnica de cada escolha.' },
  { tipo: 'Documento', t: 'Diagramas de sinal', d: 'Cadeia completa de áudio e vídeo, ponto a ponto, com ganhos e tipos de conexão.' },
  { tipo: 'Campo', t: 'Comissionamento', d: 'Ajuste em obra, medição de verificação e treinamento da equipe que vai operar.' }
];

export const softwares = [
  { nome: 'Resonance', estado: 'Em desenvolvimento', d: 'Modelagem geométrica, cálculo de reverberação por banda e memorial gerado direto do modelo — a ferramenta usada no estudo de caso desta página.' },
  { nome: 'Roadmap', estado: 'Em estudo', d: 'Novas ferramentas de projeto e automação nascidas dos gargalos do trabalho diário.' },
  { nome: 'Sob medida', estado: 'Sob consulta', d: 'Desenvolvimento dedicado ao fluxo do seu escritório, com documentação e suporte.' }
];

export const ensino = {
  titulo: 'O que eu sei não fica só no meu projeto.',
  sub: 'Material escrito, exercícios corrigidos e vídeo — na sua conta, com progresso registrado.',
  itens: [
    { tipo: 'Escrito', t: 'Materiais de estudo', d: 'Apostilas técnicas de acústica, sonorização e projeto, escritas para serem consultadas depois.' },
    { tipo: 'Prática', t: 'Exercícios online', d: 'Problemas reais resolvidos passo a passo, com correção e progresso registrado.' },
    { tipo: 'Vídeo', t: 'Aulas gravadas', d: 'Demonstrações em campo e em software, do diagnóstico ao ajuste final do sistema.' }
  ]
};

export const sobre = {
  titulo: 'Quem assina o projeto',
  paragrafos: [
    'Aprendi atrás de uma mesa de som de igreja que, quando o som acerta, ele desaparece — e a mensagem é a única coisa que sobra na sala. Vieram depois a formação técnica em Informática e quatro anos de Engenharia Mecânica: foi ali que o ouvido treinado ganhou unidade de medida e o palpite virou cálculo.',
    'A Garioli Labs atende quem precisa de projeto sério e não quer virar refém de fornecedor. Escritório pequeno por opção.'
  ],
  independencia: 'Não vendo, não instalo e não recebo comissão de fornecedor. O projeto sai com especificação aberta, que qualquer integrador competente cota e executa — inclusive um que você já tenha.',
  marcos: [
    { quando: 'Início', o_que: 'Primeira mesa de som em igreja, na adolescência.' },
    { quando: 'Formação', o_que: 'Técnico em Informática e quatro anos de Engenharia Mecânica.' },
    { quando: 'Prática', o_que: 'Duas décadas de operação e projeto em áudio, imagem e luz.' },
    { quando: 'Agora', o_que: 'Projeto técnico, software próprio e ensino sob o mesmo teto.' }
  ]
};

export const duvidas = [
  { p: 'Preciso contratar todas as frentes de uma vez?', r: 'Não. Cada frente se contrata sozinha — é comum começar pela acústica, que é a que mais muda o resultado. O que não muda é a ordem: medir e calcular antes de especificar.' },
  { p: 'Você vende ou instala equipamento?', r: 'Não vendo, não instalo e não recebo comissão de fornecedor. O projeto sai com especificação aberta, que qualquer integrador competente cota e executa — inclusive um que você já tenha.' },
  { p: 'Como funciona fora do Espírito Santo?', r: 'A maior parte do trabalho é remota: levantamento guiado por medidas, fotos e plantas que você envia, com cálculo e documentação feitos aqui. Visita presencial é combinada quando o caso pede.' },
  { p: 'O que eu recebo, na prática?', r: 'Plantas cotadas, memorial com os cálculos, diagramas de sinal, lista técnica e um resumo executivo legível por quem decide — em PDF, para durar.' },
  { p: 'Dá para aproveitar o equipamento que já tenho?', r: 'Quase sempre. Boa parte dos casos se resolve realocando, reconfigurando e tratando o ambiente, sem compra nova — e isso aparece no diagnóstico antes de qualquer orçamento.' }
];

export const empresa = {
  nome: 'GARIOLI LABS',
  razao: 'Razão social de exemplo',
  cnpj: '00.000.000/0001-00',
  cidade: 'Cachoeiro de Itapemirim · ES',
  site: 'www.gariolilabs.com',
  fone: '(00) 00000-0000',
  selo: '', // credencial real omitida na demonstração
  fundador: 'Lucas Ribeiro Garioli',
  papelFundador: 'Fundador · projetista e especialista executivo',
  atuacao: 'Projeto remoto para todo o país · visita técnica no Espírito Santo e região'
};
