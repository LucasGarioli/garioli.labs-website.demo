use crate::models::{Frente, NovaSolicitacao, Opcao, Pergunta, Premissa};

macro_rules! op {
    ($v:expr, $d:expr) => {
        Opcao { val: $v, label: $v, desc: $d }
    };
}

/// Idioma pedido pela página.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Idioma {
    Pt,
    En,
}

impl Idioma {
    /// Qualquer coisa que não seja inglês cai em português — o site é
    /// brasileiro e um parâmetro estranho não pode derrubar a triagem.
    pub fn de(codigo: Option<&str>) -> Self {
        match codigo {
            Some("en") => Idioma::En,
            _ => Idioma::Pt,
        }
    }
}

/// O questionário no idioma pedido. A estrutura é uma só: o inglês é o mesmo
/// vetor com os textos de tela trocados, o que impede as duas versões de
/// divergirem em número de perguntas ou em chave de resposta.
pub fn schema_em(idioma: Idioma) -> Vec<Pergunta> {
    let base = schema();
    match idioma {
        Idioma::Pt => base,
        Idioma::En => base.into_iter().map(traduz).collect(),
    }
}

/// Textos de tela em inglês, por chave de pergunta e por chave de opção.
fn traduz(mut p: Pergunta) -> Pergunta {
    if let Some((rail, title, hint)) = pergunta_en(p.key) {
        p.rail = rail;
        p.title = title;
        p.hint = hint;
    }
    p.options = p
        .options
        .into_iter()
        .map(|mut o| {
            if let Some((label, desc)) = opcao_en(o.val) {
                o.label = label;
                o.desc = desc;
            }
            o
        })
        .collect();
    p
}

fn pergunta_en(key: &str) -> Option<(&'static str, &'static str, &'static str)> {
    Some(match key {
        "tipo" => ("Type of space", "What kind of space is it?",
            "Pick the closest match. If it sits between two, choose the main use."),
        "dor" => ("What bothers you", "What bothers you most today?",
            "Tick everything that happens. You do not need the technical name for it."),
        "area" => ("Size", "Roughly how big is it?",
            "A range is enough. If you do not know, pick the last option — we measure it."),
        "altura" => ("Ceiling height", "And the ceiling height?",
            "Compare it with what you know: an ordinary house is about 2.5 m."),
        "lugares" => ("Audience", "How many people does the space hold?",
            "The typical attendance, not the maximum on the licence."),
        "existe" => ("What is already there", "What is already installed?",
            "Tick whatever exists, even if it is old or faulty. Reusing it lowers the investment."),
        "quer" => ("What to quote", "What would you like quoted?",
            "You can tick more than one. If you are not sure, tick the last option."),
        "prazo" => ("Timing", "When do you plan to build?",
            "This sets the project queue, not the price."),
        "docs" => ("Documents", "Do you have drawings or measurements?",
            "Not required. With drawings, the project starts sooner."),
        "contato" => ("Contact", "Where do we send the answer?",
            "We use these details only to answer this request."),
        "revisao" => ("Review", "Check before sending",
            "Review what you told us. You can change any answer."),
        _ => return None,
    })
}

