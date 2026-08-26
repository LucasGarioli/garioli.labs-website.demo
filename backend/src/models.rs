use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ---------- triagem ----------

#[derive(Debug, Clone, Serialize)]
pub struct Opcao {
    /// Chave da resposta. Não muda com o idioma: é o que a classificação
    /// compara e o que fica gravado na solicitação.
    pub val: &'static str,
    /// O que a pessoa lê. Igual a `val` em português, traduzido em inglês.
    pub label: &'static str,
    pub desc: &'static str,
}

#[derive(Debug, Clone, Serialize)]
pub struct Pergunta {
    pub key: &'static str,
    pub rail: &'static str,
    pub title: &'static str,
    pub hint: &'static str,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub kind: Option<&'static str>,
    pub multi: bool,
    pub options: Vec<Opcao>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Contato {
    #[serde(default)]
    pub nome: String,
    #[serde(default)]
    pub org: String,
    #[serde(default)]
    pub email: String,
    #[serde(default)]
    pub fone: String,
    #[serde(default)]
    pub cidade: String,
}

/// Resposta pode ser texto (escolha única) ou lista (múltipla).
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(untagged)]
pub enum Resposta {
    Uma(String),
    Varias(Vec<String>),
}

impl Resposta {
    pub fn como_lista(&self) -> Vec<String> {
        match self {
            Resposta::Uma(s) => vec![s.clone()],
            Resposta::Varias(v) => v.clone(),
        }
    }

