//! Backend de demonstração, rodando dentro do navegador.
//!
//! Reimplementa em JavaScript o mesmo contrato do backend Axum (`backend/src/`)
//! — as mesmas rotas, as mesmas formas de resposta, os mesmos códigos de erro —
//! para que a versão de portfólio seja inteiramente estática: sem servidor para
//! manter, sem custo, e com todas as telas clicáveis.
//!
//! O que muda em relação ao original:
//!   · a sessão é um objeto em memória, não um cookie HttpOnly assinado;
//!   · a senha não é conferida contra hash Argon2id — qualquer senha de 8+
//!     caracteres entra, porque aqui não há nada a proteger;
//!   · o estado vive em `sessionStorage`, então some ao fechar a aba.
//!
//! A lógica que *importa* para quem está lendo o repositório — o cálculo da
//! triagem, a separação cliente/dono, a trilha de auditoria append-only — é
//! porte fiel. O original está em `backend/src/triagem.rs`, `auth.rs` e
//! `store.rs`, e é ele que roda em produção.

import { ErroApi } from './api-erros.js';
import { traduzSchema } from './triagem-en.js';
import { cpfOuCnpjValido, cpfValido, emailValido } from './documento.js';

/** E-mail que entra como dono. Qualquer outro entra como cliente. */
export const EMAIL_DONO = 'demo@exemplo.com';

const CHAVE = 'gl_demo';

/** Forma da semente. Sobe sempre que um campo mudar de tipo, de nome ou de
 *  unidade.
 *
 *  Sem este número, um estado gravado antes da mudança volta do
 *  `sessionStorage` sem erro nenhum — é JSON válido — e só aparece na tela,
 *  como NaN em todo lugar onde havia dinheiro. Quem estivesse com a aba aberta
 *  durante um deploy veria exatamente isso. */
const VERSAO_ESTADO = 2;
const LATENCIA = 180;

// ---------- utilidades ----------

const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

const agora = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

/** Um instante `dias` atrás, aquele dia às `hora` horas.
 *
 *  A semente é escrita em deslocamento e não em data fixa — a trilha de uma
 *  demonstração aberta daqui a dois anos continua sendo de ontem, e não de um
 *  passado esquecido. Mas o deslocamento tem de ser em DIA, não em horas
 *  corridas: subtraindo horas do instante atual, uma demonstração aberta de
 *  madrugada empurrava cada linha para o dia anterior e a trilha deixava de
 *  bater com as datas do funil. As horas usadas ficam entre 9 e 17 justamente
 *  para o dia em UTC e o dia local coincidirem nos fusos de uso. */
const emDiaAs = (dias, hora) => {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  d.setHours(hora, 31, 44, 0);
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
};

/** Algumas horas atrás — para o que chegou hoje e não pode cair no futuro. */
const horasAtras = (horas) =>
  new Date(Date.now() - horas * 3_600_000).toISOString().replace(/\.\d{3}Z$/, 'Z');

const espera = () => new Promise((r) => setTimeout(r, LATENCIA));

function iniciaisDe(nome) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const publico = (u) => ({
  id: u.id,
  nome: u.nome,
  iniciais: iniciaisDe(u.nome),
  email: u.email,
  papel: u.papel
});

// ---------- estado ----------

function semente() {
  return {
    solicitacoes: [
      {
        id: uid(),
        protocolo: 'SOL-2026-0149',
        criada_em: horasAtras(3),
        situacao: 'Aguardando análise',
        solicitante: 'Rosana Vieira',
        instituicao: 'Igreja Batista Central',
        cidade: 'Marataízes · ES',
        email: 'rosana@exemplo.com',
        fone: '(28) 90000-0000',
        premissas: [
          { label: 'Uso do espaço', valor: 'Templo religioso' },
          { label: 'Área declarada', valor: '300 a 600 m²' },
          { label: 'Pé-direito', valor: '6 a 9 m' },
          { label: 'Lotação típica', valor: '400 a 800 lugares' },
          { label: 'Sintomas relatados', valor: 'Eco perceptível · Fala pouco inteligível' },
          { label: 'Infraestrutura existente', valor: 'PA antigo, sem projeto' },
          { label: 'Documentação', valor: 'Planta em PDF' },
          { label: 'Prazo pretendido', valor: 'Até 3 meses' }
        ],
        frentes: [
          {
            titulo: 'Tratamento acústico',
            descricao: 'Medição, cálculo de RT60 e projeto de tratamento.',
            minimo_centavos: 480_000,
            maximo_centavos: 840_000
          },
          {
            titulo: 'Projeto de sonorização',
            descricao: 'Dimensionamento de PA, fluxo de sinal e memorial para compra.',
            minimo_centavos: 320_000,
            maximo_centavos: 560_000
          }
        ],
        faixa_minima_centavos: 800_000,
        faixa_maxima_centavos: 1_400_000,
        alertas: []
      },
      {
        id: uid(),
        protocolo: 'SOL-2026-0148',
        criada_em: horasAtras(6),
        situacao: 'Aguardando análise',
        solicitante: 'Paulo Menezes',
        instituicao: 'Espaço Multiuso Pedra Azul',
        cidade: 'Domingos Martins · ES',
        email: 'paulo@exemplo.com',
        fone: '(27) 90000-0000',
        premissas: [
          { label: 'Uso do espaço', valor: 'Espaço de eventos' },
          { label: 'Área declarada', valor: 'Não sei' },
          { label: 'Pé-direito', valor: '4 a 6 m' },
          { label: 'Lotação típica', valor: '150 a 300 lugares' },
          { label: 'Sintomas relatados', valor: 'Vizinhos reclamam' },
          { label: 'Infraestrutura existente', valor: 'Nada instalado' },
          { label: 'Documentação', valor: 'Nenhuma' },
          { label: 'Prazo pretendido', valor: 'Sem prazo definido' }
        ],
        frentes: [
          {
            titulo: 'Isolamento acústico',
            descricao: 'Cálculo de perda de transmissão e projeto de fechamento.',
            minimo_centavos: 500_000,
            maximo_centavos: 900_000
          }
        ],
        faixa_minima_centavos: 500_000,
        faixa_maxima_centavos: 900_000,
        alertas: [
          'Área declarada como "não sei" exige visita antes de fechar valor.',
          'Reclamação de vizinhos: verificar exigência legal municipal de ruído.'
        ]
      }
    ],
    propostas: [
      {
        /// O preço é guardado em centavos por item, e nada mais. Subtotal,
        /// desconto, total, parcela e valor à vista são contas feitas na hora
        /// de mostrar — em `propostaPublica`. Enquanto os três eram texto
        /// digitado, mudar uma linha do escopo deixava o total mentindo, e o
        /// mesmo valor aparecia uma quarta vez no funil do dono.
        id: 'PRJ-2026-0091',
        numero: 'PROP. 0091/2026',
        instituicao: 'Comunidade Vale Verde',
        cidade: 'Vila Nova · ES',
        maps_url: 'https://www.google.com/maps/search/?api=1&query=Comunidade+Vale+Verde+ES',
        representante: 'Direção da Comunidade Vale Verde',
        titulo: 'Projeto integrado de infraestrutura audiovisual',
        resumo:
          'Modernização da infraestrutura audiovisual do espaço de culto: acústica, som, ' +
          'projeção, iluminação cênica, rede de dados e transmissão, integrados ao projeto ' +
          'elétrico existente.',
        disciplinas: 'Acústica, áudio, projeção, iluminação, rede e transmissão',
        objeto:
          'Elaboração de projeto técnico integrado para modernização da infraestrutura ' +
          'audiovisual do espaço de culto, abrangendo tratamento acústico, sistema de som, ' +
          'projeção, iluminação cênica, rede de dados e sistema de transmissão, com ' +
          'compatibilização entre as frentes e integração ao projeto elétrico já executado.',
        /// O diagnóstico é o que sustenta o preço: sem ele, a proposta é uma
        /// tabela de serviços; com ele, é a resposta a um problema visitado.
        diagnostico: [
          'Ausência de tratamento acústico — a única absorção existente vem dos bancos estofados.',
          'Projetores com abertura e potência inadequadas para as distâncias e a luminosidade do ambiente.',
          'Projeção dependente de dois computadores em paralelo, sem redundância nem sincronia.',
          'Iluminação cênica executada parcialmente, com equipamentos subdimensionados para o volume do espaço.',
          'Ausência de rede estruturada para tráfego de áudio, vídeo e controle.',
          'Transmissão não estruturada, sem cadeia de sinal definida.',
          'Operadores relatam dificuldade e confusão na operação dos sistemas atuais.'
        ],
        diretrizes: [
          {
            t: 'Integração antes de equipamento',
            d: 'As seis frentes são projetadas como um sistema único e compatibilizadas com o projeto elétrico já executado.'
          },
          {
            t: 'Acústica como ponto de partida',
            d: 'Nenhum sistema de som resolve um ambiente não tratado: a acústica define o dimensionamento do áudio.'
          },
          {
            t: 'Operação simples e confiável',
            d: 'Cadeias de sinal enxutas, presets claros e menos pontos de falha — o culto não pode depender de improviso.'
          },
          {
            t: 'Otimização do investimento',
            d: 'Especificação de equipamentos disponíveis no mercado nacional, com alternativas por faixa de investimento.'
          }
        ],
        criterio_aceite:
          'O projeto é considerado entregue quando as plantas executivas, o diagrama de ' +
          'fluxo de sinal, o memorial descritivo e a lista técnica das frentes contratadas ' +
          'forem disponibilizados e a sessão de apresentação técnica for realizada.',
        entregaveis: [
          {
            disciplina: 'Acústica',
            documentacao: 'Planta de tratamento com locação e cotas, cálculo de reverberação por banda de oitava, memorial e quantitativos de materiais.'
          },
          {
            disciplina: 'Sistema de som',
            documentacao: 'Planta de posicionamento e cobertura, diagrama de fluxo de sinal, dimensionamento de potência e lista técnica.'
          },
          {
            disciplina: 'Projeção',
            documentacao: 'Estudo de superfícies, cálculo de distância e luminosidade, cadeia de vídeo e lista técnica.'
          },
          {
            disciplina: 'Iluminação cênica',
            documentacao: 'Planta de rigging e endereçamento DMX, dimensionamento de carga, mapa de cenas e lista técnica.'
          },
          {
            disciplina: 'Rede de dados',
            documentacao: 'Topologia lógica e física, segmentação por VLAN para áudio, vídeo e controle, plano de endereçamento e lista técnica.'
          },
          {
            disciplina: 'Transmissão',
            documentacao: 'Cadeia de captação, roteamento de áudio e vídeo, fluxo de publicação e lista técnica.'
          }
        ],
        formato_entrega: 'PDF',
        prazo_dias: 45,
        prazo_condicao:
          'Entrega única, após assinatura do contrato e confirmação da primeira parcela.',
        incluso:
          'Sessão de apresentação técnica das frentes contratadas, duas rodadas de revisão ' +
          'solicitadas em até 15 dias da entrega e referências de fornecimento na lista técnica.',
        nao_incluso:
          'Execução de obra, cotação e negociação com fornecedores, fornecimento e instalação ' +
          'de equipamentos, projeto elétrico e estrutural, licenças e a configuração ' +
          'operacional dos sistemas — objeto do aditivo técnico.',
        escopo: [
          {
            titulo: 'Projeto acústico',
            descricao: 'Medição, cálculo de RT60 e projeto de tratamento com reforma do forro.',
            centavos: 600_000
          },
          {
            titulo: 'Projeto de sonorização',
            descricao: 'Dimensionamento de PA, fluxo de sinal e memorial para compra.',
            centavos: 300_000
          },
          {
            titulo: 'Iluminação cênica básica',
            descricao: 'Plano de luz em camadas, circuitos e mapa de canais.',
            centavos: 250_000
          }
        ],
        /// Serviços de campo, precificados à vista de todos e concedidos como
        /// cortesia. O valor existe para que a cortesia seja mensurável — uma
        /// gentileza sem número não é gentileza, é vaguidão.
        aditivo: {
          titulo: 'Configuração e acompanhamento operacional',
          resumo:
            'Serviços técnicos complementares ao projeto, executados no local após a ' +
            'aquisição e instalação dos equipamentos. Estão precificados de forma ' +
            'transparente abaixo e, nesta proposta, são concedidos integralmente como cortesia.',
          cortesia: true,
          validade_meses: 12,
          dimensao:
            '5 diárias presenciais de até 8 horas, 2 eventos acompanhados ao vivo e 12 horas ' +
            'de suporte remoto, distribuídas conforme o cronograma de instalação.',
          condicoes:
            'Executável somente após a aquisição e instalação dos equipamentos especificados ' +
            'no projeto. Depende de agendamento com no mínimo 10 dias de antecedência e de ' +
            'que a instalação siga o projeto entregue. Não substitui revisão de projeto, ' +
            'fiscalização de obra nem responsabilidade técnica pela execução.',
          itens: [
            { t: 'Áudio — configuração e alinhamento', d: 'Console e processamento, medição em campo, equalização, delay e ganho de sistema.', centavos: 240_000 },
            { t: 'Projeção — configuração', d: 'Mapeamento das superfícies e cadeia de vídeo.', centavos: 120_000 },
            { t: 'Iluminação — configuração e cenas', d: 'Endereçamento DMX, criação e gravação das cenas.', centavos: 100_000 },
            { t: 'Rede — configuração', d: 'VLANs de áudio, vídeo e controle, QoS e endereçamento.', centavos: 60_000 },
            { t: 'Transmissão — configuração', d: 'Cadeia de captação, roteamento e fluxo de publicação.', centavos: 120_000 },
            { t: 'Treinamento e documentação', d: 'Treinamento formal dos operadores e guia rápido com presets.', centavos: 140_000 },
            { t: 'Acompanhamento ao vivo', d: 'Operação assistida com a equipe, com ajustes finos em situação real.', centavos: 120_000 },
            { t: 'Acompanhamento da instalação', d: 'Conferência da execução do fornecedor contra o projeto entregue.', centavos: 100_000 }
          ]
        },
        premissas: [
          { label: 'Área declarada', valor: '120 a 300 m²' },
          { label: 'Lotação típica', valor: 'cerca de 300 lugares' },
          { label: 'Acabamentos', valor: 'piso cerâmico, alvenaria pintada, forro de PVC' },
          { label: 'Prazo de entrega', valor: '30 dias úteis após 1ª parcela' },
          { label: 'Revisões incluídas', valor: '2 rodadas' }
        ],
        desconto_pct: 10,
        desconto_motivo: 'instituições religiosas e do terceiro setor',
        /// 40 na assinatura e o resto em duas: `entrada_pct` a zero devolve o
        /// parcelamento simples, em partes iguais.
        entrada_pct: 40,
        parcelas: 2,
        /// Quem paga à vista tira 5% do já descontado. É a diferença entre
        /// receber em 30 dias e receber na assinatura.
        desconto_avista_pct: 5,
        /// Deslocamentos em dias, como o resto da demonstração: a proposta
        /// enviada ontem continua tendo sido enviada ontem daqui a dois anos.
        enviada_em_dias: -1,
        validade_dias: 15,
        situacao: 'enviada',
        aceita_em: null,
        /// Preenchido no aceite: é ele que decide o texto da cláusula 4ª.
        forma_pagamento: null,
        observacoes: null
      }
    ],
    contratos: [],
    auditoria: [
      {
        id: uid(),
        quando: emDiaAs(1, 16),
        tipo: 'Assinatura',
        evento: 'Contrato PRJ-2026-0088 assinado — Auditório Ipê Amarelo',
        ip: '203.0.113.41',
        critico: true
      },
      {
        id: uid(),
        quando: emDiaAs(1, 14),
        tipo: 'Aceite',
        evento: 'Proposta PRJ-2026-0088 aceita sem ressalvas — Auditório Ipê Amarelo',
        ip: '203.0.113.41',
        critico: true
      },
      {
        id: uid(),
        quando: emDiaAs(1, 11),
        tipo: 'Envio',
        evento: 'Proposta PRJ-2026-0091 enviada por e-mail e WhatsApp',
        ip: '—',
        critico: false
      },
      {
        id: uid(),
        quando: emDiaAs(5, 15),
        tipo: 'Execução',
        evento: 'Prazo suspenso em PRJ-2026-0074 — pendência do cliente registrada',
        ip: '—',
        critico: false
      },
      {
        id: uid(),
        quando: emDiaAs(14, 16),
        tipo: 'Assinatura',
        evento: 'Contrato PRJ-2026-0074 assinado — Igreja Monte Alto',
        ip: '198.51.100.7',
        critico: true
      },
      {
        id: uid(),
        quando: emDiaAs(14, 14),
        tipo: 'Aceite',
        evento: 'Proposta PRJ-2026-0074 aceita com observações — Igreja Monte Alto',
        ip: '198.51.100.7',
        critico: true
      },
      {
        id: uid(),
        quando: emDiaAs(24, 10),
        tipo: 'Entrega',
        evento: 'Projeto PRJ-2026-0061 entregue — Teatro Aurora',
        ip: '—',
        critico: false
      }
    ],
    sequencia: 0,
    usuarios: [],
    sessao: null
  };
}

