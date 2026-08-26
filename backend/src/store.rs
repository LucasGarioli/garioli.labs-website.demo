use crate::models::*;
use chrono::{Local, SecondsFormat};
use std::collections::HashMap;
use std::sync::{Arc, RwLock, RwLockReadGuard, RwLockWriteGuard};

#[derive(Default)]
pub struct Dados {
    pub solicitacoes: Vec<Solicitacao>,
    pub propostas: Vec<Proposta>,
    pub contratos: Vec<Contrato>,
    pub auditoria: Vec<LogAuditoria>,
    pub sequencia: u32,
    pub usuarios: Vec<Usuario>,
    /// token -> sessão. Expira por tempo; ver `Store::usuario_da_sessao`.
    pub sessoes: HashMap<String, Sessao>,
}

#[derive(Clone, Default)]
pub struct Store(pub Arc<RwLock<Dados>>);

pub fn agora() -> String {
    Local::now().to_rfc3339_opts(SecondsFormat::Secs, true)
}

impl Store {
    /// Leitura do estado, tolerante a envenenamento do lock.
    ///
    /// `RwLock` fica envenenado se alguma thread entrar em pânico segurando o
    /// guard, e a partir daí todo `unwrap()` sobre ele também entra em pânico —
    /// um handler quebrado derrubaria todas as requisições seguintes. Os dados
    /// aqui são coleções independentes, então retomar o conteúdo é seguro e
    /// preferível a propagar a falha.
    pub fn ler(&self) -> RwLockReadGuard<'_, Dados> {
        self.0.read().unwrap_or_else(|e| e.into_inner())
    }

    /// Escrita do estado, tolerante a envenenamento — ver [`Store::ler`].
    pub fn escrever(&self) -> RwLockWriteGuard<'_, Dados> {
        self.0.write().unwrap_or_else(|e| e.into_inner())
    }

    pub fn nova() -> Self {
        let s = Self::default();
        s.semear();
        s.semear_dono();
        s
    }

    /// Cria a conta do dono na subida.
    ///
    /// A senha vem de `GARIOLI_ADMIN_SENHA`. Sem a variável, sorteia uma e a
    /// escreve no log de inicialização — nunca há credencial padrão no
    /// repositório, e ninguém sobe isto em produção sem escolher a senha.
    fn semear_dono(&self) {
        let (senha, sorteada) = match std::env::var("GARIOLI_ADMIN_SENHA") {
            Ok(s) if !s.trim().is_empty() => (s, false),
            _ => (uuid::Uuid::new_v4().to_string()[..12].to_string(), true),
        };

        let hash = match crate::auth::hash_senha(&senha) {
            Ok(h) => h,
            Err(_) => {
                tracing::error!("não foi possível preparar a conta do dono");
                return;
            }
        };

        let email = std::env::var("GARIOLI_ADMIN_EMAIL")
            .unwrap_or_else(|_| "demo@exemplo.com".to_string());

        if sorteada {
            tracing::warn!(
                "conta do dono criada com senha sorteada — {} / {}  (defina GARIOLI_ADMIN_SENHA para fixar)",
                email,
                senha
            );
        }

        self.escrever().usuarios.push(Usuario {
            id: uuid::Uuid::new_v4().to_string(),
            nome: "Lucas Garioli".into(),
            email,
            senha_hash: hash,
            papel: Papel::Dono,
        });
    }

    /// Resolve o token de sessão em usuário, descartando sessão vencida.
    pub fn usuario_da_sessao(&self, token: &str) -> Option<Usuario> {
        let d = self.ler();
        let sessao = d.sessoes.get(token)?;
        if sessao.expira_em < Local::now() {
            return None;
        }
        d.usuarios.iter().find(|u| u.id == sessao.usuario_id).cloned()
    }

    /// Abre sessão e devolve o token.
    pub fn abrir_sessao(&self, usuario_id: &str, horas: i64) -> String {
        let token = uuid::Uuid::new_v4().to_string();
        self.escrever().sessoes.insert(
            token.clone(),
            Sessao {
                usuario_id: usuario_id.to_string(),
                expira_em: Local::now() + chrono::Duration::hours(horas),
            },
        );
        token
    }

    pub fn fechar_sessao(&self, token: &str) {
        self.escrever().sessoes.remove(token);
    }

    pub fn achar_por_email(&self, email: &str) -> Option<Usuario> {
        let alvo = email.trim().to_lowercase();
        self.ler().usuarios.iter().find(|u| u.email.to_lowercase() == alvo).cloned()
    }

    pub fn criar_cliente(&self, nome: &str, email: &str, senha_hash: &str) -> Usuario {
        let usuario = Usuario {
            id: uuid::Uuid::new_v4().to_string(),
            nome: nome.trim().to_string(),
            email: email.trim().to_lowercase(),
            senha_hash: senha_hash.to_string(),
            papel: Papel::Cliente,
        };
        self.escrever().usuarios.push(usuario.clone());
        usuario
    }

    /// Registro append-only. Não existe caminho de remoção — por decisão de projeto:
    /// é essa trilha que sustenta o aceite e a assinatura em caso de contestação.
    pub fn registrar(&self, tipo: &str, evento: &str, ip: &str, critico: bool) {
        let mut d = self.escrever();
        d.auditoria.insert(
            0,
            LogAuditoria {
                id: uuid::Uuid::new_v4().to_string(),
                quando: agora(),
                tipo: tipo.to_string(),
                evento: evento.to_string(),
                ip: ip.to_string(),
                critico,
            },
        );
    }

    pub fn proximo_protocolo(&self) -> String {
        let mut d = self.escrever();
        d.sequencia += 1;
        format!("SOL-{}-{:04}", Local::now().format("%Y"), 147 + d.sequencia)
    }

    fn semear(&self) {
        let proposta = Proposta {
            id: "PRJ-2026-0091".into(),
            instituicao: "Comunidade Vale Verde".into(),
            cidade: "Vila Nova · ES".into(),
            maps_url: "https://www.google.com/maps/search/?api=1&query=Comunidade+Vale+Verde+ES".into(),
            escopo: vec![
                ItemEscopo {
                    titulo: "Projeto acústico".into(),
                    descricao: "Medição, cálculo de RT60 e projeto de tratamento com reforma do forro.".into(),
                    valor: "R$ 6.000,00".into(),
                },
                ItemEscopo {
                    titulo: "Projeto de sonorização".into(),
                    descricao: "Dimensionamento de PA, fluxo de sinal e memorial para compra.".into(),
                    valor: "R$ 3.000,00".into(),
                },
                ItemEscopo {
                    titulo: "Iluminação cênica básica".into(),
                    descricao: "Plano de luz em camadas, circuitos e mapa de canais.".into(),
                    valor: "R$ 2.500,00".into(),
                },
            ],
            premissas: vec![
                Premissa { label: "Área declarada".into(), valor: "120 a 300 m²".into() },
                Premissa { label: "Lotação típica".into(), valor: "cerca de 300 lugares".into() },
                Premissa { label: "Acabamentos".into(), valor: "piso cerâmico, alvenaria pintada, forro de PVC".into() },
                Premissa { label: "Prazo de entrega".into(), valor: "30 dias úteis após 1ª parcela".into() },
                Premissa { label: "Revisões incluídas".into(), valor: "2 rodadas".into() },
            ],
            total: "R$ 10.000,00".into(),
            condicoes: "Desconto de 10% aplicado. 2 parcelas de R$ 5.175,00 ou R$ 9.832,50 à vista. Valores ainda sujeitos a negociação.".into(),
            validade: "15 dias a contar do envio".into(),
            aceita_em: None,
            observacoes: None,
        };

        let mut d = self.escrever();
        d.propostas.push(proposta);
        d.auditoria.push(LogAuditoria {
            id: uuid::Uuid::new_v4().to_string(),
            quando: agora(),
            tipo: "Envio".into(),
            evento: "Proposta PRJ-2026-0091 enviada por e-mail e WhatsApp".into(),
            ip: "—".into(),
            critico: false,
        });
    }
}

