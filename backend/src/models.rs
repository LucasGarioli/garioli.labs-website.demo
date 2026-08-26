use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ---------- triagem ----------

#[derive(Debug, Clone, Serialize)]
pub struct Opcao {
    pub val: &'static str,
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

#[derive(Debug, Clone, Serialize)]
pub struct ItemEscopo {
    pub titulo: String,
    pub descricao: String,
    pub valor: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct Proposta {
    pub id: String,
    pub instituicao: String,
    pub cidade: String,
    pub maps_url: String,
    pub escopo: Vec<ItemEscopo>,
    pub premissas: Vec<Premissa>,
    pub total: String,
    pub condicoes: String,
    pub validade: String,
    pub aceita_em: Option<String>,
    pub observacoes: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct Aceite {
    #[serde(default)]
    pub observacoes: String,
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