let dados = semente();

function restaurar() {
  if (typeof sessionStorage === 'undefined') return;
  try {
    const cru = sessionStorage.getItem(CHAVE);
    if (!cru) return;
    const salvo = JSON.parse(cru);
    if (salvo?.versao !== VERSAO_ESTADO || !salvo.dados) {
      sessionStorage.removeItem(CHAVE);
      return;
    }
    dados = salvo.dados;
  } catch {
    // Aba anônima, storage bloqueado ou JSON corrompido: a demonstração
    // recomeça da semente, que é um estado perfeitamente válido.
  }
}

function salvar() {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify({ versao: VERSAO_ESTADO, dados }));
  } catch {
    // Sem persistência a demo continua funcionando dentro da navegação atual.
  }
}

restaurar();

function registrar(tipo, evento, critico = false) {
  dados.auditoria.unshift({ id: uid(), quando: agora(), tipo, evento, ip: '203.0.113.10', critico });
  salvar();
}

// ---------- sessão ----------

function sessao() {
  if (!dados.sessao) return null;
  return dados.usuarios.find((u) => u.id === dados.sessao) ?? null;
}

/** Espelha o extrator `Autenticado` do backend. */
function exigeAutenticado() {
  const u = sessao();
  if (!u) throw new ErroApi(401, 'Faça login para continuar');
  return u;
}

/** Espelha o extrator `Dono`: 404, não 403 — quem não é dono não precisa
 *  sequer saber que a rota existe. */
function exigeDono() {
  const u = exigeAutenticado();
  if (u.papel !== 'dono') throw new ErroApi(404, 'não encontrado');
  return u;
}

// ---------- triagem (porte de backend/src/triagem.rs) ----------

// `val` é a chave da resposta e não muda com o idioma; `label` é o que se lê.
const op = (val, desc) => ({ val, label: val, desc });