/// As cláusulas do contrato padrão, geradas a partir dos dados que o cliente informa.
/// Espelham o contrato revisado em PDF — a redação vive aqui para que o mesmo texto
/// sirva a tela e ao documento.
pub fn clausulas(dados: &DadosContrato, proposta: &Proposta) -> Vec<Clausula> {
    vec![
        Clausula {
            titulo: "Cláusula 1ª — Das partes".into(),
            texto: format!(
                "CONTRATADA: 00.000.000 NOME DA CONTRATADA (Garioli Labs), CNPJ 00.000.000/0001-00,                  MEI, com sede em Cachoeiro de Itapemirim/ES. CONTRATANTE: {}, inscrita sob o nº {},                  com sede em {}, representada por {}, CPF {}, na qualidade de {}.",
                dados.razao, dados.cnpj, dados.endereco, dados.representante, dados.cpf_rep, dados.cargo
            ),
        },
        Clausula {
            titulo: "Cláusula 2ª — Do objeto".into(),
            texto: format!(
                "Prestação de serviços de engenharia de projeto conforme escopo da proposta {}                  — documento que integra este contrato como anexo e prevalece sobre entendimentos verbais.                  O objeto é o projeto técnico; não abrange execução de obra, instalação, fornecimento                  de equipamentos nem responsabilidade por serviços de terceiros.",
                proposta.id
            ),
        },
        Clausula {
            titulo: "Cláusula 3ª — Do prazo".into(),
            texto: "O prazo de entrega começa a contar da confirmação da 1ª parcela e do recebimento                     integral das informações e acessos necessários, suspendendo-se enquanto pendente                     obrigação da CONTRATANTE.".into(),
        },
        Clausula {
            titulo: "Cláusula 4ª — Do preço e do pagamento".into(),
            texto: format!(
                "Pelo objeto, a CONTRATANTE pagará {}. {} O atraso implica correção monetária,                  juros de 1% ao mês e multa de 2%, nos termos do art. 406 do Código Civil.",
                proposta.total, proposta.condicoes
            ),
        },
        Clausula {
            titulo: "Cláusula 5ª — Da propriedade intelectual".into(),
            texto: "Os direitos patrimoniais sobre o projeto permanecem com a CONTRATADA até a                     quitação integral, nos termos da Lei 9.610/98. Quitado o preço, a CONTRATANTE                     recebe licença de uso para a finalidade e o local objeto do contrato, sendo vedada                     a cessão, reprodução ou reuso em outra unidade sem autorização escrita.".into(),
        },
        Clausula {
            titulo: "Cláusula 6ª — Das revisões e do suporte".into(),
            texto: "Estão incluídas 2 rodadas de revisão sobre o escopo contratado. Após a entrega,                     dúvidas de interpretação e de implantação do projeto são esclarecidas sem custo                     adicional, por prazo indeterminado. Revisões que alterem premissas, área ou                     disciplinas constituem novo escopo, mediante aditivo.".into(),
        },
        Clausula {
            titulo: "Cláusula 7ª — Da rescisão".into(),
            texto: "A rescisão imotivada pela CONTRATANTE após o início dos trabalhos implica multa                     de 20% sobre o saldo, sem prejuízo do pagamento das etapas já executadas.                     A inadimplência superior a 15 dias autoriza a suspensão das entregas.".into(),
        },
        Clausula {
            titulo: "Cláusula 8ª — Da execução por terceiros".into(),
            texto: "A CONTRATADA não responde por resultado quando a execução divergir do projeto,                     quando houver substituição de materiais ou equipamentos especificados, ou quando                     a obra for conduzida sem o acompanhamento técnico previsto em aditivo.".into(),
        },
        Clausula {
            titulo: "Cláusula 9ª — Da proteção de dados e da confidencialidade".into(),
            texto: "As partes tratarão os dados pessoais envolvidos conforme a Lei 13.709/2018 (LGPD),                     limitando-se às finalidades deste contrato, e manterão sigilo recíproco sobre                     informações técnicas, financeiras e de projeto.".into(),
        },
        Clausula {
            titulo: "Cláusula 10ª — Do portfólio".into(),
            texto: "A CONTRATANTE autoriza a CONTRATADA a divulgar imagens do resultado e a citar o                     projeto em portfólio, ressalvada a possibilidade de revogação por escrito.".into(),
        },
        Clausula {
            titulo: "Cláusula 11ª — Do foro e da assinatura".into(),
            texto: "Fica eleito o foro da Comarca de Cachoeiro de Itapemirim/ES. As partes reconhecem                     a validade da assinatura eletrônica, nos termos da Lei 14.063/2020 e do art. 10,                     §2º da MP 2.200-2/2001.".into(),
        },
    ]
}