    pub fn texto(&self) -> String {
        self.como_lista().join(" · ")
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct NovaSolicitacao {
    pub respostas: HashMap<String, Resposta>,
    pub contato: Contato,
    #[serde(default)]
    pub criar_conta: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct SolicitacaoCriada {
    pub id: String,
    pub protocolo: String,
    pub conta_criada: bool,
}

#[derive(Debug, Clone, Serialize)]
pub struct Premissa {
    pub label: String,
    pub valor: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Frente {
    pub titulo: String,
    pub descricao: String,
    pub minimo_centavos: i64,
    pub maximo_centavos: i64,
}

#[derive(Debug, Clone, Serialize)]
pub struct Solicitacao {
    pub id: String,
    pub protocolo: String,
    pub criada_em: String,
    pub situacao: String,
    pub solicitante: String,
    pub instituicao: String,
    pub cidade: String,
    /// Como responder. Coletado na triagem e levado até o admin — sem isto o
    /// dono aprova uma solicitação sem ter como falar com quem a enviou.
    pub email: String,
    pub fone: String,
    pub premissas: Vec<Premissa>,
    pub frentes: Vec<Frente>,
    pub faixa_minima_centavos: i64,
    pub faixa_maxima_centavos: i64,
    pub alertas: Vec<String>,
}

// ---------- proposta e contrato ----------

/// Item do escopo como fica guardado: o preço é centavo, não texto.
///
/// Enquanto era `valor: "R$ 6.000,00"`, o subtotal, o desconto e o total eram
/// três frases digitadas que por acaso concordavam entre si. Mudar uma linha do
/// escopo deixava as outras mentindo, e nada no sistema percebia.
#[derive(Debug, Clone)]
pub struct ItemEscopo {
    pub titulo: String,
    pub descricao: String,
    pub centavos: i64,
}

/// Item do escopo como o documento o mostra.
#[derive(Debug, Clone, Serialize)]
pub struct ItemEscopoPublico {
    pub titulo: String,
    pub descricao: String,
    pub valor: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum FormaPagamento {
    Parcelado,
    Avista,
}

#[derive(Debug, Clone, Serialize)]
pub struct Pagamento {
    pub parcelas: u32,
    pub parcela: String,
    pub parcela_centavos: i64,
    pub avista: String,
    pub avista_centavos: i64,
    pub desconto_avista_pct: i64,
}

/// A proposta como fica guardada. Não deriva `Serialize`: o que sai na resposta
/// é [`PropostaPublica`], calculada a partir daqui.
#[derive(Debug, Clone)]
pub struct Proposta {
    pub id: String,
    pub instituicao: String,
    pub cidade: String,
    pub maps_url: String,
    pub escopo: Vec<ItemEscopo>,
    pub premissas: Vec<Premissa>,
    pub desconto_pct: i64,
    pub parcelas: u32,
    /// Quem paga à vista tira este percentual do já descontado. É a diferença
    /// entre receber em trinta dias e receber na assinatura.
    pub desconto_avista_pct: i64,
    /// Deslocamentos em dias a partir de hoje, e não datas fixas: a proposta
    /// enviada ontem continua tendo sido enviada ontem em qualquer momento.
    pub enviada_em_dias: i64,
    pub validade_dias: i64,
    pub aceita_em: Option<String>,
    /// Escolhida no aceite. É ela que decide o texto da cláusula 4ª.
    pub forma_pagamento: Option<FormaPagamento>,
    pub observacoes: Option<String>,
}

/// A proposta como o cliente e o contrato a veem.
#[derive(Debug, Clone, Serialize)]
pub struct PropostaPublica {
    pub id: String,
    pub instituicao: String,
    pub cidade: String,
    pub maps_url: String,
    pub escopo: Vec<ItemEscopoPublico>,
    pub premissas: Vec<Premissa>,
    pub subtotal: String,
    pub desconto_pct: i64,
    pub desconto: String,
    pub total: String,
    pub total_centavos: i64,
    /// O que será efetivamente pago: muda quando a escolha é à vista.
    pub efetivo: String,
    pub pagamento: Pagamento,
    /// A condição que entra na cláusula 4ª — descreve a forma escolhida, não as
    /// duas. Um documento que oferece dois valores ainda vai ser discutido.
    pub condicoes: String,
    pub enviada_em: String,
    pub expira_em: String,
    pub validade_dias: i64,
    pub dias_restantes: i64,
    pub aceita_em: Option<String>,
    pub forma_pagamento: Option<FormaPagamento>,
    pub observacoes: Option<String>,
}

/// Real com centavos, no formato brasileiro — `1_035_000` vira `R$ 10.350,00`.
pub fn brl(centavos: i64) -> String {
    let negativo = centavos < 0;
    let c = centavos.abs();
    let inteiros = (c / 100).to_string();
    let mut grupos = String::new();
    for (i, d) in inteiros.chars().rev().enumerate() {
        if i > 0 && i % 3 == 0 {
            grupos.push('.');
        }
        grupos.push(d);
    }
    let inteiros: String = grupos.chars().rev().collect();
    format!("{}R$ {},{:02}", if negativo { "-" } else { "" }, inteiros, c % 100)
}

impl Proposta {
    pub fn publica(&self) -> PropostaPublica {
        let bruto: i64 = self.escopo.iter().map(|e| e.centavos).sum();
        let desconto = (bruto * self.desconto_pct) / 100;
        let total = bruto - desconto;
        let parcela = total / i64::from(self.parcelas);
        let avista = total - (total * self.desconto_avista_pct) / 100;

        let hoje = chrono::Local::now().date_naive();
        let enviada = hoje + chrono::Duration::days(self.enviada_em_dias);
        let expira = enviada + chrono::Duration::days(self.validade_dias);

        let avista_escolhido = self.forma_pagamento == Some(FormaPagamento::Avista);
        let condicoes = if avista_escolhido {
            format!(
                "Pagamento à vista de {} na assinatura, já aplicado o desconto de {}% sobre o \
                 total de {}.",
                brl(avista),
                self.desconto_avista_pct,
                brl(total)
            )
        } else {
            format!(
                "Pagamento em {} parcelas de {}: a primeira na assinatura e {}",
                self.parcelas,
                brl(parcela),
                if self.parcelas == 2 {
                    "a segunda 30 dias depois."
                } else {
                    "as demais a cada 30 dias."
                }
            )
        };

        PropostaPublica {
            id: self.id.clone(),
            instituicao: self.instituicao.clone(),
            cidade: self.cidade.clone(),
            maps_url: self.maps_url.clone(),
            escopo: self
                .escopo
                .iter()
                .map(|e| ItemEscopoPublico {
                    titulo: e.titulo.clone(),
                    descricao: e.descricao.clone(),
                    valor: brl(e.centavos),
                })
                .collect(),
            premissas: self.premissas.clone(),
            subtotal: brl(bruto),
            desconto_pct: self.desconto_pct,
            desconto: brl(desconto),
            total: brl(total),
            total_centavos: total,
            efetivo: brl(if avista_escolhido { avista } else { total }),
            pagamento: Pagamento {
                parcelas: self.parcelas,
                parcela: brl(parcela),
                parcela_centavos: parcela,
                avista: brl(avista),
                avista_centavos: avista,
                desconto_avista_pct: self.desconto_avista_pct,
            },
            condicoes,
            enviada_em: enviada.format("%d/%m/%Y").to_string(),
            expira_em: expira.format("%d/%m/%Y").to_string(),
            validade_dias: self.validade_dias,
            dias_restantes: (expira - hoje).num_days(),
            aceita_em: self.aceita_em.clone(),
            forma_pagamento: self.forma_pagamento,
            observacoes: self.observacoes.clone(),
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct Aceite {
    #[serde(default)]
    pub observacoes: String,
    /// Sem valor padrão de propósito: o aceite tem de dizer qual das duas
    /// formas foi escolhida, ou o contrato sai ambíguo.
    pub forma: FormaPagamento,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct DadosContrato {
    pub razao: String,
    pub cnpj: String,
    pub endereco: String,
    pub representante: String,
    pub cpf_rep: String,
    pub cargo: String,
    pub email: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Clausula {
    pub titulo: String,
    pub texto: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Contrato {
    pub id: String,
    pub numero: String,
    pub proposta_id: String,
    pub clausulas: Vec<Clausula>,
    pub pdf_url: String,
    pub whatsapp_url: String,
    pub assinado_em: Option<String>,
    pub provedor: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct PedidoAssinatura {
    pub provedor: String,
}

// ---------- auditoria ----------

#[derive(Debug, Clone, Serialize)]
pub struct LogAuditoria {
    pub id: String,
    pub quando: String,
    pub tipo: String,
    pub evento: String,
    pub ip: String,
    pub critico: bool,
}

// ---------- contas e sessão ----------

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Papel {
    Cliente,
    Dono,
}

/// Usuário como fica guardado. Não deriva `Serialize` de propósito: o hash da
/// senha não pode sair por acidente numa resposta.
#[derive(Debug, Clone)]
pub struct Usuario {
    pub id: String,
    pub nome: String,
    pub email: String,
    pub senha_hash: String,
    pub papel: Papel,
}

/// O que o front pode ver de um usuário.
#[derive(Debug, Clone, Serialize)]
pub struct UsuarioPublico {
    pub id: String,
    pub nome: String,
    pub iniciais: String,
    pub email: String,
    pub papel: Papel,
}

impl From<&Usuario> for UsuarioPublico {
    fn from(u: &Usuario) -> Self {
        let iniciais = u
            .nome
            .split_whitespace()
            .filter_map(|parte| parte.chars().next())
            .take(2)
            .collect::<String>()
            .to_uppercase();
        UsuarioPublico {
            id: u.id.clone(),
            nome: u.nome.clone(),
            iniciais,
            email: u.email.clone(),
            papel: u.papel,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct Credenciais {
    pub email: String,
    pub senha: String,
}

#[derive(Debug, Deserialize)]
pub struct NovaConta {
    pub nome: String,
    pub email: String,
    pub senha: String,
}

// ---------- planejamento tributário ----------

/// Um regime possível para a atividade, com o que ele custa neste mês.
///
/// `carga_efetiva` é percentual da receita; os valores são centavos, porque
/// dinheiro em ponto flutuante acumula erro de arredondamento a cada parcela.
#[derive(Debug, Clone, Serialize)]
pub struct Regime {
    pub nome: String,
    pub carga_efetiva: f32,
    pub imposto_mes_centavos: i64,
    pub recomendado: bool,
    pub nota: String,
}

/// A comparação que decide entre continuar MEI ou migrar para ME no Simples.
#[derive(Debug, Clone, Serialize)]
pub struct Impostos {
    pub acumulado_centavos: i64,
    pub limite_mei_centavos: i64,
    pub percentual_do_limite: f32,
    pub alerta: String,
    pub regimes: Vec<Regime>,
    pub fator_r_minimo: f32,
    pub pro_labore_sugerido_centavos: i64,
}

#[derive(Debug, Clone)]
pub struct Sessao {
    pub usuario_id: String,
    pub expira_em: chrono::DateTime<chrono::Local>,
}

#[cfg(test)]
mod testes_proposta {
    use super::*;

    fn proposta() -> Proposta {
        Proposta {
            id: "PRJ-2026-0091".into(),
            instituicao: "Instituição".into(),
            cidade: "Cidade · ES".into(),
            maps_url: String::new(),
            escopo: vec![
                ItemEscopo { titulo: "a".into(), descricao: String::new(), centavos: 600_000 },
                ItemEscopo { titulo: "b".into(), descricao: String::new(), centavos: 300_000 },
                ItemEscopo { titulo: "c".into(), descricao: String::new(), centavos: 250_000 },
            ],
            premissas: vec![],
            desconto_pct: 10,
            parcelas: 2,
            desconto_avista_pct: 5,
            enviada_em_dias: -1,
            validade_dias: 15,
            aceita_em: None,
            forma_pagamento: None,
            observacoes: None,
        }
    }

    #[test]
    fn real_formatado_agrupa_e_leva_centavos() {
        assert_eq!(brl(0), "R$ 0,00");
        assert_eq!(brl(5), "R$ 0,05");
        assert_eq!(brl(600_000), "R$ 6.000,00");
        assert_eq!(brl(1_035_000), "R$ 10.350,00");
        assert_eq!(brl(983_250), "R$ 9.832,50");
        assert_eq!(brl(100_000_000), "R$ 1.000.000,00");
        assert_eq!(brl(-115_000), "-R$ 1.150,00");
    }

    /// O ponto do exercício: as três linhas do escopo, o subtotal, o desconto e
    /// o total têm de ser a mesma conta vista de ângulos diferentes.
    #[test]
    fn o_total_e_a_soma_do_escopo_menos_o_desconto() {
        let p = proposta().publica();
        assert_eq!(p.subtotal, "R$ 11.500,00");
        assert_eq!(p.desconto, "R$ 1.150,00");
        assert_eq!(p.total, "R$ 10.350,00");
        assert_eq!(p.total_centavos, 1_035_000);
    }

    #[test]
    fn as_parcelas_somam_o_total() {
        let p = proposta().publica();
        assert_eq!(p.pagamento.parcela, "R$ 5.175,00");
        assert_eq!(
            p.pagamento.parcela_centavos * i64::from(p.pagamento.parcelas),
            p.total_centavos
        );
    }

    #[test]
    fn o_a_vista_desconta_sobre_o_total_ja_descontado() {
        let p = proposta().publica();
        assert_eq!(p.pagamento.avista, "R$ 9.832,50");
        assert_eq!(p.pagamento.avista_centavos, 1_035_000 - 51_750);
    }

    /// Antes da escolha o valor efetivo é o parcelado; depois, o escolhido. É
    /// este número que entra na cláusula 4ª.
    #[test]
    fn a_forma_escolhida_decide_o_valor_do_contrato() {
        let mut p = proposta();
        assert_eq!(p.publica().efetivo, "R$ 10.350,00");

        p.forma_pagamento = Some(FormaPagamento::Parcelado);
        let parcelado = p.publica();
        assert_eq!(parcelado.efetivo, "R$ 10.350,00");
        assert!(parcelado.condicoes.contains("2 parcelas de R$ 5.175,00"));
        assert!(parcelado.condicoes.contains("a segunda 30 dias depois"));

        p.forma_pagamento = Some(FormaPagamento::Avista);
        let avista = p.publica();
        assert_eq!(avista.efetivo, "R$ 9.832,50");
        assert!(avista.condicoes.contains("à vista de R$ 9.832,50"));
    }

    #[test]
    fn tres_parcelas_mudam_o_texto_e_a_conta() {
        let mut p = proposta();
        p.parcelas = 3;
        p.forma_pagamento = Some(FormaPagamento::Parcelado);
        let pb = p.publica();
        assert_eq!(pb.pagamento.parcela, "R$ 3.450,00");
        assert!(pb.condicoes.contains("as demais a cada 30 dias"));
    }

    /// As datas são deslocamento, não texto: uma proposta enviada ontem com 15
    /// dias de validade sempre tem 14 pela frente, seja qual for o dia de hoje.
    #[test]
    fn as_datas_acompanham_o_calendario() {
        let pb = proposta().publica();
        assert_eq!(pb.dias_restantes, 14);

        let hoje = chrono::Local::now().date_naive();
        assert_eq!(pb.enviada_em, (hoje - chrono::Duration::days(1)).format("%d/%m/%Y").to_string());
        assert_eq!(pb.expira_em, (hoje + chrono::Duration::days(14)).format("%d/%m/%Y").to_string());
    }

    /// Um item a mais no escopo aparece no subtotal, no desconto, no total, na
    /// parcela e no à vista — sem ninguém precisar reescrever cinco frases.
    #[test]
    fn mexer_no_escopo_move_tudo_o_mais() {
        let mut p = proposta();
        p.escopo.push(ItemEscopo {
            titulo: "d".into(),
            descricao: String::new(),
            centavos: 150_000,
        });
        let pb = p.publica();
        assert_eq!(pb.subtotal, "R$ 13.000,00");
        assert_eq!(pb.desconto, "R$ 1.300,00");
        assert_eq!(pb.total, "R$ 11.700,00");
        assert_eq!(pb.pagamento.parcela, "R$ 5.850,00");
        assert_eq!(pb.pagamento.avista, "R$ 11.115,00");
    }
}