const SCHEMA = [
  {
    key: 'tipo',
    rail: 'Tipo de espaço',
    title: 'Que tipo de espaço é?',
    hint: 'Escolha o que mais se aproxima. Se estiver entre dois, escolha o uso principal.',
    multi: false,
    options: [
      op('Igreja ou templo', 'Culto, música ao vivo, fala amplificada'),
      op('Auditório ou teatro', 'Palestras, apresentações, eventos'),
      op('Estúdio ou home studio', 'Gravação, mixagem, produção'),
      op('Sala de aula ou treinamento', 'Ensino presencial ou híbrido'),
      op('Comércio ou academia', 'Loja, restaurante, bar, academia'),
      op('Outro uso', 'Descreva depois no campo de contato')
    ]
  },
  {
    key: 'dor',
    rail: 'O que incomoda',
    title: 'O que mais incomoda hoje?',
    hint: 'Marque tudo o que acontece. Não precisa saber o nome técnico do problema.',
    multi: true,
    options: [
      op('Não se entende o que é falado', 'A fala chega embolada, principalmente no fundo'),
      op('O som ecoa muito', 'Fica um rastro depois de cada palavra ou nota'),
      op('Microfonia', 'Aquele apito agudo quando o volume sobe'),
      op('Volume alto e cansativo', 'Precisa gritar, e no fim todos saem com dor de cabeça'),
      op('Barulho passa entre ambientes', 'Uma sala escuta a outra'),
      op('Vizinhos reclamam', 'O som sai do prédio'),
      op('Ainda não existe nada instalado', 'Espaço novo ou em obra')
    ]
  },
  {
    key: 'area',
    rail: 'Tamanho',
    title: 'Qual o tamanho aproximado?',
    hint: 'Uma faixa já basta. Se não souber, escolha a última opção — nós medimos.',
    multi: false,
    options: [
      op('Até 50 m²', 'Uma sala comum'),
      op('50 a 120 m²', 'Sala grande ou salão pequeno'),
      op('120 a 300 m²', 'Salão médio'),
      op('300 a 600 m²', 'Salão grande'),
      op('Mais de 600 m²', 'Ginásio, templo grande, galpão'),
      op('Não sei', 'Vamos medir na visita técnica')
    ]
  },
  {
    key: 'altura',
    rail: 'Altura do teto',
    title: 'E a altura do teto?',
    hint: 'Compare com o que você conhece: uma casa comum tem cerca de 2,5 m.',
    multi: false,
    options: [
      op('Baixo, como uma casa', 'Cerca de 2,5 m'),
      op('Médio', 'Entre 3 e 4 m'),
      op('Alto', 'Entre 4 e 7 m'),
      op('Muito alto', 'Acima de 7 m, ou pé-direito duplo'),
      op('Não sei', 'Vamos medir na visita técnica')
    ]
  },
  {
    key: 'lugares',
    rail: 'Público',
    title: 'Quantas pessoas o espaço atende?',
    hint: 'A lotação típica, não a máxima do alvará.',
    multi: false,
    options: [
      op('Até 30 pessoas', ''),
      op('30 a 100 pessoas', ''),
      op('100 a 300 pessoas', ''),
      op('300 a 800 pessoas', ''),
      op('Mais de 800 pessoas', '')
    ]
  },
  {
    key: 'existe',
    rail: 'O que já existe',
    title: 'O que já existe instalado?',
    hint: 'Marque o que houver, mesmo que esteja antigo ou com defeito. Reaproveitar reduz o investimento.',
    multi: true,
    options: [
      op('Caixas de som', ''),
      op('Mesa de som', 'Analógica ou digital'),
      op('Microfones', 'Com fio ou sem fio'),
      op('Projetor ou TV', ''),
      op('Iluminação de palco', 'Além das lâmpadas do ambiente'),
      op('Tratamento acústico', 'Espumas, painéis, cortinas técnicas'),
      op('Nada disso', 'Espaço sem equipamento')
    ]
  },
  {
    key: 'quer',
    rail: 'O que orçar',
    title: 'O que você gostaria de orçar?',
    hint: 'Pode marcar mais de um. Se não souber, marque a última opção.',
    multi: true,
    options: [
      op('Tratamento acústico', 'Corrigir eco e inteligibilidade dentro do ambiente'),
      op('Isolamento acústico', 'Impedir que o som entre ou saia'),
      op('Projeto de sonorização', 'Caixas, mesa, microfones, fluxo de sinal'),
      op('Projeto de iluminação', 'Luz cênica e de palco'),
      op('Projeto de projeção ou vídeo', 'Telas, projetores, câmeras, transmissão'),
      op('Consultoria de compra', 'Orientação para comprar sem errar'),
      op('Não sei, quero orientação', 'Diagnosticamos e recomendamos o caminho')
    ]
  },
  {
    key: 'prazo',
    rail: 'Prazo',
    title: 'Quando pretende executar?',
    hint: 'Isso define a fila de projeto, não o preço.',
    multi: false,
    options: [
      op('O quanto antes', 'Obra em andamento ou evento marcado'),
      op('Em 1 a 3 meses', ''),
      op('Em 3 a 6 meses', ''),
      op('Ainda estudando', 'Quero entender o investimento antes de decidir')
    ]
  },
  {
    key: 'docs',
    rail: 'Documentos',
    title: 'Você tem planta ou medidas do espaço?',
    hint: 'Não é obrigatório. Com planta, o projeto começa mais rápido.',
    multi: false,
    options: [
      op('Tenho planta em PDF ou DWG', ''),
      op('Tenho medidas anotadas', 'Largura, comprimento e altura'),
      op('Não tenho nada', 'Fazemos o levantamento'),
      op('Posso medir se me orientarem', 'Enviamos um roteiro simples')
    ]
  },
  {
    key: 'contato',
    rail: 'Contato',
    title: 'Para onde enviamos a resposta?',
    hint: 'Usamos esses dados apenas para responder a esta solicitação.',
    kind: 'contato',
    multi: false,
    options: []
  },
  {
    key: 'revisao',
    rail: 'Revisão',
    title: 'Confira antes de enviar',
    hint: 'Revise o que você informou. Você pode alterar qualquer resposta.',
    kind: 'revisao',
    multi: false,
    options: []
  }
];

/** Faixa interna por frente, em centavos. Nunca exposta ao cliente. */
function faixaFrente(nome) {
  switch (nome) {
    case 'Tratamento acústico':
      return [320_000, 780_000, 'Medição, cálculo de tempo de reverberação e projeto de superfícies absorvedoras.'];
    case 'Isolamento acústico':
      return [380_000, 920_000, 'Cálculo de perda de transmissão e detalhamento construtivo de vedação.'];
    case 'Projeto de sonorização':
      return [280_000, 650_000, 'Dimensionamento de PA, fluxo de sinal, ganho de realimentação e memorial.'];
    case 'Projeto de iluminação':
      return [180_000, 420_000, 'Plano de luz em camadas, potências, circuitos e mapa de canais.'];
    case 'Projeto de projeção ou vídeo':
      return [220_000, 500_000, 'Distâncias, luminância, telas, cabeamento e cadeia de vídeo.'];
    case 'Consultoria de compra':
      return [90_000, 240_000, 'Lista técnica de referência e critérios de escolha por faixa de preço.'];
    default:
      return [250_000, 600_000, 'Diagnóstico técnico com recomendação de escopo e prioridades.'];
  }
}

/** Multiplicador de dimensionamento: a área declarada é o que move o preço. */
function multiplicadorArea(area) {
  if (area.startsWith('Mais de 600')) return 1.9;
  if (area.startsWith('300 a 600')) return 1.5;
  if (area.startsWith('120 a 300')) return 1.2;
  return 1.0;
}

const comoLista = (v) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]);
const texto = (v) => comoLista(v).join(' · ');

function frentesDe(respostas) {
  const escolhas = comoLista(respostas.quer);
  const lista = escolhas.length ? escolhas : ['Não sei, quero orientação'];
  const m = multiplicadorArea(texto(respostas.area));
  return lista.map((nome) => {
    const [lo, hi, desc] = faixaFrente(nome);
    return {
      titulo: nome,
      descricao: desc,
      minimo_centavos: Math.round(lo * m),
      maximo_centavos: Math.round(hi * m)
    };
  });
}

function premissasDe(respostas) {
  const campo = (chave) => texto(respostas[chave]) || '—';
  return [
    { label: 'Uso do espaço', valor: campo('tipo') },
    { label: 'Área declarada', valor: campo('area') },
    { label: 'Pé-direito', valor: campo('altura') },
    { label: 'Lotação típica', valor: campo('lugares') },
    { label: 'Sintomas relatados', valor: campo('dor') },
    { label: 'Infraestrutura existente', valor: campo('existe') },
    { label: 'Documentação', valor: campo('docs') },
    { label: 'Prazo pretendido', valor: campo('prazo') }
  ];
}

/** Sinais que exigem visita ou cuidado antes de fechar valor. */
function alertasDe(respostas) {
  const out = [];
  const quer = comoLista(respostas.quer);
  const dor = comoLista(respostas.dor);
  if (texto(respostas.area).includes('Não sei')) {
    out.push('Área declarada como "não sei" exige visita antes de fechar valor.');
  }
  if (quer.includes('Isolamento acústico') && quer.includes('Tratamento acústico')) {
    out.push('Isolamento e tratamento pedidos juntos: confirmar se há obra civil prevista.');
  }
  if (dor.includes('Vizinhos reclamam')) {
    out.push('Reclamação de vizinhos: verificar exigência legal municipal de ruído.');
  }
  if (quer.includes('Não sei, quero orientação')) {
    out.push('Escopo indefinido: proposta deve começar por diagnóstico pago.');
  }
  return out;
}