fn opcao_en(val: &str) -> Option<(&'static str, &'static str)> {
    Some(match val {
        // tipo
        "Igreja ou templo" => ("Church or temple", "Worship, live music, amplified speech"),
        "Auditório ou teatro" => ("Auditorium or theatre", "Lectures, performances, events"),
        "Estúdio ou home studio" => ("Studio or home studio", "Recording, mixing, production"),
        "Sala de aula ou treinamento" => ("Classroom or training room", "In-person or hybrid teaching"),
        "Comércio ou academia" => ("Retail or gym", "Shop, restaurant, bar, gym"),
        "Outro uso" => ("Another use", "Describe it later in the contact step"),
        // dor
        "Não se entende o que é falado" => ("Speech is hard to understand", "It arrives blurred, mostly at the back"),
        "O som ecoa muito" => ("The room echoes", "A tail hangs after every word or note"),
        "Microfonia" => ("Feedback", "That high squeal when the volume goes up"),
        "Volume alto e cansativo" => ("Loud and tiring", "You have to shout, and everyone leaves with a headache"),
        "Barulho passa entre ambientes" => ("Noise passes between rooms", "One room hears the other"),
        "Vizinhos reclamam" => ("Neighbours complain", "The sound leaves the building"),
        "Ainda não existe nada instalado" => ("Nothing installed yet", "New space or under construction"),
        // area
        "Até 50 m²" => ("Up to 50 m²", "An ordinary room"),
        "50 a 120 m²" => ("50 to 120 m²", "Large room or small hall"),
        "120 a 300 m²" => ("120 to 300 m²", "Medium hall"),
        "300 a 600 m²" => ("300 to 600 m²", "Large hall"),
        "Mais de 600 m²" => ("Over 600 m²", "Sports hall, large temple, warehouse"),
        "Não sei" => ("I do not know", "We measure it on the site visit"),
        // altura
        "Baixo, como uma casa" => ("Low, like a house", "About 2.5 m"),
        "Médio" => ("Medium", "Between 3 and 4 m"),
        "Alto" => ("High", "Between 4 and 7 m"),
        "Muito alto" => ("Very high", "Over 7 m, or double height"),
        // lugares
        "Até 30 pessoas" => ("Up to 30 people", ""),
        "30 a 100 pessoas" => ("30 to 100 people", ""),
        "100 a 300 pessoas" => ("100 to 300 people", ""),
        "300 a 800 pessoas" => ("300 to 800 people", ""),
        "Mais de 800 pessoas" => ("Over 800 people", ""),
        // existe
        "Caixas de som" => ("Loudspeakers", ""),
        "Mesa de som" => ("Mixing desk", "Analogue or digital"),
        "Microfones" => ("Microphones", "Wired or wireless"),
        "Projetor ou TV" => ("Projector or TV", ""),
        "Iluminação de palco" => ("Stage lighting", "Beyond the room's own lamps"),
        "Tratamento acústico" => ("Acoustic treatment", "Foam, panels, technical curtains"),
        "Nada disso" => ("None of these", "Space with no equipment"),
        // quer
        "Isolamento acústico" => ("Sound isolation", "Keep sound from getting in or out"),
        "Projeto de sonorização" => ("Sound system design", "Speakers, desk, microphones, signal flow"),
        "Projeto de iluminação" => ("Lighting design", "Stage and scenic light"),
        "Projeto de projeção ou vídeo" => ("Projection or video design", "Screens, projectors, cameras, streaming"),
        "Consultoria de compra" => ("Purchase consulting", "Guidance to buy without mistakes"),
        "Não sei, quero orientação" => ("I am not sure, I want guidance", "We diagnose it and recommend the route"),
        // prazo
        "O quanto antes" => ("As soon as possible", "Works under way or a date already booked"),
        "Em 1 a 3 meses" => ("In 1 to 3 months", ""),
        "Em 3 a 6 meses" => ("In 3 to 6 months", ""),
        "Ainda estudando" => ("Still considering", "I want to understand the investment before deciding"),
        // docs
        "Tenho planta em PDF ou DWG" => ("I have drawings in PDF or DWG", ""),
        "Tenho medidas anotadas" => ("I have measurements written down", "Width, length and height"),
        "Não tenho nada" => ("I have nothing", "We do the survey"),
        "Posso medir se me orientarem" => ("I can measure if you guide me", "We send a simple script"),
        _ => return None,
    })
}

