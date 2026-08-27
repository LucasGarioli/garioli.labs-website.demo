/// Todo o texto do site em português.
///
/// Os números do estudo de caso não são digitados aqui: vêm de
/// `desenhos/projeto.js`, o mesmo módulo que desenha as pranchas. O texto não
/// tem como discordar do desenho.
import {
  sala, lugares, cobertura, sti, maiorDistancia, verificacoes, fmt
} from '../desenhos/projeto.js';
import { demonstracao, empresa } from '../identidade.js';

export default {
  codigo: 'pt',
  htmlLang: 'pt-BR',
  ogLocale: 'pt_BR',
  nome: 'Português',
  rotulo: 'PT',
  trocarPara: 'Ver o site em inglês',

  meta: {
    titulo: 'Projeto acústico, sonorização e iluminação | Garioli Labs',
    descricao:
      'Engenharia acústica e audiovisual para igrejas, auditórios, teatros e estúdios: ' +
      'tratamento e isolamento acústico, sonorização, iluminação cênica e vídeo. ' +
      'Cálculo e simulação antes da compra. Projeto remoto para todo o Brasil.',
    palavras:
      'projeto acústico, tratamento acústico, isolamento acústico, projeto de sonorização, ' +
      'sistema de som para igreja, acústica de auditório, iluminação cênica, projeto de vídeo, ' +
      'engenharia acústica, Cachoeiro de Itapemirim, Espírito Santo',
    imagemAlt:
      'Garioli Labs — acústica, sonorização, imagem e luz, sobre o leque de ' +
      'fileiras de um auditório'
  },

  nav: {
    aviso: 'Resonance em desenvolvimento — entre na lista de espera, sem cobrança',
    avisoLink: 'Contato',
    inicio: 'Ir para a página inicial',
    secoesRotulo: 'Seções do site',
    idiomaRotulo: 'Idioma',
    entrar: 'Entrar',
    conta: 'Minha conta',
    painel: 'Painel',
    sair: 'Sair',
    orcamento: 'Solicitar orçamento',
    secoes: [
      { id: 'servicos', rotulo: 'Serviços' },
      { id: 'processo', rotulo: 'Processo' },
      { id: 'caso', rotulo: 'Caso' },
      { id: 'software', rotulo: 'Software' },
      { id: 'ensino', rotulo: 'Ensino' },
      { id: 'sobre', rotulo: 'Sobre' },
      { id: 'duvidas', rotulo: 'Dúvidas' },
      { id: 'contato', rotulo: 'Contato' }
    ]
  },

  rodape: {
    servicosRotulo: 'Serviços',
    servicos: ['Acústica', 'Sonorização', 'Iluminação cênica', 'Projeção e vídeo'],
    acessoRotulo: 'Acesso',
    acessos: [
      { href: '/orcamento', rotulo: 'Solicitar orçamento' },
      { href: '/conta', rotulo: 'Minha conta' },
      { href: '/proposta', rotulo: 'Portal da proposta' },
      { href: '/admin', rotulo: 'Administração' }
    ],
    contatoRotulo: 'Contato',
    cnpjRotulo: 'CNPJ'
  },

  hero: {
    // O H1 diz por que o projeto existe, em uma linha: quem chega aqui esta'
    // decidindo se gasta com projeto ou direto com equipamento. As disciplinas
    // — acustica, sonorizacao, iluminacao, video — ficam na linha logo abaixo,
    // que e' onde a busca continua encontrando os termos.
    titulo: 'O projeto é o filtro que separa o investimento do gasto desnecessário.',
    sub:
      'Projetos de acústica, sonorização, iluminação e vídeo para igrejas, auditórios e ' +
      'estúdios. Cálculo antes da compra — para você investir uma vez, no que resolve.',
    cta: 'Solicitar orçamento',
    ctaSecundario: 'Como funciona'
  },

  stats: [
    { v: '12+', t: 'anos de prática em áudio, imagem e projeto' },
    { v: '4', t: 'disciplinas integradas no mesmo documento' },
    { v: 'RT60', t: 'cálculo por Sabine e Eyring antes de qualquer compra' },
    { v: '2 dias', t: 'para retorno da solicitação de orçamento' }
  ],

  servicos: {
    kicker: 'Serviços',
    titulo: 'Engenharia aplicada ao que se ouve e se vê',
    itens: [
      { n: '01', t: 'Projeto acústico', d: 'Medição, cálculo de tempo de reverberação e projeto de superfícies absorvedoras e difusoras — com materiais que existem no mercado local.' },
      { n: '02', t: 'Isolamento acústico', d: 'Perda de transmissão, detalhamento construtivo e compatibilização com a obra civil, para o som não entrar nem sair.' },
      { n: '03', t: 'Sonorização', d: 'Dimensionamento de PA, cobertura, fluxo de sinal, ganho de realimentação e memorial descritivo para compra e instalação.' },
      { n: '04', t: 'Iluminação cênica', d: 'Plano de luz em camadas, potências, circuitos, mapa de canais e cenas — pensado também para a câmera.' },
      { n: '05', t: 'Projeção e vídeo', d: 'Avaliação entre projetores e painel de LED, distâncias, luminância, telas, cabeamento e cadeia de transmissão.' },
      { n: '06', t: 'Consultoria de compra', d: 'Lista técnica de referência e critérios de escolha por faixa de preço. Sem comissão de fornecedor — a recomendação é técnica.' }
    ]
  },

  processo: {
    kicker: 'Processo',
    titulo: 'Do primeiro contato à obra pronta',
    itens: [
      { n: '01', t: 'Triagem', d: 'Você responde perguntas simples sobre o espaço. Nada de termo técnico, nada de compromisso.' },
      { n: '02', t: 'Análise', d: 'Um engenheiro lê tudo e diz se falta informação, foto ou visita técnica.' },
      { n: '03', t: 'Proposta', d: 'Escopo, premissas, cronograma e valores, com validade de 15 dias.' },
      { n: '04', t: 'Contrato', d: 'Aceite e assinatura eletrônica pelo Gov.br, com os mesmos termos da proposta.' },
      { n: '05', t: 'Entrega', d: 'Documentos em PDF e acompanhamento pela sua conta — com dúvidas de implantação tiradas sem custo.' }
    ]
  },

  caso: {
    kicker: 'Estudo de caso',
    titulo: 'Ninguém elogia o áudio quando ele está certo. É esse o padrão.',
    resumo:
      `Um templo de ${fmt.milhar(lugares.total)} lugares — plateia em leque e mezanino — ` +
      'reconstruído no software antes de qualquer compra. Oito verificações no mesmo ' +
      'modelo decidiram o que entrou na lista técnica — e, sobretudo, o que saiu dela.',
    nota: demonstracao
      ? 'Estudo de caso de demonstração. Os números saem do memorial de cálculo deste ' +
        'modelo — não representam um cliente identificável.'
      : 'Projeto de referência. Os valores são os do memorial de cálculo.',
    salaRotulo: 'A sala',
    analisesRotulo: 'Verificações que decidiram o projeto',
    pranchasRotulo: 'As pranchas deste projeto',
    numeros: [
      { v: fmt.milhar(lugares.total), t: 'lugares no estudo de caso' },
      { v: `${fmt.milhar(sala.volume)} m³`, t: 'volume modelado' },
      { v: `${fmt.dec(sala.t30Calculado)} s`, t: `T30 calculado · alvo ${fmt.dec(sala.t30Alvo)} s` },
      { v: fmt.dec(sti.ultima, 2), t: 'STI na poltrona mais distante' },
      { v: String(verificacoes.length), t: 'verificações: som, imagem, luz e transmissão' }
    ],
    sala: [
      { k: 'Área útil', v: `${fmt.milhar(sala.area)} m²` },
      { k: 'Pé-direito', v: `${fmt.dec(sala.alturaFundo)} a ${fmt.dec(sala.alturaProscenio)} m` },
      { k: 'Ruído de fundo', v: sala.ruidoFundo },
      { k: 'Distância máx.', v: `${fmt.dec(maiorDistancia.valor)} m` }
    ],
    analises: [
      {
        norma: 'ISO 3382-2',
        t: 'Reverberação por banda',
        d: `T30 de ${fmt.dec(sala.t30Calculado)} s contra ${fmt.dec(sala.t30Alvo)} s de alvo, com a sala ocupada. O número sai da soma α·S de cada superfície do projeto, não de uma estimativa.`
      },
      {
        norma: 'SPL · 4 kHz',
        t: 'Cobertura sonora',
        d: `Nível calculado poltrona a poltrona: ${fmt.dec(cobertura.variacao, 1)} dB entre a mais alta e a mais baixa, e ${fmt.dec(cobertura.faixa90, 1)} dB em 90 % dos lugares.`
      },
      {
        norma: 'IEC 60268-16',
        t: 'Inteligibilidade (STI)',
        d: `De ${fmt.dec(sti.primeira, 2)} na primeira fileira a ${fmt.dec(sti.ultima, 2)} na última do mezanino — acima de 0,60 em toda a plateia, inclusive fora de eixo.`
      }
    ]
  },

  entregas: {
    kicker: 'Entrega',
    titulo: 'O projeto pronto — e o que fica com você',
    itens: [
      { tipo: 'Documento', t: 'Plantas cotadas', d: 'Locação de tratamento, fontes, rigging e infraestrutura, com cotas executáveis em obra.' },
      { tipo: 'Documento', t: 'Memorial de cálculo', d: 'Premissas, coeficientes, resultados por banda e a justificativa técnica de cada escolha.' },
      { tipo: 'Documento', t: 'Diagramas de sinal', d: 'Cadeia completa de áudio e vídeo, ponto a ponto, com ganhos e tipos de conexão.' },
      { tipo: 'Campo', t: 'Comissionamento', d: 'Ajuste em obra, medição de verificação e treinamento da equipe que vai operar.' }
    ]
  },

  software: {
    kicker: 'Software',
    titulo: 'Todo projeto difícil deixa uma ferramenta atrás de si',
    sub:
      'O que começa como planilha de socorro num projeto real termina como programa. ' +
      'Cada software nasce de um problema que apareceu primeiro aqui dentro — e sai com ' +
      'documentação e licença próprias.',
    itens: [
      { nome: 'Resonance', estado: 'Em desenvolvimento', d: 'Modelagem geométrica, cálculo de reverberação por banda e memorial gerado direto do modelo — a ferramenta usada no estudo de caso desta página.' },
      { nome: 'Roadmap', estado: 'Em estudo', d: 'Novas ferramentas de projeto e automação nascidas dos gargalos do trabalho diário.' },
      { nome: 'Sob medida', estado: 'Sob consulta', d: 'Desenvolvimento dedicado ao fluxo do seu escritório, com documentação e suporte.' }
    ]
  },

  ensino: {
    kicker: 'Ensino',
    titulo: 'O que a Garioli Labs aprende não fica só no projeto.',
    sub: 'Material escrito, exercícios corrigidos e vídeo — na sua conta, com progresso registrado.',
    cta: 'Criar minha conta',
    itens: [
      { tipo: 'Escrito', t: 'Materiais de estudo', d: 'Apostilas técnicas de acústica, sonorização e projeto, escritas para serem consultadas depois.' },
      { tipo: 'Prática', t: 'Exercícios online', d: 'Problemas reais resolvidos passo a passo, com correção e progresso registrado.' },
      { tipo: 'Vídeo', t: 'Aulas gravadas', d: 'Demonstrações em campo e em software, do diagnóstico ao ajuste final do sistema.' }
    ]
  },

  sobre: {
    kicker: 'Sobre',
    titulo: 'Quem responde pelos projetos',
    paragrafos: [
      `A Garioli Labs é um escritório de engenharia acústica e audiovisual em ${empresa.cidadeSimples}. Atende quem precisa de projeto sério e não quer virar refém de fornecedor — pequeno por opção, para que todo projeto saia assinado por quem o calculou.`,
      `O responsável técnico é ${empresa.responsavel}. Começou atrás de uma mesa de som de igreja, onde aprendeu que, quando o som acerta, ele desaparece e a mensagem é a única coisa que sobra na sala. Vieram depois a formação técnica em Informática e quatro anos de Engenharia Mecânica: foi ali que o ouvido treinado ganhou unidade de medida e o palpite virou cálculo.`
    ],
    papelResponsavel: 'Responsável técnico · projeto acústico e audiovisual',
    formacao: 'Técnico em Informática · quatro anos de Engenharia Mecânica',
    atuacao: 'Projeto remoto para todo o país · visita técnica no Espírito Santo e região',
    independencia:
      'A Garioli Labs não vende, não instala e não recebe comissão de fornecedor. O projeto ' +
      'sai com especificação aberta, que qualquer integrador competente cota e executa — ' +
      'inclusive um que o cliente já tenha.',
    trajetoriaRotulo: 'Trajetória',
    marcos: [
      { quando: 'Início', o_que: 'Primeira mesa de som em igreja, na adolescência.' },
      { quando: 'Formação', o_que: 'Técnico em Informática e quatro anos de Engenharia Mecânica.' },
      { quando: 'Prática', o_que: 'Duas décadas de operação e projeto em áudio, imagem e luz.' },
      { quando: 'Agora', o_que: 'Projeto técnico, software próprio e ensino sob o mesmo teto.' }
    ],
    especialidadesRotulo: 'Especialidades',
    especialidades: [
      'Acústica de salas — reverberação por banda, tratamento e isolamento',
      'Sonorização — cobertura, inteligibilidade e ganho antes da realimentação',
      'Imagem e luz — linhas de visão, dimensionamento de tela, circuitos e rigging',
      'Medição e comissionamento — ISO 3382-2, IEC 60268-16 e NBR 10152',
      'Desenvolvimento do software de projeto usado nos cálculos da casa'
    ]
  },

  duvidas: {
    kicker: 'Dúvidas',
    titulo: 'O que perguntam antes de contratar',
    itens: [
      { p: 'Preciso contratar todas as frentes de uma vez?', r: 'Não. Cada frente se contrata sozinha — é comum começar pela acústica, que é a que mais muda o resultado. O que não muda é a ordem: medir e calcular antes de especificar.' },
      { p: 'A Garioli Labs vende ou instala equipamento?', r: 'Não. A Garioli Labs não vende, não instala e não recebe comissão de fornecedor. O projeto sai com especificação aberta, que qualquer integrador competente cota e executa — inclusive um que você já tenha.' },
      { p: 'Como funciona fora do Espírito Santo?', r: 'A maior parte do trabalho é remota: levantamento guiado por medidas, fotos e plantas que você envia, com cálculo e documentação feitos no escritório. Visita presencial é combinada quando o caso pede.' },
      { p: 'O que eu recebo, na prática?', r: 'Plantas cotadas, memorial com os cálculos, diagramas de sinal, lista técnica e um resumo executivo legível por quem decide — em PDF, para durar.' },
      { p: 'Dá para aproveitar o equipamento que já tenho?', r: 'Quase sempre. Boa parte dos casos se resolve realocando, reconfigurando e tratando o ambiente, sem compra nova — e isso aparece no diagnóstico antes de qualquer orçamento.' }
    ]
  },

  chamada: {
    titulo: 'Engenharia na base, propósito no centro, mensagem no fim.',
    sub:
      'Comece pela triagem: três minutos, sem compromisso e sem valor automático. ' +
      'Um engenheiro analisa e responde em até dois dias úteis.',
    cta: 'Solicitar orçamento'
  },

  /// As telas de aplicativo. O que a API devolve (perguntas da triagem,
  /// cláusulas de contrato, dados de projeto) não está aqui — vem do servidor,
  /// e o contrato brasileiro continua sendo redigido em português.
  paginas: {
    entrar: {
      titulo: 'Entrar — Garioli Labs',
      descricao: 'Acesso à sua conta Garioli Labs: projetos, documentos, cursos e licenças.',
      modos: {
        entrar: {
          kicker: 'Acesso',
          titulo: 'Entrar na sua conta',
          sub: 'Use o e-mail cadastrado no seu projeto ou na sua matrícula.',
          botao: 'Entrar'
        },
        criar: {
          kicker: 'Nova conta',
          titulo: 'Criar sua conta',
          sub: 'Leva menos de um minuto. A conta já nasce ligada às suas solicitações.',
          botao: 'Criar conta'
        },
        recuperar: {
          kicker: 'Recuperação',
          titulo: 'Recuperar acesso',
          sub: 'A redefinição automática ainda não está no ar.',
          botao: 'Entendi'
        }
      },
      abas: { entrar: 'Entrar', criar: 'Criar conta' },
      doisFatores: {
        kicker: 'Verificação',
        titulo: 'Confirme que é você',
        sub: 'Abra o aplicativo autenticador e digite o código de seis dígitos.',
        campo: 'Código de seis dígitos',
        ou: 'Perdeu o telefone? Use um código de recuperação.',
        recuperacaoCampo: 'Código de recuperação',
        usarRecuperacao: 'usar código de recuperação',
        usarAplicativo: 'usar o aplicativo',
        botao: 'Confirmar',
        conferindo: 'Conferindo…',
        recusado: 'Código inválido ou expirado. Confira o aplicativo e tente de novo.',
        expirou: 'Este acesso expirou. Entre de novo.',
        voltar: 'Voltar ao acesso'
      },
      sso: {
        titulo: 'Entrar com',
        divisor: 'ou com e-mail e senha',
        provedores: { google: 'Google', apple: 'Apple', microsoft: 'Microsoft' },
        acao: (p) => `Entrar com ${p}`,
        // A honestidade e' parte da tela: nesta build nao ha servidor para
        // guardar o segredo do cliente, entao o botao nao fala com o
        // provedor nenhum. Dizer isso e' melhor do que deixar parecer que
        // fala.
        nota: 'Na demonstração, os três entram numa conta fictícia — não há troca com o provedor.',
        entrando: (p) => `Entrando com ${p}…`
      },
      recuperarTexto: [
        'Escreva para ',
        ' do e-mail cadastrado e devolvemos o acesso no mesmo dia útil. Quando a ' +
          'redefinição por link entrar no ar, ela aparece aqui.'
      ],
      voltarAcesso: 'Voltar ao acesso',
      campos: { nome: 'Nome completo', email: 'E-mail', senha: 'Senha' },
      emailInvalido: 'Confira o e-mail: falta o @ ou o domínio.',
      mostrar: 'mostrar',
      ocultar: 'ocultar',
      capsLock: 'Caps Lock está ativado.',
      senhaCurta: 'A senha precisa de ao menos 8 caracteres.',
      pendencias: {
        email: 'e-mail válido',
        nome: 'nome completo',
        senha: 'senha com 8+ caracteres'
      },
      informe: 'Para continuar, informe:',
      enviando: 'Enviando…',
      esqueci: 'Esqueci minha senha',
      vitrine: {
        kicker: 'O que fica do outro lado',
        frase: 'Cada etapa do seu projeto, com data e responsável.',
        itens: [
          { t: 'Projetos', d: 'Da triagem à entrega, com o que está pendente de quem.' },
          { t: 'Documentos', d: 'Propostas, contratos e recibos no mesmo lugar.' },
          { t: 'Cursos e licenças', d: 'Progresso, chaves e vencimentos.' }
        ]
      }
    },

    orcamento: {
      titulo: 'Solicitar orçamento — Garioli Labs',
      descricao:
        'Triagem de três minutos para projeto de acústica, sonorização, iluminação ou ' +
        'vídeo. Sem compromisso e sem valor automático: um engenheiro analisa e responde.',
      assinatura: 'Engenharia acústica e audiovisual',
      carregando: 'Carregando triagem…',
      pergunta: (n, total) => `Pergunta ${n} de ${total}`,
      notaLateral:
        'Nenhum valor é calculado aqui. Sua solicitação é analisada por um engenheiro ' +
        'antes de virar proposta.',
      campos: [
        { k: 'nome', label: 'Seu nome', ph: 'Nome completo', span: 'span 1' },
        { k: 'org', label: 'Instituição ou empresa', ph: 'Opcional', span: 'span 1' },
        { k: 'email', label: 'E-mail', ph: 'nome@dominio.com', span: 'span 1' },
        { k: 'fone', label: 'WhatsApp', ph: '(00) 00000-0000', span: 'span 1' },
        { k: 'cidade', label: 'Cidade e estado', ph: 'Rio Novo do Sul, ES', span: 'span 2' }
      ],
      contatoRotulo: 'Contato',
      criarConta: {
        titulo: 'Criar minha conta Garioli Labs',
        descricao: [
          'Acompanhe esta solicitação, cursos e licenças no mesmo login. Já tem conta? ',
          'Entrar',
          ' — a solicitação será vinculada a ela.'
        ]
      },
      alterar: 'Alterar',
      semCompromisso:
        'Ao enviar, você não assume nenhum compromisso e nenhum valor é gerado ' +
        'automaticamente. Analisamos as informações e, se o projeto for viável, você ' +
        'recebe uma proposta com escopo e valores.',
      voltar: '← Voltar',
      continuar: 'Continuar',
      enviarSolicitacao: 'Enviar solicitação',
      faltando: {
        contato: 'Nome e e-mail são obrigatórios',
        multi: 'Marque ao menos uma opção',
        unica: 'Escolha uma opção'
      },
      recebido: {
        kicker: 'Solicitação recebida',
        titulo: 'Recebemos sua solicitação',
        texto: [
          'Protocolo ',
          '. Um engenheiro analisa as informações e retorna em até 2 dias úteis. Se o ' +
            'escopo for viável, você recebe a proposta com escopo, prazos e valores por e-mail.'
        ],
        conta: ['Acesse ', 'sua conta', ' para acompanhar esta solicitação, seus cursos e suas licenças no mesmo lugar.'],
        etapas: [
          { n: '01', t: 'Análise técnica da solicitação', d: 'Conferimos se as informações são suficientes ou se precisamos de fotos e medidas.' },
          { n: '02', t: 'Visita técnica ou reunião remota', d: 'Quando necessário, agendamos para medir e confirmar as premissas.' },
          { n: '03', t: 'Proposta com escopo e valores', d: 'Você recebe o documento completo, com prazo de validade de 15 dias.' },
          { n: '04', t: 'Aceite e contrato', d: 'Se aceitar, o contrato é gerado com os mesmos termos da proposta.' }
        ]
      }
    },

    conta: {
      titulo: 'Minha conta — Garioli Labs',
      carregando: 'Carregando…',
      abas: [
        { id: 'projetos', label: 'Projetos' },
        { id: 'cursos', label: 'Cursos' },
        { id: 'licencas', label: 'Licenças' },
        { id: 'docs', label: 'Documentos' },
        { id: 'perfil', label: 'Cadastro' },
        { id: 'seguranca', label: 'Segurança' }
      ],
      fases: ['Solicitação', 'Proposta', 'Contrato', 'Levantamento', 'Projeto', 'Entrega'],
      secoes: {
        projetos: { kicker: 'Meus projetos', titulo: 'Acompanhe cada etapa' },
        cursos: { kicker: 'Meus cursos', titulo: 'Continue de onde parou' },
        licencas: { kicker: 'Minhas licenças', titulo: 'Softwares e ferramentas' },
        docs: { kicker: 'Meus documentos', titulo: 'Propostas, contratos e recibos' }
      },
      perfil: {
        kicker: 'Meu cadastro',
        titulo: 'Dados da conta',
        salvar: 'Salvar alterações',
        salvando: 'Salvando…',
        salvo: 'Cadastro atualizado.',
        obrigatorio: 'obrigatório',
        opcional: 'opcional',

        foto: {
          titulo: 'Foto',
          texto:
            'Aparece na barra do topo e nos documentos que levam sua assinatura. ' +
            'A imagem é recortada em um quadrado e reduzida antes de sair daqui.',
          enviar: 'Enviar foto',
          trocar: 'Trocar foto',
          remover: 'Remover',
          enviando: 'Enviando…',
          semFoto: 'Sem foto — a conta aparece com as iniciais.',
          tipoInvalido: 'Escolha um arquivo PNG, JPEG ou WebP.',
          grandeDemais: 'A imagem passa de 10 MB. Escolha uma menor.',
          falhou: 'Não consegui ler esta imagem.'
        },

        identificacao: {
          titulo: 'Identificação',
          nome: 'Nome completo',
          email: 'E-mail',
          emailNota: 'O e-mail identifica a conta e é por onde a entrada acontece — para trocá-lo, fale com a gente.',
          telefone: 'Telefone'
        },

        endereco: {
          titulo: 'Endereço',
          texto: 'É para onde o levantamento vai e o que consta em contrato.',
          cep: 'CEP',
          logradouro: 'Rua, avenida ou rodovia',
          numero: 'Número',
          complemento: 'Complemento',
          bairro: 'Bairro',
          cidade: 'Cidade',
          uf: 'UF',
          pais: 'País'
        },

        faturamento: {
          titulo: 'Faturamento',
          texto: 'É o que sai na nota fiscal e no contrato.',
          tipo: 'A nota sai em nome de',
          fisica: 'Pessoa física',
          juridica: 'Pessoa jurídica',
          cpf: 'CPF',
          cnpj: 'CNPJ',
          razaoSocial: 'Razão social',
          inscricao: 'Inscrição estadual',
          isento: 'deixe vazio se for isento',
          mesmoEndereco: 'Cobrar no mesmo endereço acima'
        },

        pagamento: {
          titulo: 'Formas de pagamento',
          texto:
            'O número do cartão não passa por esta tela nem por servidor nosso: ' +
            'quem o coleta é a operadora, nos campos dela, e o que volta para cá ' +
            'é o resumo abaixo.',
          vazio: 'Nenhuma forma de pagamento cadastrada.',
          adicionarCartao: 'Cadastrar cartão',
          adicionarPix: 'Cadastrar Pix',
          adicionando: 'Abrindo…',
          padrao: 'Padrão',
          tornarPadrao: 'Tornar padrão',
          remover: 'Remover',
          cartao: (m) => `${m.bandeira} •••• ${m.final}`,
          validade: (m) => `validade ${m.validade}`,
          pix: 'Pix',
          demonstracao: 'Nesta demonstração o cadastro é simulado — nenhum dado real é pedido ou guardado.'
        },

        // A recusa vem do backend com um motivo estável; a frase é escolhida
        // aqui, no idioma da página.
        erros: {
          nome_invalido: 'Informe o nome completo.',
          telefone_invalido: 'O telefone está incompleto.',
          cep_invalido: 'O CEP tem oito dígitos.',
          uf_invalida: 'UF desconhecida.',
          cpf_invalido: 'Este CPF não existe — confira os números.',
          cnpj_invalido: 'Este CNPJ não existe — confira os números.',
          razao_social_vazia: 'Informe a razão social.',
          foto_invalida: 'Envie uma imagem PNG, JPEG ou WebP.',
          foto_grande: 'A imagem ficou grande demais.'
        }
      },

      seguranca: {
        kicker: 'Segurança',
        titulo: 'Verificação em dois fatores',
        seloAtivo: 'Ativa',
        seloInativo: 'Inativa',
        campo: 'Código de seis dígitos',
        resumoInativo:
          'Hoje sua conta entra só com a senha. Com o segundo fator, entrar passa a exigir ' +
          'também um código de seis dígitos gerado no seu telefone — quem descobrir a senha ' +
          'ainda não entra.',
        resumoAtivo: 'Entrar nesta conta exige o código do aplicativo.',
        desde: (q) => `ativada em ${q}`,
        restantes: (n) => `${n} códigos de recuperação ainda válidos`,
        ativar: 'Ativar segundo fator',
        preparando: 'Preparando…',
        passo1: '1 · Cadastre o segredo no aplicativo',
        passo1Texto:
          'Toque no link abaixo para abrir o seu aplicativo autenticador, ou digite o segredo ' +
          'à mão. Serve qualquer aplicativo TOTP: Google Authenticator, Aegis, 1Password, Bitwarden.',
        abrirApp: 'Abrir no aplicativo autenticador',
        segredoRotulo: 'Segredo, para digitar à mão',
        copiar: 'copiar',
        copiado: 'copiado',
        passo2: '2 · Confirme com o código que ele mostrar',
        recusado: 'Código inválido ou expirado. Confira o aplicativo e tente de novo.',
        confirmar: 'Confirmar e ativar',
        confirmando: 'Conferindo…',
        cancelar: 'Cancelar',
        codigosTitulo: 'Guarde estes códigos de recuperação',
        codigosTexto:
          'Cada um serve uma vez, e é o que devolve o acesso se o telefone se perder. ' +
          'Eles aparecem agora e não voltam a aparecer.',
        codigosOk: 'Guardei os códigos',
        desativar: 'Desativar',
        desativarTexto: 'Digite um código do aplicativo, ou um de recuperação, para desativar.',
        desativando: 'Desativando…',
        // A honestidade da demonstração: o segundo fator aqui é real, o resto não.
        nota:
          'Nesta demonstração o segundo fator é de verdade — o código vem do seu aplicativo, ' +
          'calculado como manda a RFC 6238. O que não é real é o resto da conta, e o segredo ' +
          'vive só nesta aba.'
      },
      outroProjeto: 'Precisa de outro projeto? A triagem leva cerca de três minutos e não gera compromisso.',
      solicitar: 'Solicitar orçamento',
      baixarPdf: 'Baixar PDF'
    },

    proposta: {
      titulo: 'Proposta e contrato — Garioli Labs',
      carregando: 'Carregando proposta…',
      etapas: [
        ['proposta', '01 Proposta'],
        ['dados', '02 Dados'],
        ['contrato', '03 Contrato'],
        ['assinado', '04 Assinatura']
      ],
      kicker: 'Proposta técnica e comercial',
      maps: 'Abrir no Google Maps',
      enviadaEm: (data) => `Enviada em ${data}`,
      valeAte: (data) => `válida até ${data}`,
      restam: (dias) =>
        dias <= 0 ? 'expirada' : dias === 1 ? 'último dia' : `faltam ${dias} dias`,
      objeto: 'Objeto',
      diagnostico: 'Diagnóstico técnico',
      diagnosticoNota:
        'O que foi observado na visita técnica. É o que sustenta cada linha do escopo abaixo.',
      diretrizes: 'Diretrizes do projeto',
      entregaveis: 'Entregáveis por disciplina',
      prazo: 'Prazo de entrega',
      prazoTexto: (d) => `${d} dias úteis`,
      incluso: 'Está incluso',
      naoIncluso: 'Não está incluso',
      criterio: 'Critério de aceite',
      planoTitulo: 'Plano de pagamento',
      aditivoSec: {
        cortesia: 'Concedido integralmente como cortesia nesta proposta',
        valorDe: 'Valor de referência',
        dimensao: 'Dimensão',
        condicoes: 'Condições',
        validade: (m) => `Válido por ${m} meses a partir da assinatura do contrato.`
      },
      impressao: {
        titulo: 'Para aceitar esta proposta',
        texto:
          'Abra o endereço abaixo no celular ou no computador. Ele leva a este mesmo ' +
          'documento na internet, com o botão de aceite — e, logo depois, ao contrato.',
        clique: 'Aceitar pela internet'
      },
      escopo: 'Escopo',
      subtotal: 'Subtotal do escopo',
      desconto: (pct) => `Desconto de ${pct}%`,
      premissas: 'Premissas do preço',
      total: 'Total com desconto',
      pagamento: {
        titulo: 'Forma de pagamento',
        parcelado: (n, valor) => `${n} parcelas de ${valor}`,
        parceladoDet: 'A primeira na assinatura, as demais a cada 30 dias.',
        avista: (valor) => `À vista — ${valor}`,
        avistaDet: (pct) => `${pct}% a menos sobre o total, pago na assinatura.`
      },
      observacoes: 'Observações antes de aceitar (opcional)',
      observacoesPh: 'Alguma condição, prazo ou item que você quer registrar junto ao aceite.',
      aceitar: 'Aceitar a proposta',
      notaAceite:
        'O aceite registra data, hora e IP, e fixa a forma de pagamento escolhida. Ele não ' +
        'substitui o contrato — é o passo que autoriza a geração dele com estes mesmos termos.',
      dados: {
        kicker: 'Dados para o contrato',
        titulo: 'Proposta aceita. Agora os dados.',
        sub:
          'São os dados que entram na qualificação das partes. Se você não tiver algum ' +
          'agora, pode voltar por este mesmo link depois — a proposta permanece aceita.',
        campos: [
          { k: 'razao', label: 'Razão social / nome da instituição', span: 'span 2' },
          { k: 'cnpj', label: 'CNPJ ou CPF', span: 'span 1' },
          { k: 'endereco', label: 'Endereço completo com CEP', span: 'span 1' },
          { k: 'representante', label: 'Nome do representante legal', span: 'span 1' },
          { k: 'cpf_rep', label: 'CPF do representante', span: 'span 1' },
          { k: 'cargo', label: 'Cargo ou função do representante', span: 'span 1' },
          { k: 'email', label: 'E-mail para assinatura eletrônica', span: 'span 1' }
        ],
        gerar: 'Gerar contrato',
        pronto: 'Tudo pronto.',
        incompleto: 'Preencha todos os campos para gerar o contrato.',
        corrija: 'Corrija os campos marcados em vermelho.',
        erros: {
          documento: 'CNPJ ou CPF inválido — confira os dígitos.',
          cpf: 'CPF inválido — confira os dígitos.',
          email: 'E-mail inválido.',
          curto: 'Campo muito curto.'
        },
        idioma: 'O contrato é emitido em português, sob a lei brasileira.'
      },
      contrato: {
        kicker: 'Contrato',
        titulo: 'Leia e assine',
        assinar: 'Assinar com Gov.br',
        pdf: 'Baixar PDF',
        duvida: 'Dúvida no WhatsApp'
      },
      assinado: {
        kicker: 'Contrato assinado',
        titulo: 'Está tudo assinado',
        texto: (numero, quando, provedor) =>
          `Contrato ${numero} assinado em ${quando} via ${provedor}. A via em PDF foi ` +
          'enviada ao seu e-mail e fica disponível na sua conta.',
        conta: 'Ir para minha conta',
        via: 'Baixar via assinada'
      },
      ajuda: {
        titulo: 'Dúvidas sobre o documento',
        ph: 'Ex.: o que acontece se eu atrasar uma parcela?',
        perguntar: 'Perguntar',
        resposta: 'Encaminhado. Se a resposta automática não resolver, use o botão do WhatsApp abaixo.',
        engenheiro: 'Falar com o engenheiro →',
        // Em português não há nada a explicar: o documento está no idioma da página.
        idiomaDoc: '',
        validade: (ate, dias) =>
          dias <= 0
            ? `Esta proposta expirou em ${ate}. Os valores precisam ser recotados.`
            : `Válida até ${ate} — ${dias === 1 ? 'último dia' : `faltam ${dias} dias`}. ` +
              'Depois disso o documento expira e os valores precisam ser recotados.'
      }
    },

    admin: {
      titulo: 'Administração — Garioli Labs',
      rotulo: 'Administração',
      carregando: 'Carregando…',
      semAcesso: 'Esta conta não tem acesso ao painel.',
      vistas: [
        { id: 'home', label: 'Hoje', kicker: 'Painel do dono', titulo: 'O que exige você agora' },
        { id: 'pipeline', label: 'Pipeline', kicker: 'Comercial', titulo: 'Da triagem à entrega' },
        { id: 'orcamentos', label: 'Orçamentos', kicker: 'Documento comercial', titulo: 'Escrever, enviar e acompanhar' },
        { id: 'financeiro', label: 'Financeiro', kicker: 'Recebimentos', titulo: 'Previsto, recebido e vencido' },
        { id: 'impostos', label: 'Impostos', kicker: 'Planejamento tributário', titulo: 'Quanto custa cada regime' },
        { id: 'projetos', label: 'Projetos', kicker: 'Execução', titulo: 'Frentes em andamento' },
        { id: 'conteudo', label: 'Cursos e licenças', kicker: 'Produtos digitais', titulo: 'Catálogo e alunos' },
        { id: 'documentos', label: 'Modelos', kicker: 'Biblioteca', titulo: 'Propostas e contratos versionados' },
        { id: 'auditoria', label: 'Auditoria', kicker: 'Registro', titulo: 'Trilha de aceites e assinaturas' }
      ],
      orcamentos: {
        novo: 'Novo orçamento',
        voltar: 'Voltar à lista',
        vazio: 'Nenhum orçamento ainda. O primeiro já nasce com o modelo da casa preenchido.',
        colunas: { numero: 'Número', cliente: 'Cliente', situacao: 'Situação', total: 'Total', validade: 'Validade' },
        situacoes: {
          rascunho: 'Rascunho',
          enviada: 'Enviada',
          aceita: 'Aceita',
          expirada: 'Expirada'
        },
        // O que cada acao faz precisa caber num botao e nao mentir: "copiar
        // link" copia o endereco que o cliente abre, nao o do painel.
        acoes: {
          editar: 'Editar',
          abrir: 'Ver como o cliente vê',
          copiar: 'Copiar link do cliente',
          copiado: 'Link copiado',
          enviar: 'Marcar como enviada',
          pdf: 'Exportar PDF',
          salvar: 'Salvar',
          criar: 'Criar orçamento',
          salvo: 'Salvo.'
        },
        travada: 'Proposta já aceita — o contrato saiu deste documento, então ele não se edita mais.',
        expiraEm: (d) => (d > 0 ? `expira em ${d} dia${d === 1 ? '' : 's'}` : 'expirada'),
        itens: (n) => `${n} ${n === 1 ? 'item' : 'itens'} de escopo`,
        secoes: {
          cliente: 'Cliente',
          documento: 'O documento',
          diagnostico: 'Diagnóstico técnico',
          escopo: 'Escopo e investimento',
          condicoes: 'Condições comerciais',
          aditivo: 'Aditivo técnico',
          avancado: 'Texto padrão do documento'
        },
        campos: {
          instituicao: 'Instituição ou empresa',
          cidade: 'Cidade e estado',
          representante: 'Quem responde pelo cliente',
          maps_url: 'Link do local no mapa',
          titulo: 'Título do projeto',
          resumo: 'Resumo em uma frase',
          disciplinas: 'Disciplinas contratadas',
          objeto: 'Objeto do contrato',
          diagnostico: 'Um achado por linha',
          criterio: 'Critério de aceite',
          incluso: 'O que está incluso',
          naoIncluso: 'O que não está incluso',
          prazoDias: 'Prazo (dias úteis)',
          prazoCondicao: 'Condição do prazo',
          descontoPct: 'Desconto (%)',
          descontoMotivo: 'Motivo do desconto',
          entradaPct: 'Entrada (%)',
          parcelas: 'Parcelas após a entrada',
          avistaPct: 'Desconto à vista (%)',
          validadeDias: 'Validade (dias)',
          itemTitulo: 'Frente',
          itemDescricao: 'O que entra nela',
          itemValor: 'Valor (R$)',
          addItem: 'Adicionar frente',
          removerItem: 'Remover',
          aditivoLigado: 'Incluir aditivo técnico nesta proposta',
          aditivoCortesia: 'Conceder o aditivo como cortesia',
          aditivoDimensao: 'Dimensão do aditivo',
          aditivoCondicoes: 'Condições do aditivo',
          aditivoValidade: 'Validade do aditivo (meses)'
        },
        resumo: {
          titulo: 'O que o cliente vai ver',
          subtotal: 'Subtotal',
          desconto: 'Desconto',
          total: 'Total',
          plano: 'Plano de pagamento',
          avista: 'À vista',
          economia: 'economia de',
          aditivo: 'Aditivo técnico',
          cortesia: 'concedido como cortesia',
          semItens: 'Adicione ao menos uma frente para ver os números.'
        }
      },
      atalhos: {
        site: 'Site institucional',
        cliente: 'Ver como cliente',
        triagem: 'Triagem pública',
        sair: 'Sair'
      },
      exigeAcao: 'Exige ação hoje',
      notaPipeline:
        'Cartões com borda vermelha estão parados há mais tempo que o normal da etapa. O ' +
        'valor exibido é o da proposta vigente; aditivos aprovados entram no financeiro, não aqui.',
      parcelas: 'Parcelas',
      notaMei: (faturado, limite, ano) =>
        [`Como MEI, o limite de faturamento anual é acompanhado aqui: `, `${faturado} de ${limite}`,
          ` em ${ano}. Ao passar de 80%, o sistema avisa para você planejar o enquadramento.`],
      atencao: 'Atenção',
      acumulados: 'acumulados',
      doTeto: (pct, teto) => `${pct}% do teto de ${teto}`,
      regimes: 'Regimes comparados · imposto do mês',
      recomendado: 'Recomendado',
      notaFatorR: (minimo, proLabore) =>
        [`O Anexo III só vale enquanto o `, 'Fator R', ` ficar em ${minimo}% ou mais da receita. ` +
          `Para o mês corrente, isso significa um pró-labore de `, proLabore,
          '. Abaixo disso a atividade cai no Anexo V e o imposto quase triplica.'],
      notaContador:
        'Comparação de apoio à decisão, não parecer contábil — confirme o enquadramento ' +
        'com seu contador antes de migrar.',
      bloqueio: 'Bloqueio:',
      notaModelos:
        'Contratos já assinados permanecem congelados na versão vigente na data da ' +
        'assinatura. Alterar um modelo nunca altera contrato em vigor — só o que for ' +
        'gerado a partir dali.',
      notaAuditoria:
        'Registro imutável: nenhuma linha pode ser editada ou apagada, inclusive por você. ' +
        'É essa trilha que sustenta o aceite e a assinatura em caso de contestação.'
    }
  }
};