/** Real com centavos — o documento comercial mostra os dois dígitos. */
const brl = (centavos) =>
  'R$ ' + (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** A proposta como o cliente e o contrato a veem.
 *
 *  Tudo o que é dinheiro nasce aqui, da soma do escopo: o desconto é aplicado,
 *  não afirmado, e a cláusula 4ª do contrato recebe o mesmo número que estava
 *  na tela quando a pessoa clicou em aceitar. As datas nascem do deslocamento
 *  guardado na proposta, de modo que a validade que o cliente lê é a mesma que
 *  o dono vê expirando no funil. */
/** O plano de pagamento inteiro, derivado do total.
 *
 *  `entrada_pct` a zero devolve o parcelamento simples, em partes iguais.
 *  Acima de zero, o documento vira entrada + N parcelas — 40/30/30 e' o
 *  formato usado, e ele nao cabe num modelo de parcelas iguais.
 *
 *  A ultima parcela absorve o resto da divisao. Sem isso, tres parcelas
 *  arredondadas de um total impar somam um centavo a mais ou a menos que o
 *  total impresso duas linhas acima — e o cliente ve os dois numeros. */
function planoDePagamento(total, entradaPct, parcelas) {
  const entrada = entradaPct > 0 ? Math.round((total * entradaPct) / 100) : 0;
  const restante = total - entrada;
  const n = Math.max(1, parcelas);
  const parcela = Math.round(restante / n);
  const ultima = restante - parcela * (n - 1);

  const linhas = [];
  if (entrada > 0) {
    linhas.push({ rotulo: `Entrada (${entradaPct}%), na assinatura`, valor: entrada });
  }
  for (let i = 0; i < n; i++) {
    const valor = i === n - 1 ? ultima : parcela;
    const dias = entrada > 0 ? (i + 1) * 30 : i * 30;
    const quando = dias === 0 ? 'na assinatura' : `${dias} dias após a assinatura`;
    linhas.push({ rotulo: `Parcela ${i + 1} de ${n}, ${quando}`, valor });
  }
  return { entrada, parcela, ultima, n, linhas };
}

function propostaPublica(p) {
  const bruto = p.escopo.reduce((soma, e) => soma + e.centavos, 0);
  const desconto = Math.round((bruto * p.desconto_pct) / 100);
  const total = bruto - desconto;
  const entradaPct = p.entrada_pct ?? 0;
  const plano = planoDePagamento(total, entradaPct, p.parcelas);
  const parcela = plano.parcela;
  const avista = total - Math.round((total * p.desconto_avista_pct) / 100);

  const enviada = emDias(p.enviada_em_dias);
  const expira = emDias(p.enviada_em_dias + p.validade_dias);

  const pagamento = {
    entrada_pct: entradaPct,
    entrada: brl(plano.entrada),
    entrada_centavos: plano.entrada,
    parcelas: p.parcelas,
    parcela: brl(parcela),
    parcela_centavos: parcela,
    parcela_final: brl(plano.ultima),
    parcela_final_centavos: plano.ultima,
    /// O plano linha a linha: a tela e o PDF imprimem isto, nao recalculam.
    linhas: plano.linhas.map((l) => ({ rotulo: l.rotulo, valor: brl(l.valor), centavos: l.valor })),
    economia_avista: brl(total - avista),
    avista: brl(avista),
    avista_centavos: avista,
    desconto_avista_pct: p.desconto_avista_pct
  };

  /// O aditivo tem valor mesmo sendo cortesia: e' o numero que mede a
  /// gentileza. Sem ele, "cortesia" e' so' uma palavra.
  const aditivo = p.aditivo
    ? {
        titulo: p.aditivo.titulo,
        resumo: p.aditivo.resumo,
        cortesia: p.aditivo.cortesia,
        dimensao: p.aditivo.dimensao,
        condicoes: p.aditivo.condicoes,
        validade_meses: p.aditivo.validade_meses,
        itens: p.aditivo.itens.map((i) => ({ t: i.t, d: i.d, valor: brl(i.centavos) })),
        total: brl(p.aditivo.itens.reduce((soma, i) => soma + i.centavos, 0))
      }
    : null;

  /// A condição que entra no contrato descreve a forma escolhida, não as duas.
  /// Antes do aceite não há forma escolhida, e o contrato não existe ainda.
  const avistaEscolhido = p.forma_pagamento === 'avista';
  const efetivo = avistaEscolhido ? avista : total;
  const parceladoTexto =
    entradaPct > 0
      ? `Pagamento em ${plano.n + 1} vezes: entrada de ${brl(plano.entrada)} (${entradaPct}%) na ` +
        `assinatura e ${plano.n} ${plano.n === 1 ? 'parcela' : 'parcelas'} de ${brl(parcela)}, ` +
        `a cada 30 dias.`
      : `Pagamento em ${plano.n} parcelas de ${brl(parcela)}: a primeira na assinatura e ` +
        (plano.n === 2 ? 'a segunda 30 dias depois.' : 'as demais a cada 30 dias.');
  const condicoes = avistaEscolhido
    ? `Pagamento à vista de ${brl(avista)} na assinatura, já aplicado o desconto de ` +
      `${p.desconto_avista_pct}% sobre o total de ${brl(total)}.`
    : parceladoTexto;

  return {
    id: p.id,
    numero: p.numero ?? p.id,
    instituicao: p.instituicao,
    cidade: p.cidade,
    maps_url: p.maps_url,
    representante: p.representante ?? null,
    titulo: p.titulo ?? null,
    resumo: p.resumo ?? null,
    disciplinas: p.disciplinas ?? null,
    objeto: p.objeto ?? null,
    diagnostico: p.diagnostico ?? [],
    diretrizes: p.diretrizes ?? [],
    criterio_aceite: p.criterio_aceite ?? null,
    entregaveis: p.entregaveis ?? [],
    formato_entrega: p.formato_entrega ?? 'PDF',
    prazo_dias: p.prazo_dias ?? null,
    prazo_condicao: p.prazo_condicao ?? null,
    incluso: p.incluso ?? null,
    nao_incluso: p.nao_incluso ?? null,
    aditivo,
    situacao: p.situacao ?? (p.aceita_em ? 'aceita' : 'enviada'),
    escopo: p.escopo.map((e) => ({ titulo: e.titulo, descricao: e.descricao, valor: brl(e.centavos) })),
    premissas: p.premissas,
    subtotal: brl(bruto),
    desconto_pct: p.desconto_pct,
    desconto_motivo: p.desconto_motivo ?? null,
    desconto: brl(desconto),
    total: brl(total),
    total_centavos: total,
    efetivo: brl(efetivo),
    pagamento,
    condicoes,
    enviada_em: dataBr(enviada),
    expira_em: dataBr(expira),
    validade_dias: p.validade_dias,
    dias_restantes: faltam(expira),
    aceita_em: p.aceita_em,
    forma_pagamento: p.forma_pagamento,
    observacoes: p.observacoes
  };
}

// ---------- o gerador de orçamentos ----------

/** O documento padrão da casa.
 *
 *  Um orçamento não começa numa folha em branco: começa no modelo, e o que se
 *  escreve por cima é só o que muda de cliente para cliente. É por isso que a
 *  proposta sai no mesmo dia da visita — o diagnóstico é do cliente, o resto
 *  do documento já existe. */
const MODELO_PROPOSTA = {
  titulo: 'Projeto integrado de infraestrutura audiovisual',
  disciplinas: 'Acústica, áudio, projeção, iluminação, rede e transmissão',
  objeto:
    'Elaboração de projeto técnico integrado para modernização da infraestrutura ' +
    'audiovisual do espaço, com compatibilização entre as frentes contratadas e ' +
    'integração à instalação elétrica existente.',
  diagnostico: [],
  diretrizes: [
    {
      t: 'Integração antes de equipamento',
      d: 'As frentes são projetadas como um sistema único, não como compras separadas.'
    },
    {
      t: 'Acústica como ponto de partida',
      d: 'Nenhum sistema de som resolve um ambiente não tratado: a acústica define o dimensionamento do áudio.'
    },
    {
      t: 'Operação simples e confiável',
      d: 'Cadeias de sinal enxutas, presets claros e menos pontos de falha.'
    },
    {
      t: 'Otimização do investimento',
      d: 'Especificação de equipamentos disponíveis no mercado nacional, com alternativas por faixa de investimento.'
    }
  ],
  criterio_aceite:
    'O projeto é considerado entregue quando as plantas executivas, o diagrama de fluxo ' +
    'de sinal, o memorial descritivo e a lista técnica das frentes contratadas forem ' +
    'disponibilizados e a sessão de apresentação técnica for realizada.',
  entregaveis: [],
  formato_entrega: 'PDF',
  prazo_dias: 45,
  prazo_condicao: 'Entrega única, após assinatura do contrato e confirmação da primeira parcela.',
  incluso:
    'Sessão de apresentação técnica das frentes contratadas, duas rodadas de revisão ' +
    'solicitadas em até 15 dias da entrega e referências de fornecimento na lista técnica.',
  nao_incluso:
    'Execução de obra, cotação e negociação com fornecedores, fornecimento e instalação de ' +
    'equipamentos, projeto elétrico e estrutural, licenças e a configuração operacional dos sistemas.',
  premissas: [],
  escopo: [],
  desconto_pct: 0,
  desconto_motivo: null,
  entrada_pct: 40,
  parcelas: 2,
  desconto_avista_pct: 5,
  validade_dias: 15,
  aditivo: null
};

/** O próximo número de proposta do ano, sem buraco e sem repetição. */
function proximoNumero() {
  const ano = new Date().getFullYear();
  const usados = dados.propostas
    .map((p) => /^PROP\. (\d+)\/(\d+)$/.exec(p.numero ?? ''))
    .filter((m) => m && Number(m[2]) === ano)
    .map((m) => Number(m[1]));
  const n = (usados.length ? Math.max(...usados) : 0) + 1;
  return { numero: `PROP. ${String(n).padStart(4, '0')}/${ano}`, id: `PRJ-${ano}-${String(n).padStart(4, '0')}` };
}

/** Só o que a lista do painel precisa mostrar — a proposta inteira é grande, e
 *  a lista não desenha nenhum dos textos longos. */
function resumoProposta(p) {
  const pub = propostaPublica(p);
  return {
    id: p.id,
    numero: pub.numero,
    instituicao: p.instituicao,
    cidade: p.cidade,
    titulo: p.titulo ?? null,
    situacao: pub.situacao,
    itens: p.escopo.length,
    total: pub.total,
    total_centavos: pub.total_centavos,
    enviada_em: pub.enviada_em,
    expira_em: pub.expira_em,
    dias_restantes: pub.dias_restantes,
    aceita_em: p.aceita_em,
    /// O link que vai para o cliente, montado num lugar só.
    link: `/proposta?id=${encodeURIComponent(p.id)}`
  };
}

/** Uma proposta nova: o modelo da casa por baixo, o que veio do formulário
 *  por cima, e a numeração e as datas por conta da API. */
function novaProposta(rascunho = {}) {
  const { numero, id } = proximoNumero();
  return {
    ...MODELO_PROPOSTA,
    ...rascunho,
    id,
    numero,
    situacao: 'rascunho',
    /// Rascunho ainda não foi enviado, então a validade ainda não correu.
    enviada_em_dias: 0,
    aceita_em: null,
    forma_pagamento: null,
    observacoes: null
  };
}

/** Campos que o gerador pode reescrever. Tudo o que não estiver aqui — a
 *  numeração, o aceite, a forma de pagamento — é da API, não do formulário. */
const CAMPOS_EDITAVEIS = [
  'instituicao', 'cidade', 'maps_url', 'representante', 'titulo', 'resumo', 'disciplinas',
  'objeto', 'diagnostico', 'diretrizes', 'criterio_aceite', 'entregaveis', 'formato_entrega',
  'prazo_dias', 'prazo_condicao', 'incluso', 'nao_incluso', 'premissas', 'escopo',
  'desconto_pct', 'desconto_motivo', 'entrada_pct', 'parcelas', 'desconto_avista_pct',
  'validade_dias', 'aditivo'
];

/** O que impede uma proposta de sair pela porta.
 *
 *  Vale na criação e no envio: um documento sem cliente, sem escopo ou com um
 *  item de valor zero não é um orçamento incompleto — é um orçamento errado,
 *  e ele sai com o nome da empresa em cima. */
function conferirProposta(p) {
  if (!(p.instituicao ?? '').trim()) throw new ErroApi(422, 'A proposta precisa do nome do cliente');
  if (!Array.isArray(p.escopo) || p.escopo.length === 0) {
    throw new ErroApi(422, 'A proposta precisa de ao menos um item de escopo');
  }
  const vazio = p.escopo.find((e) => !(e.titulo ?? '').trim() || !(e.centavos > 0));
  if (vazio) throw new ErroApi(422, 'Todo item de escopo precisa de título e valor maior que zero');
  if (p.desconto_pct < 0 || p.desconto_pct > 100) throw new ErroApi(422, 'Desconto fora de 0 a 100%');
  if (p.entrada_pct < 0 || p.entrada_pct > 100) throw new ErroApi(422, 'Entrada fora de 0 a 100%');
  if (!(p.parcelas >= 1)) throw new ErroApi(422, 'A proposta precisa de ao menos uma parcela');
}

// ---------- contrato (porte de store.rs::clausulas) ----------

function clausulas(d, proposta) {
  return [
    {
      titulo: 'Cláusula 1ª — Das partes',
      texto:
        `CONTRATADA: 00.000.000 NOME DA CONTRATADA (Garioli Labs), CNPJ 00.000.000/0001-00, MEI, ` +
        `com sede em Cachoeiro de Itapemirim/ES. CONTRATANTE: ${d.razao}, inscrita sob o nº ${d.cnpj}, ` +
        `com sede em ${d.endereco}, representada por ${d.representante}, CPF ${d.cpf_rep}, ` +
        `na qualidade de ${d.cargo}.`
    },
    {
      titulo: 'Cláusula 2ª — Do objeto',
      texto:
        `Prestação de serviços de engenharia de projeto conforme escopo da proposta ${proposta.id} — ` +
        `documento que integra este contrato como anexo e prevalece sobre entendimentos verbais. ` +
        `O objeto é o projeto técnico; não abrange execução de obra, instalação, fornecimento de ` +
        `equipamentos nem responsabilidade por serviços de terceiros.`
    },
    {
      titulo: 'Cláusula 3ª — Do prazo',
      texto:
        'O prazo de entrega começa a contar da confirmação da 1ª parcela e do recebimento integral ' +
        'das informações e acessos necessários, suspendendo-se enquanto pendente obrigação da CONTRATANTE.'
    },
    {
      titulo: 'Cláusula 4ª — Do preço e do pagamento',
      texto:
        `Pelo objeto, a CONTRATANTE pagará ${proposta.efetivo}. ${proposta.condicoes} O atraso implica ` +
        `correção monetária, juros de 1% ao mês e multa de 2%, nos termos do art. 406 do Código Civil.`
    },
    {
      titulo: 'Cláusula 5ª — Da propriedade intelectual',
      texto:
        'Os direitos patrimoniais sobre o projeto permanecem com a CONTRATADA até a quitação integral, ' +
        'nos termos da Lei 9.610/98. Quitado o preço, a CONTRATANTE recebe licença de uso para a ' +
        'finalidade e o local objeto do contrato, sendo vedada a cessão, reprodução ou reuso em outra ' +
        'unidade sem autorização escrita.'
    },
    {
      titulo: 'Cláusula 6ª — Das revisões e do suporte',
      texto:
        'Estão incluídas 2 rodadas de revisão sobre o escopo contratado. Após a entrega, dúvidas de ' +
        'interpretação e de implantação do projeto são esclarecidas sem custo adicional, por prazo ' +
        'indeterminado. Revisões que alterem premissas, área ou disciplinas constituem novo escopo, ' +
        'mediante aditivo.'
    },
    {
      titulo: 'Cláusula 7ª — Da rescisão',
      texto:
        'A rescisão imotivada pela CONTRATANTE após o início dos trabalhos implica multa de 20% sobre ' +
        'o saldo, sem prejuízo do pagamento das etapas já executadas. A inadimplência superior a 15 ' +
        'dias autoriza a suspensão das entregas.'
    },
    {
      titulo: 'Cláusula 8ª — Da execução por terceiros',
      texto:
        'A CONTRATADA não responde por resultado quando a execução divergir do projeto, quando houver ' +
        'substituição de materiais ou equipamentos especificados, ou quando a obra for conduzida sem ' +
        'o acompanhamento técnico previsto em aditivo.'
    },
    {
      titulo: 'Cláusula 9ª — Da proteção de dados e da confidencialidade',
      texto:
        'As partes tratarão os dados pessoais envolvidos conforme a Lei 13.709/2018 (LGPD), ' +
        'limitando-se às finalidades deste contrato, e manterão sigilo recíproco sobre informações ' +
        'técnicas, financeiras e de projeto.'
    },
    {
      titulo: 'Cláusula 10ª — Do portfólio',
      texto:
        'A CONTRATANTE autoriza a CONTRATADA a divulgar imagens do resultado e a citar o projeto em ' +
        'portfólio, ressalvada a possibilidade de revogação por escrito.'
    },
    {
      titulo: 'Cláusula 11ª — Do foro e da assinatura',
      texto:
        'Fica eleito o foro da Comarca de Cachoeiro de Itapemirim/ES. As partes reconhecem a validade ' +
        'da assinatura eletrônica, nos termos da Lei 14.063/2020 e do art. 10, §2º da MP 2.200-2/2001.'
    }
  ];
}

// ---------- painéis ----------

const contatoDe = (s) => [s.email, s.fone].filter((c) => c && c.trim()).join(' · ');

// ---------- o cenário: um livro-razão só ----------

/// Tudo o que o painel do dono mostra sai daqui. Duas decisões valem a leitura:
///
/// 1. **Os prazos são deslocamentos em dias, não datas fixas.** Uma parcela
///    "vencida há nove dias" continua vencida há nove dias numa demonstração
///    aberta daqui a dois anos. Data fixa envelhece; deslocamento, não.
/// 2. **Nenhum KPI é digitado.** "Em negociação", "a receber em 30 dias",
///    "vencido", o acumulado do MEI e o imposto do mês são somas deste livro,
///    feitas na hora da chamada. Mudar o valor de uma parcela aqui muda o topo
///    da tela, a barra do teto e a comparação de regimes de uma vez — não
///    existe número que possa divergir de outro, porque só existe um número.

const DIA = 86_400_000;

function hoje() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Data a `n` dias de hoje; `n` negativo é passado. */
const emDias = (n) => new Date(hoje().getTime() + n * DIA);

const dataBr = (d) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

const diaMes = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;

/** Dias corridos de hoje até `d`. */
const faltam = (d) => Math.round((d.getTime() - hoje().getTime()) / DIA);

/** Dias úteis entre duas datas, sem contar a inicial. Não há calendário de
 *  feriados aqui: o número é de acompanhamento, não de contrato. */
function diasUteis(de, ate) {
  let n = 0;
  const c = new Date(de.getTime());
  while (c < ate) {
    c.setDate(c.getDate() + 1);
    const s = c.getDay();
    if (s !== 0 && s !== 6) n += 1;
  }
  return n;
}

/** Real inteiro, sem centavos: é assim que o painel fala. */
const brlCent = (centavos) => 'R$ ' + Math.round(centavos / 100).toLocaleString('pt-BR');

const NEGOCIO = {
  /// Serviços contratados. `recebido: null` é parcela que ainda não caiu — e é
  /// o vencimento que decide se ela está a vencer ou vencida.
  contratos: [
    {
      cliente: 'Escola Técnica Sul',
      cidade: 'Cachoeiro de Itapemirim · ES',
      escopo: 'Tratamento acústico de três salas de aula',
      modelo: 'v2',
      assinado: -180,
      entregue: -159,
      prazoUteis: 15,
      parcelas: [{ valor: 950_000, vence: -159, recebido: -159 }]
    },
    {
      cliente: 'Estúdio Marés',
      cidade: 'Vitória · ES',
      escopo: 'Sala de gravação · isolamento e tratamento',
      modelo: 'v2',
      assinado: -170,
      entregue: -120,
      prazoUteis: 35,
      parcelas: [
        { valor: 840_000, vence: -152, recebido: -152 },
        { valor: 840_000, vence: -120, recebido: -120 }
      ]
    },
    {
      cliente: 'Teatro Aurora',
      cidade: 'Cachoeiro de Itapemirim · ES',
      escopo: 'Acústica e sonorização · sala de 420 lugares',
      modelo: 'v2',
      assinado: -103,
      entregue: -24,
      prazoUteis: 40,
      parcelas: [
        { valor: 900_000, vence: -54, recebido: -54 },
        { valor: 900_000, vence: -24, recebido: -24 }
      ]
    },
    {
      cliente: 'Centro de Convenções Portal',
      cidade: 'Guarapari · ES',
      escopo: 'Laudo e medição de ruído · NBR 10151',
      modelo: 'v2',
      assinado: -40,
      entregue: -20,
      prazoUteis: 12,
      parcelas: [{ valor: 380_000, vence: -9, recebido: null }]
    },
    {
      cliente: 'Igreja Monte Alto',
      cidade: 'Vila Velha · ES',
      escopo: 'Projeto acústico do salão paroquial',
      modelo: 'v3',
      assinado: -14,
      entregue: null,
      prazoUteis: 30,
      bloqueadoDesde: -5,
      bloqueio: 'aguardando fotos do forro após a remoção do PVC',
      frentes: [
        { titulo: 'Levantamento', progresso: 100 },
        { titulo: 'Cálculo RT60', progresso: 100 },
        { titulo: 'Detalhamento', progresso: 55 },
        { titulo: 'Memorial', progresso: 0 }
      ],
      parcelas: [
        { valor: 600_000, vence: -14, recebido: -14 },
        { valor: 600_000, vence: 21, recebido: null }
      ]
    },
    {
      cliente: 'Auditório Ipê Amarelo',
      cidade: 'Linhares · ES',
      escopo: 'Acústica, sonorização e luz cênica',
      modelo: 'v3',
      assinado: -2,
      entregue: null,
      prazoUteis: 45,
      bloqueadoDesde: null,
      frentes: [
        { titulo: 'Levantamento', progresso: 40 },
        { titulo: 'Cálculo RT60', progresso: 0 },
        { titulo: 'Detalhamento', progresso: 0 },
        { titulo: 'Memorial', progresso: 0 }
      ],
      parcelas: [
        { valor: 800_000, vence: 10, recebido: null },
        { valor: 800_000, vence: 40, recebido: null },
        { valor: 800_000, vence: 70, recebido: null }
      ]
    }
  ],

  /// Propostas que ainda não viraram contrato. Só estas contam como "em
  /// negociação": aceita já é ganho, e entra no funil como contrato.
  propostas: [
    { cliente: 'Colégio Santa Rita', valor: 750_000, etapa: 'Rascunho', desde: -1 },
    { cliente: 'Arena Sul Eventos', valor: 1_620_000, etapa: 'Enviada', desde: -14, validade: 15 },
    {
      /// Sem `valor`: esta é a proposta que o cliente tem aberta, e o valor
      /// dela é o total do escopo — resolvido em `propostasDoFunil`. Uma cópia
      /// aqui é um número que envelhece na primeira vez que o escopo mudar.
      cliente: 'Comunidade Vale Verde',
      etapa: 'Enviada',
      proposta_id: 'PRJ-2026-0091'
    },
    { cliente: 'Centro Cultural Praia Formosa', valor: 1_340_000, etapa: 'Aceita', desde: -1 }
  ],

  /// Cursos e licenças também são receita, e também contam para o teto do MEI —
  /// esquecer disso é como se estoura o limite sem perceber.
  produtos: [
    {
      tipo: 'Curso',
      titulo: 'Acústica prática para igrejas',
      descricao: '6 h · diagnóstico, materiais e erros comuns',
      preco: 29_700,
      base: 84,
      vendasNoAno: 51,
      vendasNoMes: 6
    },
    {
      tipo: 'Curso',
      titulo: 'Operação de mesa digital ao vivo',
      descricao: '8 h · ganho, EQ, dinâmica',
      preco: 39_700,
      base: 51,
      vendasNoAno: 38,
      vendasNoMes: 4
    },
    {
      tipo: 'Licença',
      titulo: 'Calculadora de reverberação',
      descricao: 'RT60 Sabine e Eyring · anual',
      preco: 18_000,
      base: 37,
      vendasNoAno: 24,
      vendasNoMes: 2
    }
  ],

  limiteMei: 8_100_000,
  /// DAS do MEI: valor fixo, não percentual. A alíquota que aparece na tabela é
  /// a carga efetiva sobre a receita do mês, calculada.
  dasMei: 7_600,
  fatorR: 28
};

/** O funil com os valores e prazos resolvidos. A proposta que existe como
 *  documento (a que o cliente abre em /proposta) empresta dela mesma o total e
 *  o prazo de validade; as outras são só linhas do funil. */
function propostasDoFunil() {
  return NEGOCIO.propostas.map((p) => {
    if (!p.proposta_id) return p;
    const doc = dados.propostas.find((x) => x.id === p.proposta_id);
    if (!doc) return p;
    return {
      ...p,
      valor: propostaPublica(doc).total_centavos,
      desde: doc.enviada_em_dias,
      validade: doc.validade_dias
    };
  });
}

/** Parcelas de todos os contratos, com as datas já resolvidas. */
function parcelasDoLivro() {
  return NEGOCIO.contratos.flatMap((c) =>
    c.parcelas.map((p, i) => ({
      cliente: c.cliente,
      ordem: `${i + 1} de ${c.parcelas.length}`,
      valor: p.valor,
      vence: emDias(p.vence),
      recebido: p.recebido === null ? null : emDias(p.recebido)
    }))
  );
}

/** Uma apuração só, lida pelo Financeiro e pelo Planejamento tributário. Com
 *  duas, uma tela dizia 59 % do teto enquanto a outra dizia 119 %. */
function apuracao() {
  const H = hoje();
  const ano = H.getFullYear();
  const mes = H.getMonth();
  const parcelas = parcelasDoLivro();

  const recebidasNoAno = parcelas.filter((p) => p.recebido && p.recebido.getFullYear() === ano);
  const servicosNoAno = recebidasNoAno.reduce((a, p) => a + p.valor, 0);
  const servicosNoMes = recebidasNoAno
    .filter((p) => p.recebido.getMonth() === mes)
    .reduce((a, p) => a + p.valor, 0);

  const produtosNoAno = NEGOCIO.produtos.reduce((a, p) => a + p.preco * p.vendasNoAno, 0);
  const produtosNoMes = NEGOCIO.produtos.reduce((a, p) => a + p.preco * p.vendasNoMes, 0);

  return {
    ano,
    faturadoNoAno: servicosNoAno + produtosNoAno,
    receitaDoMes: servicosNoMes + produtosNoMes,
    limite: NEGOCIO.limiteMei
  };
}

function adminResumo() {
  const H = hoje();
  const ap = apuracao();
  const parcelas = parcelasDoLivro();
  const pendentes = dados.solicitacoes.filter((s) => s.situacao === 'Aguardando análise');

  const vencidas = parcelas.filter((p) => !p.recebido && p.vence < H);
  const aReceber = parcelas.filter((p) => !p.recebido && p.vence >= H);
  const em30 = aReceber.filter((p) => p.vence <= emDias(30));

  const propostas = propostasDoFunil();
  const abertas = propostas.filter((p) => p.etapa === 'Rascunho' || p.etapa === 'Enviada');
  const emNegociacao = abertas.reduce((a, p) => a + p.valor, 0);

  const emExecucao = NEGOCIO.contratos.filter((c) => c.entregue === null);
  const entregues = NEGOCIO.contratos.filter((c) => c.entregue !== null);

  const expiraEm = (p) => faltam(emDias(p.desde + p.validade));
  const enviadas = propostas.filter((p) => p.etapa === 'Enviada');

  const prazo = (n) => (n === 0 ? 'hoje' : n === 1 ? 'amanhã' : `${n} dias`);
  const emPrazo = (n) => (n === 0 ? 'hoje' : n === 1 ? 'amanhã' : `em ${n} dias`);
  /// Para trás no tempo "amanhã" não serve: um rascunho de ontem é "ontem", não
  /// "há amanhã".
  const desdeQuando = (n) => (n === 0 ? 'hoje' : n === 1 ? 'ontem' : `há ${n} dias`);
  const atraso = (p) => -faltam(p.vence);

  /// A fila de hoje não é uma lista escrita: é o que o livro tem de pendente
  /// agora, na ordem em que dói. Se nada estiver vencido, a linha some.
  const acoes = [
    ...pendentes.map((s) => ({
      tipo: 'Triagem',
      texto: `Nova solicitação — ${s.instituicao || s.solicitante}`,
      prazo: 'hoje',
      urgente: true,
      cta: 'Aprovar',
      solicitacao_id: s.id,
      contato: contatoDe(s)
    })),
    ...vencidas.map((p) => ({
      tipo: 'Financeiro',
      texto: `Parcela ${p.ordem} vencida — ${p.cliente}`,
      prazo: prazo(atraso(p)),
      urgente: true,
      cta: 'Cobrar',
      solicitacao_id: null
    })),
    ...enviadas
      .filter((p) => expiraEm(p) <= 3)
      .map((p) => ({
        tipo: 'Proposta',
        texto: `Proposta de ${p.cliente} expira ${emPrazo(expiraEm(p))}`,
        prazo: diaMes(emDias(p.desde + p.validade)),
        urgente: expiraEm(p) <= 1,
        cta: 'Prorrogar',
        solicitacao_id: null
      })),
    ...emExecucao
      .filter((c) => c.bloqueadoDesde !== null)
      .map((c) => ({
        tipo: 'Execução',
        texto: `${c.cliente} parado ${desdeQuando(-c.bloqueadoDesde)} — ${c.bloqueio}`,
        prazo: diaMes(emDias(c.bloqueadoDesde)),
        urgente: -c.bloqueadoDesde >= 5,
        cta: 'Destravar',
        solicitacao_id: null
      }))
  ];

  const totalDe = (c) => c.parcelas.reduce((a, p) => a + p.valor, 0);
  const corridosDe = (c) =>
    diasUteis(emDias(c.assinado), c.bloqueadoDesde === null ? H : emDias(c.bloqueadoDesde));

  return {
    kpis: [
      {
        label: 'Em negociação',
        valor: brlCent(emNegociacao),
        sub: `${abertas.length} propostas abertas`,
        alerta: false
      },
      {
        label: 'A receber em 30 dias',
        valor: brlCent(em30.reduce((a, p) => a + p.valor, 0)),
        sub: `${em30.length} parcelas`,
        alerta: false
      },
      {
        label: 'Vencido',
        valor: brlCent(vencidas.reduce((a, p) => a + p.valor, 0)),
        sub: vencidas.length
          ? `${vencidas.length} parcela${vencidas.length > 1 ? 's' : ''}, ${prazo(Math.max(...vencidas.map(atraso)))}`
          : 'nada em atraso',
        alerta: vencidas.length > 0
      },
      {
        label: 'Solicitações na fila',
        valor: String(pendentes.length),
        sub: 'aguardando sua análise',
        alerta: pendentes.length > 0
      }
    ],
    acoes,
    pipeline: [
      {
        titulo: 'Triagem',
        cards: pendentes.map((s) => ({
          cliente: s.instituicao || s.solicitante,
          valor: `R$ ${Math.round(s.faixa_minima_centavos / 100_000)}–${Math.round(
            s.faixa_maxima_centavos / 100_000
          )}k`,
          idade: 'hoje',
          parado: false,
          contato: contatoDe(s)
        }))
      },
      ...['Rascunho', 'Enviada', 'Aceita'].map((etapa) => ({
        titulo: etapa,
        cards: propostas
          .filter((p) => p.etapa === etapa)
          .map((p) => ({
            cliente: p.cliente,
            valor: brlCent(p.valor),
            idade:
              etapa === 'Enviada'
                ? `expira ${emPrazo(expiraEm(p))}`
                : etapa === 'Aceita'
                  ? 'contrato pendente'
                  : desdeQuando(-p.desde),
            parado: etapa === 'Enviada' && expiraEm(p) <= 3
          }))
      })),
      {
        titulo: 'Em execução',
        cards: emExecucao.map((c) => ({
          cliente: c.cliente,
          valor: brlCent(totalDe(c)),
          idade: `dia ${corridosDe(c)} de ${c.prazoUteis} úteis`,
          parado: c.bloqueadoDesde !== null
        }))
      },
      {
        titulo: 'Entregue',
        cards: entregues.map((c) => ({
          cliente: c.cliente,
          valor: brlCent(totalDe(c)),
          idade: `entregue ${diaMes(emDias(c.entregue))}`,
          parado: false
        }))
      }
    ],
    financeiro: {
      ano: ap.ano,
      mei_faturado: ap.faturadoNoAno,
      mei_limite: ap.limite,
      kpis: [
        {
          label: `Recebido em ${ap.ano}`,
          valor: brlCent(ap.faturadoNoAno),
          sub: `${Math.round((ap.faturadoNoAno / ap.limite) * 100)}% do limite MEI`,
          alerta: ap.faturadoNoAno > ap.limite
        },
        {
          label: 'A receber',
          valor: brlCent(aReceber.reduce((a, p) => a + p.valor, 0)),
          sub: 'contratos assinados',
          alerta: false
        },
        {
          label: 'Vencido',
          valor: brlCent(vencidas.reduce((a, p) => a + p.valor, 0)),
          sub: 'sujeito a multa e juros',
          alerta: vencidas.length > 0
        }
      ],
      /// A tabela mostra o que exige olho: o que venceu, o que vai vencer e as
      /// três últimas entradas. O histórico inteiro não cabe nem ajuda.
      parcelas: [
        ...vencidas,
        ...aReceber.slice().sort((a, b) => a.vence - b.vence),
        ...parcelas
          .filter((p) => p.recebido)
          .sort((a, b) => b.recebido - a.recebido)
          .slice(0, 3)
      ].map((p) => ({
        cliente: p.cliente,
        parcela: p.ordem,
        valor_centavos: p.valor,
        vencimento: dataBr(p.vence),
        situacao: p.recebido ? 'Recebida' : p.vence < H ? 'Vencida' : 'A vencer'
      }))
    },
    execucao: emExecucao.map((c) => {
      const corridos = corridosDe(c);
      const restam = Math.max(0, c.prazoUteis - corridos);
      return {
        titulo: `${c.cliente} · ${c.escopo.toLowerCase()}`,
        prazo:
          c.bloqueadoDesde === null
            ? `dia ${corridos} de ${c.prazoUteis} úteis · entrega ${dataBr(
                emDias(c.assinado + Math.ceil(c.prazoUteis * 1.4))
              )}`
            : `dia ${corridos} de ${c.prazoUteis} úteis · ${restam} dias úteis restantes após destravar`,
        frentes: c.frentes.map((f) => ({
          titulo: f.titulo,
          progresso: f.progresso,
          situacao: f.progresso === 100 ? 'Concluído' : f.progresso > 0 ? 'Em andamento' : 'Não iniciado'
        })),
        bloqueio:
          c.bloqueadoDesde === null
            ? null
            : `${c.bloqueio} — prazo suspenso desde ${diaMes(emDias(c.bloqueadoDesde))}.`
      };
    }),
    produtos: NEGOCIO.produtos.map((p) => ({
      tipo: p.tipo,
      titulo: p.titulo,
      descricao: p.descricao,
      preco: p.tipo === 'Licença' ? `${brlCent(p.preco)}/ano` : brlCent(p.preco),
      volume: `${p.base} ${p.tipo === 'Licença' ? 'ativas' : 'alunos'}`,
      no_ano: `${brlCent(p.preco * p.vendasNoAno)} em ${ap.ano}`
    })),
    modelos: [
      {
        titulo: 'Proposta técnica e comercial',
        descricao: 'Premissas, cronograma e onboarding',
        versao: 'v4',
        data: dataBr(emDias(-1)),
        uso: `${propostas.length} propostas ativas`,
        congelado: false
      },
      {
        titulo: 'Contrato de prestação de serviços',
        descricao: 'Projeto acústico e audiovisual · MEI',
        versao: 'v3',
        data: dataBr(emDias(-1)),
        uso: `${emExecucao.length} contratos vigentes`,
        congelado: false
      },
      {
        titulo: 'Contrato de prestação de serviços',
        descricao: 'Versão anterior, sem suspensão por inadimplência',
        versao: 'v2',
        data: dataBr(emDias(-14)),
        uso: `${NEGOCIO.contratos.filter((c) => c.modelo === 'v2').length} contratos congelados nesta versão`,
        congelado: true
      }
    ]
  };
}

function minhaConta(usuario) {
  /// As datas saem da própria proposta e do próprio contrato, não de uma
  /// segunda lista: a proposta que o cliente vê expirando é a mesma que o dono
  /// vê expirando no funil, e o contrato assinado é o mesmo contrato do
  /// livro-razão. Duas listas divergiriam no primeiro dia em que alguém
  /// mexesse numa delas.
  const aberta = dados.propostas[0];
  const enviadaEm = aberta.enviada_em_dias;
  const validadeDias = aberta.validade_dias;
  const assinadoEm = NEGOCIO.contratos.find((c) => c.cliente === 'Igreja Monte Alto').assinado;

  return {
    nome: usuario.nome,
    iniciais: iniciaisDe(usuario.nome),
    projetos: [
      {
        id: 'PRJ-2026-0091',
        titulo: 'Projeto acústico, sonorização e iluminação cênica',
        meta: `Comunidade Vale Verde · entrega prevista ${dataBr(emDias(enviadaEm + validadeDias + 30))}`,
        status: 'Aguardando seu aceite',
        destaque: true,
        fase: 1,
        cta: 'Ver proposta e aceitar',
        pendencia: `Proposta válida até ${dataBr(emDias(enviadaEm + validadeDias))}.`
      },
      {
        id: 'PRJ-2026-0074',
        titulo: 'Projeto acústico do salão paroquial',
        meta: `Igreja Monte Alto · contrato assinado em ${dataBr(emDias(assinadoEm))}`,
        status: 'Em execução',
        destaque: false,
        fase: 4,
        cta: 'Ver status do projeto',
        pendencia: 'Pendente com você: fotos do forro após a remoção do PVC.'
      }
    ],
    cursos: [
      {
        tag: 'Curso · 6 h',
        titulo: 'Acústica prática para igrejas',
        descricao: 'Diagnóstico de reverberação, escolha de materiais e erros comuns.',
        progresso: 100,
        situacao: 'Concluído · certificado emitido',
        cta: 'Rever'
      },
      {
        tag: 'Curso · 8 h',
        titulo: 'Operação de mesa digital ao vivo',
        descricao: 'Ganho, EQ, dinâmica e gestão de realimentação no culto.',
        progresso: 42,
        situacao: 'Módulo 4 de 9',
        cta: 'Continuar'
      }
    ],
    licencas: [
      {
        titulo: 'Calculadora de reverberação',
        descricao: 'RT60 por Sabine e Eyring',
        chave: 'GLB-RT60-8842-XK',
        vencimento: `Renova ${dataBr(emDias(47))}`,
        situacao: 'Ativa',
        ativa: true
      },
      {
        titulo: 'Gerador de mapa DMX',
        descricao: 'Endereçamento e cenas',
        chave: 'GLB-DMX-0417-BR',
        vencimento: `Expirou ${dataBr(emDias(-85))}`,
        situacao: 'Expirada',
        ativa: false
      }
    ],
    documentos: [
      {
        tipo: 'Proposta',
        titulo: 'Proposta técnica e comercial · PRJ-2026-0091',
        data: dataBr(emDias(enviadaEm)),
        url: '#'
      },
      {
        tipo: 'Contrato',
        titulo: 'Contrato de prestação de serviços · Monte Alto',
        data: dataBr(emDias(assinadoEm)),
        url: '#'
      }
    ]
  };
}

function impostos() {
  const ap = apuracao();
  const excedente = Math.max(0, ap.faturadoNoAno - ap.limite);
  const excedentePct = (excedente / ap.limite) * 100;
  /// Arredonda para real inteiro: centavo em comparação de regime é ruído.
  const imposto = (aliquota) => Math.round((ap.receitaDoMes * aliquota) / 100 / 100) * 100;

  /// A regra que decide a gravidade: até 20% de excedente o desenquadramento
  /// vale a partir de janeiro do ano seguinte; acima de 20%, retroage ao início
  /// do ano — e aí a conta muda de tamanho.
  const retroativo = excedentePct > 20;

  return {
    acumulado_centavos: ap.faturadoNoAno,
    limite_mei_centavos: ap.limite,
    percentual_do_limite: (ap.faturadoNoAno / ap.limite) * 100,
    alerta: excedente
      ? `Teto do MEI ultrapassado em ${brlCent(excedente)} (${excedentePct
          .toFixed(1)
          .replace('.', ',')}% acima). ` +
        (retroativo
          ? 'Excedente acima de 20%: o desenquadramento retroage a janeiro deste ano. '
          : 'Excedente abaixo de 20%: o desenquadramento vale a partir de janeiro do ano que vem. ') +
        'Migrar para ME no Simples e manter o Fator R garante Anexo III (6%) em vez de Anexo V (15,5%).'
      : 'Dentro do teto do MEI. O Anexo III do Simples só passa a valer a pena se o faturamento ultrapassar o limite.',
    regimes: [
      {
        nome: 'MEI · DAS fixo',
        carga_efetiva: Number(((NEGOCIO.dasMei / ap.receitaDoMes) * 100).toFixed(1)),
        imposto_mes_centavos: NEGOCIO.dasMei,
        recomendado: !excedente,
        nota: excedente
          ? `Teto anual de ${brlCent(ap.limite)} já ultrapassado — ${
              retroativo
                ? 'excedente acima de 20% obriga desenquadramento retroativo'
                : 'desenquadramento a partir de janeiro'
            }.`
          : `Dentro do teto anual de ${brlCent(ap.limite)}.`
      },
      {
        nome: 'ME · Simples, Anexo III',
        carga_efetiva: 6.0,
        imposto_mes_centavos: imposto(6.0),
        recomendado: !!excedente,
        nota: 'Exige Fator R ≥ 28% da receita em folha/pró-labore.'
      },
      {
        nome: 'ME · Simples, Anexo V',
        carga_efetiva: 15.5,
        imposto_mes_centavos: imposto(15.5),
        recomendado: false,
        nota: 'É onde a atividade cai se o pró-labore ficar abaixo de 28% da receita.'
      }
    ],
    fator_r_minimo: NEGOCIO.fatorR,
    pro_labore_sugerido_centavos: Math.round((ap.receitaDoMes * NEGOCIO.fatorR) / 100 / 100) * 100
  };
}

// ---------- a API ----------

/** Mesma resposta para e-mail inexistente e senha errada: qualquer diferença
 *  transformaria esta rota num verificador de quais e-mails têm conta. */
const CREDENCIAL_INVALIDA = 'E-mail ou senha incorretos';

function entrarComo(nome, email, papel) {
  const alvo = email.trim().toLowerCase();
  let u = dados.usuarios.find((x) => x.email === alvo);
  if (!u) {
    u = { id: uid(), nome, email: alvo, papel };
    dados.usuarios.push(u);
  }
  dados.sessao = u.id;
  salvar();
  return u;
}

export const api = {
  async entrar(email, senha) {
    await espera();
    // Não há hash a conferir: a demo aceita qualquer senha de 8+ caracteres.
    // O que se preserva é a *forma* da recusa — mesma mensagem, mesmo status.
    if (!email?.includes('@') || (senha ?? '').length < 8) {
      throw new ErroApi(401, CREDENCIAL_INVALIDA);
    }
    const alvo = email.trim().toLowerCase();
    const dono = alvo === EMAIL_DONO;
    const u = entrarComo(dono ? 'Lucas Garioli' : 'Visitante da Demonstração', alvo, dono ? 'dono' : 'cliente');
    registrar('Acesso', `Entrada de ${u.email}`);
    return publico(u);
  },

  async criarConta(nome, email, senha) {
    await espera();
    if ((nome ?? '').trim().length < 3) throw new ErroApi(400, 'Informe seu nome completo');
    if (!email?.includes('@')) throw new ErroApi(400, 'E-mail inválido');
    if ((senha ?? '').length < 8) throw new ErroApi(400, 'A senha precisa de ao menos 8 caracteres');
    const alvo = email.trim().toLowerCase();
    if (dados.usuarios.some((u) => u.email === alvo)) {
      throw new ErroApi(409, 'Já existe uma conta com este e-mail');
    }
    const u = entrarComo(nome.trim(), alvo, alvo === EMAIL_DONO ? 'dono' : 'cliente');
    registrar('Acesso', `Conta criada — ${u.email}`);
    return publico(u);
  },

  async sair() {
    await espera();
    dados.sessao = null;
    salvar();
    return null;
  },

  async eu() {
    await espera();
    return publico(exigeAutenticado());
  },

  async triagemSchema(lang = 'pt') {
    await espera();
    return lang === 'en' ? traduzSchema(SCHEMA) : SCHEMA;
  },

  async criarSolicitacao({ respostas, contato, criar_conta }) {
    await espera();
    if (!contato?.nome?.trim() || !contato?.email?.trim()) {
      throw new ErroApi(400, 'Nome e e-mail são obrigatórios');
    }

    const frentes = frentesDe(respostas ?? {});
    dados.sequencia += 1;
    const protocolo = `SOL-${new Date().getFullYear()}-${String(147 + dados.sequencia).padStart(4, '0')}`;
    const id = uid();

    dados.solicitacoes.unshift({
      id,
      protocolo,
      criada_em: agora(),
      situacao: 'Aguardando análise',
      solicitante: contato.nome,
      instituicao: contato.org ?? '',
      cidade: contato.cidade ?? '',
      email: contato.email,
      fone: contato.fone ?? '',
      premissas: premissasDe(respostas ?? {}),
      frentes,
      faixa_minima_centavos: frentes.reduce((a, f) => a + f.minimo_centavos, 0),
      faixa_maxima_centavos: frentes.reduce((a, f) => a + f.maximo_centavos, 0),
      alertas: alertasDe(respostas ?? {})
    });
    salvar();
    registrar('Triagem', `Solicitação ${protocolo} recebida — ${contato.nome}`);

    return { id, protocolo, conta_criada: !!criar_conta };
  },

  async listarSolicitacoes() {
    await espera();
    exigeDono();
    return dados.solicitacoes;
  },

  async aprovarSolicitacao(id) {
    await espera();
    const dono = exigeDono();
    const s = dados.solicitacoes.find((x) => x.id === id || x.protocolo === id);
    if (!s) throw new ErroApi(404, 'Solicitação não encontrado');
    s.situacao = 'Proposta gerada';
    salvar();
    registrar('Aprovação', `Rascunho de ${s.protocolo} aprovado por ${dono.email} — proposta gerada`);
    return s;
  },

  async recusarSolicitacao(id, motivo) {
    await espera();
    const dono = exigeDono();
    const s = dados.solicitacoes.find((x) => x.id === id);
    if (!s) throw new ErroApi(404, 'Solicitação não encontrado');
    s.situacao = 'Recusada';
    salvar();
    registrar('Recusa', `Solicitação ${s.protocolo} recusada por ${dono.email}${motivo ? ` — ${motivo}` : ''}`);
    return null;
  },

  async proposta(id) {
    await espera();
    const p = dados.propostas.find((x) => x.id === id);
    if (!p) throw new ErroApi(404, 'Proposta não encontrada');
    return propostaPublica(p);
  },

  // ----- gerador de orçamentos (só o dono) -----

  async listarPropostas() {
    await espera();
    exigeDono();
    return dados.propostas.map(resumoProposta);
  },

  /** O modelo da casa, para o formulário abrir preenchido. */
  async modeloProposta() {
    await espera();
    exigeDono();
    return JSON.parse(JSON.stringify(MODELO_PROPOSTA));
  },

  /** Os números de um rascunho, sem gravar nada.
   *
   *  O formulário precisa mostrar total, desconto e plano de pagamento
   *  enquanto se digita. Se ele calculasse isso por conta própria, existiriam
   *  duas contas para o mesmo dinheiro — e um dia elas discordariam na frente
   *  do cliente. Então quem calcula a prévia é o mesmo código que emite o
   *  documento. */
  async previaProposta(rascunho = {}) {
    exigeDono();
    const p = { ...MODELO_PROPOSTA, ...rascunho, id: 'previa', numero: 'prévia', enviada_em_dias: 0 };
    if (!Array.isArray(p.escopo) || p.escopo.length === 0) return null;
    return propostaPublica(p);
  },

  async criarProposta(rascunho = {}) {
    await espera();
    const dono = exigeDono();
    const p = novaProposta(rascunho);
    conferirProposta(p);
    dados.propostas.unshift(p);
    salvar();
    registrar('Proposta', `Proposta ${p.numero} criada para ${p.instituicao} por ${dono.email}`);
    return resumoProposta(p);
  },

  async salvarProposta(id, campos = {}) {
    await espera();
    exigeDono();
    const p = dados.propostas.find((x) => x.id === id);
    if (!p) throw new ErroApi(404, 'Proposta não encontrada');
    /// Proposta aceita não se edita: o contrato foi gerado a partir dela, e
    /// mexer na origem depois do aceite é reescrever o que a outra parte
    /// assinou. Para mudar o escopo existe aditivo, não edição silenciosa.
    if (p.aceita_em) throw new ErroApi(409, 'Proposta já aceita não pode ser editada');
    for (const k of CAMPOS_EDITAVEIS) {
      if (k in campos) p[k] = campos[k];
    }
    conferirProposta(p);
    salvar();
    registrar('Proposta', `Proposta ${p.numero} editada`);
    return resumoProposta(p);
  },

  async enviarProposta(id) {
    await espera();
    const dono = exigeDono();
    const p = dados.propostas.find((x) => x.id === id);
    if (!p) throw new ErroApi(404, 'Proposta não encontrada');
    if (p.aceita_em) throw new ErroApi(409, 'Proposta já aceita');
    conferirProposta(p);
    p.situacao = 'enviada';
    /// A validade passa a correr a partir de agora, não da criação.
    p.enviada_em_dias = 0;
    salvar();
    registrar('Proposta', `Proposta ${p.numero} enviada a ${p.instituicao} por ${dono.email}`, true);
    return resumoProposta(p);
  },

  async aceitarProposta(id, { observacoes, forma } = {}) {
    await espera();
    const p = dados.propostas.find((x) => x.id === id);
    if (!p) throw new ErroApi(404, 'Proposta não encontrada');
    /// A forma de pagamento é escolhida no aceite, não deixada em aberto: o
    /// contrato precisa dizer um valor, e um documento que oferece dois é um
    /// documento que ainda vai ser discutido.
    if (forma !== 'parcelado' && forma !== 'avista') {
      throw new ErroApi(422, 'Escolha a forma de pagamento antes de aceitar');
    }
    p.aceita_em = agora();
    p.forma_pagamento = forma;
    p.observacoes = observacoes?.trim() ? observacoes : null;
    salvar();
    const publica = propostaPublica(p);
    registrar(
      'Aceite',
      `Proposta ${id} aceita ${observacoes?.trim() ? 'com observações' : 'sem ressalvas'} — ` +
        `${forma === 'avista' ? 'pagamento à vista' : `${publica.pagamento.parcelas} parcelas`} de ` +
        `${forma === 'avista' ? publica.pagamento.avista : publica.pagamento.parcela}`,
      true
    );
    return publica;
  },

  async dadosContrato(id, d) {
    await espera();
    const p = dados.propostas.find((x) => x.id === id);
    if (!p) throw new ErroApi(404, 'Proposta não encontrada');
    if (!p.aceita_em) throw new ErroApi(409, 'A proposta precisa ser aceita antes do contrato');
    /// Validação de formulário no navegador é conveniência; a barreira é aqui.
    /// Um contrato sai com a parte identificada pelo que for gravado neste
    /// campo, e um CNPJ inválido só aparece quando for preciso cobrar.
    if (!cpfOuCnpjValido(d.cnpj)) throw new ErroApi(422, 'CNPJ ou CPF inválido');
    if (!cpfValido(d.cpf_rep)) throw new ErroApi(422, 'CPF do representante inválido');
    if (!emailValido(d.email)) throw new ErroApi(422, 'E-mail inválido');

    const contrato = {
      id: uid(),
      numero: `CT-${id.replace(/^PRJ-/, '')}`,
      proposta_id: id,
      clausulas: clausulas(d, propostaPublica(p)),
      pdf_url: `/api/contratos/${id}/pdf`,
      whatsapp_url: 'https://wa.me/5500000000000',
      assinado_em: null,
      provedor: null
    };
    dados.contratos.unshift(contrato);
    salvar();
    registrar('Contrato', `Contrato ${contrato.numero} gerado para ${d.razao}`);
    return contrato;
  },

  async contrato(id) {
    await espera();
    const c = dados.contratos.find((x) => x.id === id || x.numero === id);
    if (!c) throw new ErroApi(404, 'Contrato não encontrado');
    return c;
  },

  async assinarContrato(id, { provedor }) {
    await espera();
    const c = dados.contratos.find((x) => x.id === id || x.numero === id);
    if (!c) throw new ErroApi(404, 'Contrato não encontrado');
    c.assinado_em = agora();
    c.provedor = provedor;
    salvar();
    registrar('Assinatura', `Contrato ${c.numero} assinado via ${provedor}`, true);
    return c;
  },

  async minhaConta() {
    await espera();
    return minhaConta(exigeAutenticado());
  },

  async adminResumo() {
    await espera();
    exigeDono();
    return adminResumo();
  },

  async auditoria() {
    await espera();
    exigeDono();
    return dados.auditoria;
  },

  async impostos() {
    await espera();
    exigeDono();
    return impostos();
  }
};