/// O questionário à prova de erro. Toda pergunta oferece saída ("Não sei"),
/// nenhuma exige vocabulário técnico e nenhuma calcula preço para o cliente.
pub fn schema() -> Vec<Pergunta> {
    vec![
        Pergunta {
            key: "tipo", rail: "Tipo de espaço",
            title: "Que tipo de espaço é?",
            hint: "Escolha o que mais se aproxima. Se estiver entre dois, escolha o uso principal.",
            kind: None, multi: false,
            options: vec![
                op!("Igreja ou templo", "Culto, música ao vivo, fala amplificada"),
                op!("Auditório ou teatro", "Palestras, apresentações, eventos"),
                op!("Estúdio ou home studio", "Gravação, mixagem, produção"),
                op!("Sala de aula ou treinamento", "Ensino presencial ou híbrido"),
                op!("Comércio ou academia", "Loja, restaurante, bar, academia"),
                op!("Outro uso", "Descreva depois no campo de contato"),
            ],
        },
        Pergunta {
            key: "dor", rail: "O que incomoda",
            title: "O que mais incomoda hoje?",
            hint: "Marque tudo o que acontece. Não precisa saber o nome técnico do problema.",
            kind: None, multi: true,
            options: vec![
                op!("Não se entende o que é falado", "A fala chega embolada, principalmente no fundo"),
                op!("O som ecoa muito", "Fica um rastro depois de cada palavra ou nota"),
                op!("Microfonia", "Aquele apito agudo quando o volume sobe"),
                op!("Volume alto e cansativo", "Precisa gritar, e no fim todos saem com dor de cabeça"),
                op!("Barulho passa entre ambientes", "Uma sala escuta a outra"),
                op!("Vizinhos reclamam", "O som sai do prédio"),
                op!("Ainda não existe nada instalado", "Espaço novo ou em obra"),
            ],
        },
        Pergunta {
            key: "area", rail: "Tamanho",
            title: "Qual o tamanho aproximado?",
            hint: "Uma faixa já basta. Se não souber, escolha a última opção — nós medimos.",
            kind: None, multi: false,
            options: vec![
                op!("Até 50 m²", "Uma sala comum"),
                op!("50 a 120 m²", "Sala grande ou salão pequeno"),
                op!("120 a 300 m²", "Salão médio"),
                op!("300 a 600 m²", "Salão grande"),
                op!("Mais de 600 m²", "Ginásio, templo grande, galpão"),
                op!("Não sei", "Vamos medir na visita técnica"),
            ],
        },
        Pergunta {
            key: "altura", rail: "Altura do teto",
            title: "E a altura do teto?",
            hint: "Compare com o que você conhece: uma casa comum tem cerca de 2,5 m.",
            kind: None, multi: false,
            options: vec![
                op!("Baixo, como uma casa", "Cerca de 2,5 m"),
                op!("Médio", "Entre 3 e 4 m"),
                op!("Alto", "Entre 4 e 7 m"),
                op!("Muito alto", "Acima de 7 m, ou pé-direito duplo"),
                op!("Não sei", "Vamos medir na visita técnica"),
            ],
        },
        Pergunta {
            key: "lugares", rail: "Público",
            title: "Quantas pessoas o espaço atende?",
            hint: "A lotação típica, não a máxima do alvará.",
            kind: None, multi: false,
            options: vec![
                op!("Até 30 pessoas", ""),
                op!("30 a 100 pessoas", ""),
                op!("100 a 300 pessoas", ""),
                op!("300 a 800 pessoas", ""),
                op!("Mais de 800 pessoas", ""),
            ],
        },
        Pergunta {
            key: "existe", rail: "O que já existe",
            title: "O que já existe instalado?",
            hint: "Marque o que houver, mesmo que esteja antigo ou com defeito. Reaproveitar reduz o investimento.",
            kind: None, multi: true,
            options: vec![
                op!("Caixas de som", ""),
                op!("Mesa de som", "Analógica ou digital"),
                op!("Microfones", "Com fio ou sem fio"),
                op!("Projetor ou TV", ""),
                op!("Iluminação de palco", "Além das lâmpadas do ambiente"),
                op!("Tratamento acústico", "Espumas, painéis, cortinas técnicas"),
                op!("Nada disso", "Espaço sem equipamento"),
            ],
        },
        Pergunta {
            key: "quer", rail: "O que orçar",
            title: "O que você gostaria de orçar?",
            hint: "Pode marcar mais de um. Se não souber, marque a última opção.",
            kind: None, multi: true,
            options: vec![
                op!("Tratamento acústico", "Corrigir eco e inteligibilidade dentro do ambiente"),
                op!("Isolamento acústico", "Impedir que o som entre ou saia"),
                op!("Projeto de sonorização", "Caixas, mesa, microfones, fluxo de sinal"),
                op!("Projeto de iluminação", "Luz cênica e de palco"),
                op!("Projeto de projeção ou vídeo", "Telas, projetores, câmeras, transmissão"),
                op!("Consultoria de compra", "Orientação para comprar sem errar"),
                op!("Não sei, quero orientação", "Diagnosticamos e recomendamos o caminho"),
            ],
        },
        Pergunta {
            key: "prazo", rail: "Prazo",
            title: "Quando pretende executar?",
            hint: "Isso define a fila de projeto, não o preço.",
            kind: None, multi: false,
            options: vec![
                op!("O quanto antes", "Obra em andamento ou evento marcado"),
                op!("Em 1 a 3 meses", ""),
                op!("Em 3 a 6 meses", ""),
                op!("Ainda estudando", "Quero entender o investimento antes de decidir"),
            ],
        },
        Pergunta {
            key: "docs", rail: "Documentos",
            title: "Você tem planta ou medidas do espaço?",
            hint: "Não é obrigatório. Com planta, o projeto começa mais rápido.",
            kind: None, multi: false,
            options: vec![
                op!("Tenho planta em PDF ou DWG", ""),
                op!("Tenho medidas anotadas", "Largura, comprimento e altura"),
                op!("Não tenho nada", "Fazemos o levantamento"),
                op!("Posso medir se me orientarem", "Enviamos um roteiro simples"),
            ],
        },
        Pergunta {
            key: "contato", rail: "Contato",
            title: "Para onde enviamos a resposta?",
            hint: "Usamos esses dados apenas para responder a esta solicitação.",
            kind: Some("contato"), multi: false, options: vec![],
        },
        Pergunta {
            key: "revisao", rail: "Revisão",
            title: "Confira antes de enviar",
            hint: "Revise o que você informou. Você pode alterar qualquer resposta.",
            kind: Some("revisao"), multi: false, options: vec![],
        },
    ]
}

