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

/** E-mail que entra como dono. Qualquer outro entra como cliente. */
export const EMAIL_DONO = 'demo@exemplo.com';

const CHAVE = 'gl_demo_v1';
const LATENCIA = 180;

// ---------- utilidades ----------

const uid = () =>
  globalThis.crypto?.randomUUID?.() ??
  `id-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;

const agora = () => new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

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
    solicitacoes: [],
    propostas: [
      {
        id: 'PRJ-2026-0091',
        instituicao: 'Comunidade Vale Verde',
        cidade: 'Vila Nova · ES',
        maps_url: 'https://www.google.com/maps/search/?api=1&query=Comunidade+Vale+Verde+ES',
        escopo: [
          {
            titulo: 'Projeto acústico',
            descricao: 'Medição, cálculo de RT60 e projeto de tratamento com reforma do forro.',
            valor: 'R$ 6.000,00'
          },
          {
            titulo: 'Projeto de sonorização',
            descricao: 'Dimensionamento de PA, fluxo de sinal e memorial para compra.',
            valor: 'R$ 3.000,00'
          },
          {
            titulo: 'Iluminação cênica básica',
            descricao: 'Plano de luz em camadas, circuitos e mapa de canais.',
            valor: 'R$ 2.500,00'
          }
        ],
        premissas: [
          { label: 'Área declarada', valor: '120 a 300 m²' },
          { label: 'Lotação típica', valor: 'cerca de 300 lugares' },
          { label: 'Acabamentos', valor: 'piso cerâmico, alvenaria pintada, forro de PVC' },
          { label: 'Prazo de entrega', valor: '30 dias úteis após 1ª parcela' },
          { label: 'Revisões incluídas', valor: '2 rodadas' }
        ],
        total: 'R$ 10.000,00',
        condicoes:
          'Desconto de 10% aplicado. 2 parcelas de R$ 5.175,00 ou R$ 9.832,50 à vista. Valores ainda sujeitos a negociação.',
        validade: '15 dias a contar do envio',
        aceita_em: null,
        observacoes: null
      }
    ],
    contratos: [],
    auditoria: [
      {
        id: uid(),
        quando: agora(),
        tipo: 'Envio',
        evento: 'Proposta PRJ-2026-0091 enviada por e-mail e WhatsApp',
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
    if (cru) dados = JSON.parse(cru);
  } catch {
    // Aba anônima, storage bloqueado ou JSON de uma versão anterior: a demo
    // recomeça da semente, que é um estado perfeitamente válido.
  }
}

function salvar() {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(dados));
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

const op = (val, desc) => ({ val, desc });

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
        `Pelo objeto, a CONTRATANTE pagará ${proposta.total}. ${proposta.condicoes} O atraso implica ` +
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

function adminResumo() {
  const pendentes = dados.solicitacoes.filter((s) => s.situacao === 'Aguardando análise');

  const acoes = pendentes.map((s) => ({
    tipo: 'Triagem',
    texto: `Nova solicitação — ${s.instituicao || s.solicitante}`,
    prazo: 'hoje',
    urgente: true,
    cta: 'Aprovar',
    solicitacao_id: s.id,
    contato: contatoDe(s)
  }));

  acoes.push(
    {
      tipo: 'Financeiro',
      texto: 'Parcela 2 vencida — Igreja Monte Alto',
      prazo: '9 dias',
      urgente: true,
      cta: 'Cobrar',
      solicitacao_id: null
    },
    {
      tipo: 'Proposta',
      texto: 'Proposta PRJ-2026-0091 expira em 3 dias',
      prazo: '09/09',
      urgente: false,
      cta: 'Prorrogar',
      solicitacao_id: null
    }
  );

  return {
    kpis: [
      { label: 'Em negociação', valor: 'R$ 40.000', sub: '5 propostas abertas', alerta: false },
      { label: 'A receber em 30 dias', valor: 'R$ 12.000', sub: '4 parcelas', alerta: false },
      { label: 'Vencido', valor: 'R$ 2.500', sub: '1 parcela, 9 dias', alerta: true },
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
      { titulo: 'Rascunho', cards: [] },
      {
        titulo: 'Enviada',
        cards: [
          { cliente: 'Comunidade Vale Verde', valor: 'R$ 10.000', idade: 'expira em 3 dias', parado: true }
        ]
      },
      {
        titulo: 'Aceita',
        cards: [
          { cliente: 'Auditório Ipê Amarelo', valor: 'R$ 24.000', idade: 'contrato pendente', parado: false }
        ]
      },
      {
        titulo: 'Em execução',
        cards: [{ cliente: 'Igreja Monte Alto', valor: 'R$ 4.500', idade: 'dia 18 de 30', parado: false }]
      },
      {
        titulo: 'Entregue',
        cards: [{ cliente: 'Teatro Aurora', valor: 'R$ 9.800', idade: 'entregue 02/08', parado: false }]
      }
    ],
    financeiro: {
      ano: 2026,
      mei_faturado: 4_800_000,
      mei_limite: 8_100_000,
      kpis: [
        { label: 'Recebido em 2026', valor: 'R$ 48.000', sub: '59% do limite MEI', alerta: false },
        { label: 'A receber', valor: 'R$ 20.000', sub: 'contratos assinados', alerta: false },
        { label: 'Vencido', valor: 'R$ 2.500', sub: 'sujeito a multa e juros', alerta: true }
      ],
      parcelas: [
        {
          cliente: 'Igreja Monte Alto',
          parcela: '2 de 2',
          valor_centavos: 250_000,
          vencimento: '16/08/2026',
          situacao: 'Vencida'
        },
        {
          cliente: 'Auditório Ipê Amarelo',
          parcela: '1 de 3',
          valor_centavos: 800_000,
          vencimento: '05/09/2026',
          situacao: 'A vencer'
        },
        {
          cliente: 'Teatro Aurora',
          parcela: '2 de 2',
          valor_centavos: 500_000,
          vencimento: '02/08/2026',
          situacao: 'Recebida'
        },
        {
          cliente: 'Aditivo técnico — Auditório Ipê Amarelo',
          parcela: 'cortesia',
          valor_centavos: 0,
          vencimento: '—',
          situacao: 'Isento'
        }
      ]
    },
    execucao: [
      {
        titulo: 'Igreja Monte Alto · projeto acústico',
        prazo: 'dia 18 de 30 úteis · entrega 11/09/2026',
        frentes: [
          { titulo: 'Levantamento', progresso: 100, situacao: 'Concluído' },
          { titulo: 'Cálculo RT60', progresso: 100, situacao: 'Concluído' },
          { titulo: 'Detalhamento', progresso: 55, situacao: 'Em andamento' },
          { titulo: 'Memorial', progresso: 0, situacao: 'Não iniciado' }
        ],
        bloqueio: 'aguardando fotos do forro após remoção do PVC — prazo suspenso desde 21/08.'
      }
    ],
    produtos: [
      {
        tipo: 'Curso',
        titulo: 'Acústica prática para igrejas',
        descricao: '6 h · diagnóstico, materiais e erros comuns',
        preco: 'R$ 297',
        volume: '84 alunos'
      },
      {
        tipo: 'Curso',
        titulo: 'Operação de mesa digital ao vivo',
        descricao: '8 h · ganho, EQ, dinâmica',
        preco: 'R$ 397',
        volume: '51 alunos'
      },
      {
        tipo: 'Licença',
        titulo: 'Calculadora de reverberação',
        descricao: 'RT60 Sabine e Eyring · anual',
        preco: 'R$ 180/ano',
        volume: '37 ativas'
      }
    ],
    modelos: [
      {
        titulo: 'Proposta técnica e comercial',
        descricao: 'Premissas, cronograma e onboarding',
        versao: 'v4',
        data: '25/08/2026',
        uso: '5 propostas ativas',
        congelado: false
      },
      {
        titulo: 'Contrato de prestação de serviços',
        descricao: 'Projeto acústico e audiovisual · MEI',
        versao: 'v3',
        data: '25/08/2026',
        uso: '3 contratos vigentes',
        congelado: false
      },
      {
        titulo: 'Contrato de prestação de serviços',
        descricao: 'Versão anterior, sem suspensão por inadimplência',
        versao: 'v2',
        data: '12/08/2026',
        uso: '1 contrato congelado nesta versão',
        congelado: true
      }
    ]
  };
}

function minhaConta(usuario) {
  return {
    nome: usuario.nome,
    iniciais: iniciaisDe(usuario.nome),
    projetos: [
      {
        id: 'PRJ-2026-0091',
        titulo: 'Projeto acústico, sonorização e iluminação cênica',
        meta: 'Comunidade Vale Verde · entrega prevista 14/10/2026',
        status: 'Aguardando seu aceite',
        destaque: true,
        fase: 1,
        cta: 'Ver proposta e aceitar',
        pendencia: 'Proposta válida até 09/09/2026.'
      },
      {
        id: 'PRJ-2026-0074',
        titulo: 'Projeto acústico do salão paroquial',
        meta: 'Igreja Monte Alto · contrato assinado em 12/08/2026',
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
        vencimento: 'Renova 12/10/2026',
        situacao: 'Ativa',
        ativa: true
      },
      {
        titulo: 'Gerador de mapa DMX',
        descricao: 'Endereçamento e cenas',
        chave: 'GLB-DMX-0417-BR',
        vencimento: 'Expirou 02/06/2026',
        situacao: 'Expirada',
        ativa: false
      }
    ],
    documentos: [
      {
        tipo: 'Proposta',
        titulo: 'Proposta técnica e comercial · PRJ-2026-0091',
        data: '25/08/2026',
        url: '#'
      },
      {
        tipo: 'Contrato',
        titulo: 'Contrato de prestação de serviços · Monte Alto',
        data: '12/08/2026',
        url: '#'
      }
    ]
  };
}

function impostos() {
  const LIMITE_MEI = 8_100_000;
  const ACUMULADO = 9_600_000;
  const RECEITA_MES = 1_800_000;
  const FATOR_R = 28.0;
  const parcela = (aliquota) => Math.trunc((RECEITA_MES * aliquota) / 100);

  return {
    acumulado_centavos: ACUMULADO,
    limite_mei_centavos: LIMITE_MEI,
    percentual_do_limite: (ACUMULADO / LIMITE_MEI) * 100,
    alerta:
      'Acumulado acima do teto do MEI. Migrar para ME no Simples e manter o Fator R garante ' +
      'Anexo III (6%) em vez de Anexo V (15,5%).',
    regimes: [
      {
        nome: 'MEI · DAS fixo',
        carga_efetiva: 0.4,
        imposto_mes_centavos: 7_600,
        recomendado: false,
        nota:
          'Teto anual de R$ 81 mil já ultrapassado — excedente acima de 20% obriga ' +
          'desenquadramento retroativo.'
      },
      {
        nome: 'ME · Simples, Anexo III',
        carga_efetiva: 6.0,
        imposto_mes_centavos: parcela(6.0),
        recomendado: true,
        nota: 'Exige Fator R ≥ 28% da receita em folha/pró-labore.'
      },
      {
        nome: 'ME · Simples, Anexo V',
        carga_efetiva: 15.5,
        imposto_mes_centavos: parcela(15.5),
        recomendado: false,
        nota: 'É onde a atividade cai se o pró-labore ficar abaixo de 28% da receita.'
      }
    ],
    fator_r_minimo: FATOR_R,
    pro_labore_sugerido_centavos: Math.trunc((RECEITA_MES * FATOR_R) / 100)
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

  async triagemSchema() {
    await espera();
    return SCHEMA;
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
    if (!p) throw new ErroApi(404, 'Proposta não encontrado');
    return p;
  },

  async aceitarProposta(id, { observacoes } = {}) {
    await espera();
    const p = dados.propostas.find((x) => x.id === id);
    if (!p) throw new ErroApi(404, 'Proposta não encontrado');
    p.aceita_em = agora();
    p.observacoes = observacoes?.trim() ? observacoes : null;
    salvar();
    registrar(
      'Aceite',
      `Proposta ${id} aceita ${observacoes?.trim() ? 'com observações' : 'sem ressalvas'}`,
      true
    );
    return p;
  },

  async dadosContrato(id, d) {
    await espera();
    const p = dados.propostas.find((x) => x.id === id);
    if (!p) throw new ErroApi(404, 'Proposta não encontrado');
    if (!p.aceita_em) throw new ErroApi(409, 'A proposta precisa ser aceita antes do contrato');

    const contrato = {
      id: uid(),
      numero: `CT-${id.replace(/^PRJ-/, '')}`,
      proposta_id: id,
      clausulas: clausulas(d, p),
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
