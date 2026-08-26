/// The whole site in English.
///
/// Same shape as `pt.js`, key by key — the page components never branch on
/// language, they just read the object they are handed. Numbers come from
/// `desenhos/projeto.js` (the module that draws the sheets) and are formatted
/// here with the English decimal point instead of the Portuguese comma.
import {
  sala, lugares, cobertura, sti, maiorDistancia, verificacoes
} from '../desenhos/projeto.js';
import { demonstracao, empresa } from '../identidade.js';

const fmt = {
  milhar: (n) => n.toLocaleString('en-US'),
  dec: (n, casas = 2) => n.toFixed(casas)
};

export default {
  codigo: 'en',
  htmlLang: 'en',
  ogLocale: 'en_US',
  nome: 'English',
  rotulo: 'EN',
  trocarPara: 'View the site in Portuguese',

  meta: {
    titulo: 'Acoustic design, sound and lighting engineering | Garioli Labs',
    descricao:
      'Acoustic and audiovisual engineering for churches, auditoriums, theatres and ' +
      'studios: room acoustics, sound isolation, PA design, stage lighting and video. ' +
      'Everything calculated and simulated before anything is bought. Remote worldwide.',
    palavras:
      'acoustic design, room acoustics, sound isolation, PA system design, church sound ' +
      'system, auditorium acoustics, stage lighting design, AV design, acoustic ' +
      'engineering, Brazil',
    imagemAlt:
      'Garioli Labs — acoustics, sound, image and light, over the fan of rows ' +
      'of an auditorium'
  },

  nav: {
    aviso: 'Resonance in development — join the waiting list, free of charge',
    avisoLink: 'Contact',
    inicio: 'Go to the home page',
    secoesRotulo: 'Site sections',
    idiomaRotulo: 'Language',
    entrar: 'Sign in',
    orcamento: 'Request a quote',
    secoes: [
      { id: 'servicos', rotulo: 'Services' },
      { id: 'processo', rotulo: 'Process' },
      { id: 'caso', rotulo: 'Case study' },
      { id: 'software', rotulo: 'Software' },
      { id: 'ensino', rotulo: 'Training' },
      { id: 'sobre', rotulo: 'About' },
      { id: 'duvidas', rotulo: 'FAQ' },
      { id: 'contato', rotulo: 'Contact' }
    ]
  },

  rodape: {
    servicosRotulo: 'Services',
    servicos: ['Room acoustics', 'Sound systems', 'Stage lighting', 'Projection and video'],
    acessoRotulo: 'Access',
    acessos: [
      { href: '/orcamento', rotulo: 'Request a quote' },
      { href: '/conta', rotulo: 'My account' },
      { href: '/proposta', rotulo: 'Proposal portal' },
      { href: '/admin', rotulo: 'Administration' }
    ],
    contatoRotulo: 'Contact',
    cnpjRotulo: 'Company ID'
  },

  hero: {
    titulo: 'Sound you understand. Light that makes sense.',
    sub:
      'Acoustics, sound, lighting and video design for churches, auditoriums and studios. ' +
      'Calculated before it is bought — so the money is spent once, on what fixes the room.',
    cta: 'Request a quote',
    ctaSecundario: 'How it works'
  },

  stats: [
    { v: '12+', t: 'years of practice in audio, image and design' },
    { v: '4', t: 'disciplines integrated in a single document' },
    { v: 'RT60', t: 'Sabine and Eyring calculated before anything is bought' },
    { v: '2 days', t: 'to answer a quote request' }
  ],

  servicos: {
    kicker: 'Services',
    titulo: 'Engineering applied to what you hear and see',
    itens: [
      { n: '01', t: 'Room acoustics', d: 'Measurement, reverberation time calculation and design of absorbing and diffusing surfaces — using materials that actually exist on the local market.' },
      { n: '02', t: 'Sound isolation', d: 'Transmission loss, construction detailing and coordination with the civil works, so sound neither leaks in nor out.' },
      { n: '03', t: 'Sound system design', d: 'PA sizing, coverage, signal flow, gain before feedback and a written specification for purchase and installation.' },
      { n: '04', t: 'Stage lighting', d: 'Layered lighting plot, power, circuits, channel map and scenes — designed for the camera as well as the room.' },
      { n: '05', t: 'Projection and video', d: 'Projector versus LED wall, throw distances, luminance, screens, cabling and the streaming chain.' },
      { n: '06', t: 'Purchase consulting', d: 'A reference equipment list and selection criteria by price bracket. No supplier commission — the recommendation is technical.' }
    ]
  },

  processo: {
    kicker: 'Process',
    titulo: 'From first contact to a finished room',
    itens: [
      { n: '01', t: 'Screening', d: 'You answer plain questions about the space. No jargon, no commitment.' },
      { n: '02', t: 'Analysis', d: 'An engineer reads everything and says whether information, photos or a site visit are missing.' },
      { n: '03', t: 'Proposal', d: 'Scope, assumptions, schedule and price, valid for 15 days.' },
      { n: '04', t: 'Contract', d: 'Acceptance and electronic signature through Gov.br, on the same terms as the proposal.' },
      { n: '05', t: 'Delivery', d: 'PDF documents and follow-up through your account — with implementation questions answered at no cost.' }
    ]
  },

  caso: {
    kicker: 'Case study',
    titulo: 'Nobody praises the audio when it is right. That is the standard.',
    resumo:
      `A ${fmt.milhar(lugares.total)}-seat temple — fan-shaped floor and balcony — rebuilt ` +
      'in software before anything was bought. Eight checks on that one model decided what ' +
      'went into the equipment list and, above all, what was left out of it.',
    nota: demonstracao
      ? 'Demonstration case study. The figures come from this model’s calculation report — ' +
        'they do not represent an identifiable client.'
      : 'Reference project. The figures are the ones in the calculation report.',
    salaRotulo: 'The room',
    analisesRotulo: 'The checks that decided the design',
    pranchasRotulo: 'The drawings for this project',
    numeros: [
      { v: fmt.milhar(lugares.total), t: 'seats in the case study' },
      { v: `${fmt.milhar(sala.volume)} m³`, t: 'modelled volume' },
      { v: `${fmt.dec(sala.t30Calculado)} s`, t: `T30 calculated · ${fmt.dec(sala.t30Alvo)} s target` },
      { v: fmt.dec(sti.ultima, 2), t: 'STI at the most distant seat' },
      { v: String(verificacoes.length), t: 'checks: sound, image, light and streaming' }
    ],
    sala: [
      { k: 'Floor area', v: `${fmt.milhar(sala.area)} m²` },
      { k: 'Ceiling height', v: `${fmt.dec(sala.alturaFundo)} to ${fmt.dec(sala.alturaProscenio)} m` },
      { k: 'Background noise', v: sala.ruidoFundo },
      { k: 'Max. distance', v: `${fmt.dec(maiorDistancia.valor)} m` }
    ],
    analises: [
      {
        norma: 'ISO 3382-2',
        t: 'Reverberation by band',
        d: `T30 of ${fmt.dec(sala.t30Calculado)} s against a ${fmt.dec(sala.t30Alvo)} s target, with the room occupied. The figure comes from the α·S sum of every surface in the design, not from an estimate.`
      },
      {
        norma: 'SPL · 4 kHz',
        t: 'Sound coverage',
        d: `Level computed seat by seat: ${fmt.dec(cobertura.variacao, 1)} dB between the loudest and the quietest, and ${fmt.dec(cobertura.faixa90, 1)} dB across 90 % of the seats.`
      },
      {
        norma: 'IEC 60268-16',
        t: 'Intelligibility (STI)',
        d: `From ${fmt.dec(sti.primeira, 2)} in the front row to ${fmt.dec(sti.ultima, 2)} in the last balcony row — above 0.60 everywhere in the audience, off-axis seats included.`
      }
    ]
  },

  entregas: {
    kicker: 'Deliverables',
    titulo: 'The finished design — and what stays with you',
    itens: [
      { tipo: 'Document', t: 'Dimensioned drawings', d: 'Location of treatment, sources, rigging and infrastructure, dimensioned so the site can build from them.' },
      { tipo: 'Document', t: 'Calculation report', d: 'Assumptions, coefficients, results by octave band and the technical reason behind every choice.' },
      { tipo: 'Document', t: 'Signal diagrams', d: 'The full audio and video chain, point to point, with gains and connector types.' },
      { tipo: 'Field', t: 'Commissioning', d: 'On-site alignment, verification measurements and training for the team that will run it.' }
    ]
  },

  software: {
    kicker: 'Software',
    titulo: 'Every hard project leaves a tool behind it',
    sub:
      'What starts as an emergency spreadsheet on a real project ends up as a program. ' +
      'Each tool is born from a bottleneck that showed up here first — and ships with its ' +
      'own documentation and licence.',
    itens: [
      { nome: 'Resonance', estado: 'In development', d: 'Geometric modelling, reverberation by band and a calculation report generated straight from the model — the tool used in the case study on this page.' },
      { nome: 'Roadmap', estado: 'Under study', d: 'New design and automation tools born from the bottlenecks of daily work.' },
      { nome: 'Bespoke', estado: 'On request', d: 'Dedicated development for your office’s workflow, with documentation and support.' }
    ]
  },

  ensino: {
    kicker: 'Training',
    titulo: 'What Garioli Labs learns does not stay inside the project.',
    sub: 'Written material, graded exercises and video — in your account, with progress tracked.',
    cta: 'Create my account',
    itens: [
      { tipo: 'Written', t: 'Study material', d: 'Technical handbooks on acoustics, sound systems and design, written to be looked up again later.' },
      { tipo: 'Practice', t: 'Online exercises', d: 'Real problems solved step by step, with correction and tracked progress.' },
      { tipo: 'Video', t: 'Recorded lessons', d: 'Demonstrations in the field and in software, from diagnosis to final system alignment.' }
    ]
  },

  sobre: {
    kicker: 'About',
    titulo: 'Who answers for the projects',
    paragrafos: [
      `Garioli Labs is an acoustic and audiovisual engineering practice in ${empresa.cidadeSimples}, Brazil. It serves people who need a serious design and refuse to be held hostage by a supplier — small on purpose, so that every project is signed by the person who calculated it.`,
      `The engineer in charge is ${empresa.responsavel}. He started behind a church mixing desk, where he learned that when the sound is right it disappears and the message is the only thing left in the room. Then came a technical degree in Computer Science and four years of Mechanical Engineering: that is where a trained ear got a unit of measurement and the hunch turned into arithmetic.`
    ],
    papelResponsavel: 'Engineer in charge · acoustic and audiovisual design',
    formacao: 'Technical degree in Computer Science · four years of Mechanical Engineering',
    atuacao: 'Remote design worldwide · site visits in Espírito Santo and neighbouring states',
    independencia:
      'Garioli Labs does not sell, does not install and takes no supplier commission. The ' +
      'design ships as an open specification that any competent integrator can price and ' +
      'build — including one the client already works with.',
    trajetoriaRotulo: 'Track record',
    marcos: [
      { quando: 'Start', o_que: 'First church mixing desk, as a teenager.' },
      { quando: 'Education', o_que: 'Technical degree in Computer Science and four years of Mechanical Engineering.' },
      { quando: 'Practice', o_que: 'Two decades of operating and designing audio, image and light.' },
      { quando: 'Now', o_que: 'Technical design, in-house software and training under one roof.' }
    ],
    especialidadesRotulo: 'Specialities',
    especialidades: [
      'Room acoustics — reverberation by band, treatment and isolation',
      'Sound systems — coverage, intelligibility and gain before feedback',
      'Image and light — sight lines, screen sizing, circuits and rigging',
      'Measurement and commissioning — ISO 3382-2, IEC 60268-16 and NBR 10152',
      'Development of the design software used for the calculations in house'
    ]
  },

  duvidas: {
    kicker: 'FAQ',
    titulo: 'What people ask before hiring',
    itens: [
      { p: 'Do I have to hire every discipline at once?', r: 'No. Each one stands on its own — starting with acoustics is common, since it changes the result the most. What does not change is the order: measure and calculate before specifying.' },
      { p: 'Does Garioli Labs sell or install equipment?', r: 'No. Garioli Labs does not sell, does not install and takes no supplier commission. The design ships as an open specification that any competent integrator can price and build — including one you already work with.' },
      { p: 'How does it work outside Brazil?', r: 'Most of the work is remote: a guided survey from the measurements, photos and drawings you send, with calculation and documentation done at the office. A site visit is arranged when the case calls for one.' },
      { p: 'What do I actually receive?', r: 'Dimensioned drawings, a calculation report, signal diagrams, an equipment list and an executive summary a decision-maker can read — as PDFs, made to last.' },
      { p: 'Can I keep the equipment I already own?', r: 'Almost always. Most cases are solved by relocating, reconfiguring and treating the room, with nothing new bought — and that shows up in the diagnosis before any quote.' }
    ]
  },

  chamada: {
    titulo: 'Engineering underneath, purpose at the centre, the message at the end.',
    sub:
      'Start with the screening: three minutes, no commitment and no automatic price. ' +
      'An engineer reviews it and answers within two business days.',
    cta: 'Request a quote'
  },

  /// The application screens. What the API returns (screening questions,
  /// contract clauses, project records) is not here — it comes from the
  /// server, and a Brazilian contract is still drafted in Portuguese.
  paginas: {
    entrar: {
      titulo: 'Sign in — Garioli Labs',
      descricao: 'Access your Garioli Labs account: projects, documents, courses and licences.',
      modos: {
        entrar: {
          kicker: 'Access',
          titulo: 'Sign in to your account',
          sub: 'Use the e-mail registered with your project or your enrolment.',
          botao: 'Sign in'
        },
        criar: {
          kicker: 'New account',
          titulo: 'Create your account',
          sub: 'It takes under a minute. The account is born linked to your requests.',
          botao: 'Create account'
        },
        recuperar: {
          kicker: 'Recovery',
          titulo: 'Recover access',
          sub: 'Automatic reset is not live yet.',
          botao: 'Understood'
        }
      },
      abas: { entrar: 'Sign in', criar: 'Create account' },
      recuperarTexto: [
        'Write to ',
        ' from the registered address and we give the access back the same business day. ' +
          'When reset by link goes live, it will appear here.'
      ],
      voltarAcesso: 'Back to sign in',
      campos: { nome: 'Full name', email: 'E-mail', senha: 'Password' },
      emailInvalido: 'Check the e-mail: the @ or the domain is missing.',
      mostrar: 'show',
      ocultar: 'hide',
      capsLock: 'Caps Lock is on.',
      senhaCurta: 'The password needs at least 8 characters.',
      pendencias: {
        email: 'a valid e-mail',
        nome: 'your full name',
        senha: 'a password with 8+ characters'
      },
      informe: 'To continue, provide:',
      enviando: 'Sending…',
      esqueci: 'I forgot my password',
      vitrine: {
        kicker: 'What is on the other side',
        frase: 'Every stage of your project, with a date and someone responsible.',
        itens: [
          { t: 'Projects', d: 'From screening to delivery, with what is pending and on whom.' },
          { t: 'Documents', d: 'Proposals, contracts and receipts in one place.' },
          { t: 'Courses and licences', d: 'Progress, keys and expiry dates.' }
        ]
      }
    },

    orcamento: {
      titulo: 'Request a quote — Garioli Labs',
      descricao:
        'A three-minute screening for an acoustics, sound, lighting or video project. ' +
        'No commitment and no automatic price: an engineer reviews it and answers.',
      assinatura: 'Acoustic and audiovisual engineering',
      carregando: 'Loading the screening…',
      pergunta: (n, total) => `Question ${n} of ${total}`,
      notaLateral:
        'No price is calculated here. Your request is reviewed by an engineer before it ' +
        'becomes a proposal.',
      campos: [
        { k: 'nome', label: 'Your name', ph: 'Full name', span: 'span 1' },
        { k: 'org', label: 'Institution or company', ph: 'Optional', span: 'span 1' },
        { k: 'email', label: 'E-mail', ph: 'name@domain.com', span: 'span 1' },
        { k: 'fone', label: 'WhatsApp', ph: '+00 000 000 0000', span: 'span 1' },
        { k: 'cidade', label: 'City and country', ph: 'Lisbon, Portugal', span: 'span 2' }
      ],
      contatoRotulo: 'Contact',
      criarConta: {
        titulo: 'Create my Garioli Labs account',
        descricao: [
          'Follow this request, courses and licences under the same login. Already have an account? ',
          'Sign in',
          ' — the request will be linked to it.'
        ]
      },
      alterar: 'Change',
      semCompromisso:
        'Sending this commits you to nothing and generates no price automatically. We ' +
        'review the information and, if the project is viable, you receive a proposal ' +
        'with scope and figures.',
      voltar: '← Back',
      continuar: 'Continue',
      enviarSolicitacao: 'Send request',
      faltando: {
        contato: 'Name and e-mail are required',
        multi: 'Tick at least one option',
        unica: 'Choose one option'
      },
      recebido: {
        kicker: 'Request received',
        titulo: 'We have your request',
        texto: [
          'Reference ',
          '. An engineer reviews the information and replies within 2 business days. If ' +
            'the scope is viable, you receive the proposal with scope, schedule and figures by e-mail.'
        ],
        conta: ['Open ', 'your account', ' to follow this request, your courses and your licences in one place.'],
        etapas: [
          { n: '01', t: 'Technical review of the request', d: 'We check whether the information is enough or whether we need photos and measurements.' },
          { n: '02', t: 'Site visit or remote meeting', d: 'When needed, we schedule one to measure and confirm the assumptions.' },
          { n: '03', t: 'Proposal with scope and figures', d: 'You receive the full document, valid for 15 days.' },
          { n: '04', t: 'Acceptance and contract', d: 'If you accept, the contract is generated on the same terms as the proposal.' }
        ]
      }
    },

    conta: {
      titulo: 'My account — Garioli Labs',
      carregando: 'Loading…',
      abas: [
        { id: 'projetos', label: 'Projects' },
        { id: 'cursos', label: 'Courses' },
        { id: 'licencas', label: 'Licences' },
        { id: 'docs', label: 'Documents' }
      ],
      fases: ['Request', 'Proposal', 'Contract', 'Survey', 'Design', 'Delivery'],
      secoes: {
        projetos: { kicker: 'My projects', titulo: 'Follow every stage' },
        cursos: { kicker: 'My courses', titulo: 'Pick up where you left off' },
        licencas: { kicker: 'My licences', titulo: 'Software and tools' },
        docs: { kicker: 'My documents', titulo: 'Proposals, contracts and receipts' }
      },
      outroProjeto: 'Need another project? The screening takes about three minutes and commits you to nothing.',
      solicitar: 'Request a quote',
      baixarPdf: 'Download PDF'
    },

    proposta: {
      titulo: 'Proposal and contract — Garioli Labs',
      carregando: 'Loading the proposal…',
      etapas: [
        ['proposta', '01 Proposal'],
        ['dados', '02 Details'],
        ['contrato', '03 Contract'],
        ['assinado', '04 Signature']
      ],
      kicker: 'Technical and commercial proposal',
      maps: 'Open in Google Maps',
      enviadaEm: (data) => `Sent on ${data}`,
      valeAte: (data) => `valid until ${data}`,
      restam: (dias) =>
        dias <= 0 ? 'expired' : dias === 1 ? 'last day' : `${dias} days left`,
      escopo: 'Scope',
      subtotal: 'Scope subtotal',
      desconto: (pct) => `${pct}% discount`,
      premissas: 'Pricing assumptions',
      total: 'Total after discount',
      pagamento: {
        titulo: 'Payment terms',
        parcelado: (n, valor) => `${n} instalments of ${valor}`,
        parceladoDet: 'The first on signature, the rest every 30 days.',
        avista: (valor) => `In full — ${valor}`,
        avistaDet: (pct) => `${pct}% off the total, paid on signature.`
      },
      observacoes: 'Notes before accepting (optional)',
      observacoesPh: 'Any condition, deadline or item you want recorded with the acceptance.',
      aceitar: 'Accept the proposal',
      notaAceite:
        'Acceptance records date, time, IP and the payment terms chosen. It does not ' +
        'replace the contract — it is the step that authorises generating one on these ' +
        'same terms.',
      dados: {
        kicker: 'Details for the contract',
        titulo: 'Proposal accepted. Now the details.',
        sub:
          'These are the details that identify the parties in the contract. If you are ' +
          'missing one now, you can come back through this same link later — the ' +
          'proposal stays accepted.',
        campos: [
          { k: 'razao', label: 'Legal name of the organisation', span: 'span 2' },
          { k: 'cnpj', label: 'Company or tax ID', span: 'span 1' },
          { k: 'endereco', label: 'Full address with postcode', span: 'span 1' },
          { k: 'representante', label: 'Name of the legal representative', span: 'span 1' },
          { k: 'cpf_rep', label: 'Representative’s personal ID', span: 'span 1' },
          { k: 'cargo', label: 'Representative’s role', span: 'span 1' },
          { k: 'email', label: 'E-mail for the electronic signature', span: 'span 1' }
        ],
        gerar: 'Generate contract',
        pronto: 'All set.',
        incompleto: 'Fill in every field to generate the contract.',
        corrija: 'Fix the fields marked in red.',
        erros: {
          documento: 'Invalid company or tax ID — check the digits.',
          cpf: 'Invalid personal ID — check the digits.',
          email: 'Invalid e-mail address.',
          curto: 'This field is too short.'
        },
        idioma: 'The contract is issued in Portuguese, under Brazilian law.'
      },
      contrato: {
        kicker: 'Contract',
        titulo: 'Read and sign',
        assinar: 'Sign with Gov.br',
        pdf: 'Download PDF',
        duvida: 'Ask on WhatsApp'
      },
      assinado: {
        kicker: 'Contract signed',
        titulo: 'Everything is signed',
        texto: (numero, quando, provedor) =>
          `Contract ${numero} signed on ${quando} via ${provedor}. The PDF copy has been ` +
          'sent to your e-mail and stays available in your account.',
        conta: 'Go to my account',
        via: 'Download the signed copy'
      },
      ajuda: {
        titulo: 'Questions about the document',
        ph: 'E.g. what happens if I am late on an instalment?',
        perguntar: 'Ask',
        resposta: 'Sent. If the automatic answer does not settle it, use the WhatsApp button below.',
        engenheiro: 'Talk to the engineer →',
        idiomaDoc:
          'This proposal was drawn up in Portuguese for a Brazilian client. The interface ' +
          'is translated; the document and the contract are not — they are the instrument ' +
          'that will be signed.',
        validade: (ate, dias) =>
          dias <= 0
            ? `This proposal expired on ${ate}. The figures have to be quoted again.`
            : `Valid until ${ate} — ${dias === 1 ? 'last day' : `${dias} days left`}. ` +
              'After that the document expires and the figures have to be quoted again.'
      }
    },

    admin: {
      titulo: 'Administration — Garioli Labs',
      rotulo: 'Administration',
      carregando: 'Loading…',
      semAcesso: 'This account has no access to the panel.',
      vistas: [
        { id: 'home', label: 'Today', kicker: 'Owner panel', titulo: 'What needs you right now' },
        { id: 'pipeline', label: 'Pipeline', kicker: 'Sales', titulo: 'From screening to delivery' },
        { id: 'financeiro', label: 'Finance', kicker: 'Receivables', titulo: 'Forecast, received and overdue' },
        { id: 'impostos', label: 'Taxes', kicker: 'Tax planning', titulo: 'What each regime costs' },
        { id: 'projetos', label: 'Projects', kicker: 'Execution', titulo: 'Work in progress' },
        { id: 'conteudo', label: 'Courses and licences', kicker: 'Digital products', titulo: 'Catalogue and students' },
        { id: 'documentos', label: 'Templates', kicker: 'Library', titulo: 'Versioned proposals and contracts' },
        { id: 'auditoria', label: 'Audit', kicker: 'Log', titulo: 'Trail of acceptances and signatures' }
      ],
      atalhos: {
        site: 'Public site',
        cliente: 'View as client',
        triagem: 'Public screening',
        sair: 'Sign out'
      },
      exigeAcao: 'Needs action today',
      notaPipeline:
        'Cards with a red border have been stalled longer than the stage normally takes. ' +
        'The figure shown is the current proposal; approved change orders go to finance, not here.',
      parcelas: 'Instalments',
      notaMei: (faturado, limite, ano) =>
        ['As a sole trader, the annual revenue ceiling is tracked here: ', `${faturado} of ${limite}`,
          ` in ${ano}. Past 80 %, the system warns you to plan the change of regime.`],
      atencao: 'Attention',
      acumulados: 'accumulated',
      doTeto: (pct, teto) => `${pct}% of the ${teto} ceiling`,
      regimes: 'Regimes compared · tax for the month',
      recomendado: 'Recommended',
      notaFatorR: (minimo, proLabore) =>
        ['Annex III only holds while the ', 'R Factor', ` stays at ${minimo}% or more of revenue. ` +
          'For the current month that means a director’s salary of ', proLabore,
          '. Below that the activity falls into Annex V and the tax nearly triples.'],
      notaContador:
        'A comparison to support the decision, not an accounting opinion — confirm the ' +
        'regime with your accountant before changing.',
      bloqueio: 'Blocked by:',
      notaModelos:
        'Contracts already signed stay frozen at the version in force on the signing ' +
        'date. Changing a template never changes a contract in force — only what is ' +
        'generated from then on.',
      notaAuditoria:
        'Immutable log: no line can be edited or deleted, including by you. This trail is ' +
        'what supports the acceptance and the signature if either is ever disputed.'
    }
  }
};