/// Faixa interna por frente, em centavos. Nunca exposta ao cliente.
fn faixa_frente(nome: &str) -> (i64, i64, &'static str) {
    match nome {
        "Tratamento acústico" => (320_000, 780_000,
            "Medição, cálculo de tempo de reverberação e projeto de superfícies absorvedoras."),
        "Isolamento acústico" => (380_000, 920_000,
            "Cálculo de perda de transmissão e detalhamento construtivo de vedação."),
        "Projeto de sonorização" => (280_000, 650_000,
            "Dimensionamento de PA, fluxo de sinal, ganho de realimentação e memorial."),
        "Projeto de iluminação" => (180_000, 420_000,
            "Plano de luz em camadas, potências, circuitos e mapa de canais."),
        "Projeto de projeção ou vídeo" => (220_000, 500_000,
            "Distâncias, luminância, telas, cabeamento e cadeia de vídeo."),
        "Consultoria de compra" => (90_000, 240_000,
            "Lista técnica de referência e critérios de escolha por faixa de preço."),
        _ => (250_000, 600_000,
            "Diagnóstico técnico com recomendação de escopo e prioridades."),
    }
}

/// Multiplicador de dimensionamento: a área declarada é o que move o preço.
fn multiplicador_area(area: &str) -> f64 {
    if area.starts_with("Mais de 600") { 1.9 }
    else if area.starts_with("300 a 600") { 1.5 }
    else if area.starts_with("120 a 300") { 1.2 }
    else { 1.0 }
}

pub fn frentes(nova: &NovaSolicitacao) -> Vec<Frente> {
    let escolhas = nova
        .respostas
        .get("quer")
        .map(|r| r.como_lista())
        .unwrap_or_else(|| vec!["Não sei, quero orientação".to_string()]);

    let area = nova.respostas.get("area").map(|r| r.texto()).unwrap_or_default();
    let m = multiplicador_area(&area);

    escolhas
        .iter()
        .map(|nome| {
            let (lo, hi, desc) = faixa_frente(nome);
            Frente {
                titulo: nome.clone(),
                descricao: desc.to_string(),
                minimo_centavos: (lo as f64 * m).round() as i64,
                maximo_centavos: (hi as f64 * m).round() as i64,
            }
        })
        .collect()
}

pub fn premissas(nova: &NovaSolicitacao) -> Vec<Premissa> {
    let campo = |chave: &str| {
        nova.respostas
            .get(chave)
            .map(|r| r.texto())
            .filter(|s| !s.is_empty())
            .unwrap_or_else(|| "—".to_string())
    };

    vec![
        Premissa { label: "Uso do espaço".into(), valor: campo("tipo") },
        Premissa { label: "Área declarada".into(), valor: campo("area") },
        Premissa { label: "Pé-direito".into(), valor: campo("altura") },
        Premissa { label: "Lotação típica".into(), valor: campo("lugares") },
        Premissa { label: "Sintomas relatados".into(), valor: campo("dor") },
        Premissa { label: "Infraestrutura existente".into(), valor: campo("existe") },
        Premissa { label: "Documentação".into(), valor: campo("docs") },
        Premissa { label: "Prazo pretendido".into(), valor: campo("prazo") },
    ]
}

/// Sinais que exigem visita ou cuidado antes de fechar valor.
pub fn alertas(nova: &NovaSolicitacao) -> Vec<String> {
    let mut out = Vec::new();
    let area = nova.respostas.get("area").map(|r| r.texto()).unwrap_or_default();
    if area.contains("Não sei") {
        out.push("Área declarada como \"não sei\" exige visita antes de fechar valor.".into());
    }
    let quer = nova.respostas.get("quer").map(|r| r.como_lista()).unwrap_or_default();
    if quer.iter().any(|q| q == "Isolamento acústico")
        && quer.iter().any(|q| q == "Tratamento acústico")
    {
        out.push("Isolamento e tratamento pedidos juntos: confirmar se há obra civil prevista.".into());
    }
    let dor = nova.respostas.get("dor").map(|r| r.como_lista()).unwrap_or_default();
    if dor.iter().any(|d| d == "Vizinhos reclamam") {
        out.push("Reclamação de vizinhos: verificar exigência legal municipal de ruído.".into());
    }
    if quer.iter().any(|q| q == "Não sei, quero orientação") {
        out.push("Escopo indefinido: proposta deve começar por diagnóstico pago.".into());
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::{Contato, Resposta};
    use std::collections::HashMap;

    fn nova(area: &str, quer: Vec<&str>) -> NovaSolicitacao {
        let mut respostas = HashMap::new();
        respostas.insert("area".to_string(), Resposta::Uma(area.to_string()));
        respostas.insert(
            "quer".to_string(),
            Resposta::Varias(quer.into_iter().map(String::from).collect()),
        );
        NovaSolicitacao {
            respostas,
            contato: Contato {
                nome: "Teste".into(), org: String::new(), email: "a@b.c".into(),
                fone: String::new(), cidade: String::new(),
            },
            criar_conta: false,
        }
    }

    #[test]
    fn area_maior_aumenta_a_faixa() {
        let pequena = frentes(&nova("Até 50 m²", vec!["Tratamento acústico"]));
        let grande = frentes(&nova("Mais de 600 m²", vec!["Tratamento acústico"]));
        assert!(grande[0].minimo_centavos > pequena[0].minimo_centavos);
    }

    #[test]
    fn area_desconhecida_gera_alerta() {
        let a = alertas(&nova("Não sei", vec!["Tratamento acústico"]));
        assert!(!a.is_empty());
    }

    #[test]
    fn schema_tem_saida_em_toda_pergunta_de_medida() {
        let s = schema();
        for chave in ["area", "altura"] {
            let p = s.iter().find(|p| p.key == chave).unwrap();
            assert!(p.options.iter().any(|o| o.val.contains("Não sei")));
        }
    }

    /// O inglês é tradução de tela, não outro questionário: mesma quantidade
    /// de perguntas, mesmas chaves e mesmas chaves de resposta. Se isto
    /// quebrar, uma solicitação em inglês deixa de classificar igual.
    #[test]
    fn ingles_preserva_as_chaves() {
        let pt = schema_em(Idioma::Pt);
        let en = schema_em(Idioma::En);
        assert_eq!(pt.len(), en.len());
        for (a, b) in pt.iter().zip(en.iter()) {
            assert_eq!(a.key, b.key);
            assert_eq!(a.multi, b.multi);
            assert_eq!(a.kind, b.kind);
            assert_eq!(a.options.len(), b.options.len());
            for (x, y) in a.options.iter().zip(b.options.iter()) {
                assert_eq!(x.val, y.val, "a chave de resposta não pode mudar de idioma");
            }
        }
    }

    /// Toda opção e toda pergunta têm tradução: um texto esquecido apareceria
    /// em português no meio da tela em inglês.
    #[test]
    fn nada_fica_sem_traducao() {
        for p in schema() {
            assert!(pergunta_en(p.key).is_some(), "pergunta sem tradução: {}", p.key);
            for o in p.options {
                assert!(opcao_en(o.val).is_some(), "opção sem tradução: {}", o.val);
            }
        }
    }

    #[test]
    fn idioma_desconhecido_cai_em_portugues() {
        assert_eq!(Idioma::de(Some("de")), Idioma::Pt);
        assert_eq!(Idioma::de(None), Idioma::Pt);
        assert_eq!(Idioma::de(Some("en")), Idioma::En);
    }
}
