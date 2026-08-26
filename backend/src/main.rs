mod auth;
mod documento;
mod models;
mod store;
mod triagem;

use auth::{Autenticado, Dono};
use documento::{cpf_ou_cnpj_valido, cpf_valido, email_valido};
use axum::{
    extract::{ConnectInfo, Path, Query, State},
    http::{header, HeaderMap, Method, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use models::*;
use std::net::SocketAddr;
use store::{agora, clausulas, Store};
use tower_http::cors::CorsLayer;

type Resultado<T> = Result<Json<T>, (StatusCode, String)>;

fn nao_encontrado(que: &str) -> (StatusCode, String) {
    (StatusCode::NOT_FOUND, format!("{} não encontrado", que))
}

// ---------- autenticação ----------

/// Mesma resposta para e-mail inexistente e senha errada: qualquer diferença
/// transformaria esta rota num verificador de quais e-mails têm conta.
const CREDENCIAL_INVALIDA: &str = "E-mail ou senha incorretos";

async fn entrar(
    State(store): State<Store>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(cred): Json<Credenciais>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    let usuario = store
        .achar_por_email(&cred.email)
        .filter(|u| auth::senha_confere(&cred.senha, &u.senha_hash))
        .ok_or((StatusCode::UNAUTHORIZED, CREDENCIAL_INVALIDA.to_string()))?;

    let token = store.abrir_sessao(&usuario.id, 12);
    store.registrar("Acesso", &format!("Entrada de {}", usuario.email), &addr.ip().to_string(), false);

    let mut headers = HeaderMap::new();
    headers.insert(
        header::SET_COOKIE,
        auth::cookie_de_sessao(&token)
            .parse()
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "cookie inválido".to_string()))?,
    );
    Ok((headers, Json(UsuarioPublico::from(&usuario))))
}

async fn criar_conta(
    State(store): State<Store>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(nova): Json<NovaConta>,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    if nova.nome.trim().len() < 3 {
        return Err((StatusCode::BAD_REQUEST, "Informe seu nome completo".into()));
    }
    if !nova.email.contains('@') {
        return Err((StatusCode::BAD_REQUEST, "E-mail inválido".into()));
    }
    if nova.senha.chars().count() < 8 {
        return Err((StatusCode::BAD_REQUEST, "A senha precisa de ao menos 8 caracteres".into()));
    }
    if store.achar_por_email(&nova.email).is_some() {
        return Err((StatusCode::CONFLICT, "Já existe uma conta com este e-mail".into()));
    }

    let hash = auth::hash_senha(&nova.senha)?;
    let usuario = store.criar_cliente(&nova.nome, &nova.email, &hash);
    let token = store.abrir_sessao(&usuario.id, 12);
    store.registrar("Acesso", &format!("Conta criada — {}", usuario.email), &addr.ip().to_string(), false);

    let mut headers = HeaderMap::new();
    headers.insert(
        header::SET_COOKIE,
        auth::cookie_de_sessao(&token)
            .parse()
            .map_err(|_| (StatusCode::INTERNAL_SERVER_ERROR, "cookie inválido".to_string()))?,
    );
    Ok((headers, Json(UsuarioPublico::from(&usuario))))
}

async fn sair(State(store): State<Store>, headers: HeaderMap) -> impl IntoResponse {
    // Derruba a sessão no servidor, não só no navegador.
    if let Some(token) = headers
        .get_all(header::COOKIE)
        .iter()
        .filter_map(|v| v.to_str().ok())
        .flat_map(|l| l.split(';'))
        .filter_map(|p| p.split_once('='))
        .find(|(n, _)| n.trim() == auth::COOKIE)
        .map(|(_, v)| v.trim().to_string())
    {
        store.fechar_sessao(&token);
    }

    let mut saida = HeaderMap::new();
    if let Ok(c) = auth::cookie_de_saida().parse() {
        saida.insert(header::SET_COOKIE, c);
    }
    (saida, StatusCode::NO_CONTENT)
}

async fn eu(Autenticado(usuario): Autenticado) -> Json<UsuarioPublico> {
    Json(UsuarioPublico::from(&usuario))
}

// ---------- triagem pública ----------

#[derive(serde::Deserialize)]
struct IdiomaQuery {
    lang: Option<String>,
}

async fn get_schema(Query(q): Query<IdiomaQuery>) -> Json<Vec<Pergunta>> {
    Json(triagem::schema_em(triagem::Idioma::de(q.lang.as_deref())))
}

async fn post_solicitacao(
    State(store): State<Store>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(nova): Json<NovaSolicitacao>,
) -> Resultado<SolicitacaoCriada> {
    if nova.contato.nome.trim().is_empty() || nova.contato.email.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "Nome e e-mail são obrigatórios".into()));
    }

    let frentes = triagem::frentes(&nova);
    let premissas = triagem::premissas(&nova);
    let alertas = triagem::alertas(&nova);
    let protocolo = store.proximo_protocolo();
    let id = uuid::Uuid::new_v4().to_string();

    let solicitacao = Solicitacao {
        id: id.clone(),
        protocolo: protocolo.clone(),
        criada_em: agora(),
        situacao: "Aguardando análise".into(),
        solicitante: nova.contato.nome.clone(),
        instituicao: nova.contato.org.clone(),
        cidade: nova.contato.cidade.clone(),
        email: nova.contato.email.clone(),
        fone: nova.contato.fone.clone(),
        premissas,
        frentes: frentes.clone(),
        faixa_minima_centavos: frentes.iter().map(|f| f.minimo_centavos).sum(),
        faixa_maxima_centavos: frentes.iter().map(|f| f.maximo_centavos).sum(),
        alertas,
    };

    store.escrever().solicitacoes.insert(0, solicitacao);
    store.registrar(
        "Triagem",
        &format!("Solicitação {} recebida — {}", protocolo, nova.contato.nome),
        &addr.ip().to_string(),
        false,
    );

    Ok(Json(SolicitacaoCriada {
        id,
        protocolo,
        conta_criada: nova.criar_conta,
    }))
}

async fn listar_solicitacoes(_dono: Dono, State(store): State<Store>) -> Json<Vec<Solicitacao>> {
    Json(store.ler().solicitacoes.clone())
}

async fn aprovar_solicitacao(
    Dono(dono): Dono,
    State(store): State<Store>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Path(id): Path<String>,
) -> Resultado<Solicitacao> {
    let mut d = store.escrever();
    let s = d
        .solicitacoes
        .iter_mut()
        .find(|s| s.id == id || s.protocolo == id)
        .ok_or_else(|| nao_encontrado("Solicitação"))?;
    s.situacao = "Proposta gerada".into();
    let protocolo = s.protocolo.clone();
    let copia = s.clone();
    drop(d);

    store.registrar(
        "Aprovação",
        &format!("Rascunho de {} aprovado por {} — proposta gerada", protocolo, dono.email),
        &addr.ip().to_string(),
        false,
    );
    Ok(Json(copia))
}

async fn recusar_solicitacao(
    Dono(dono): Dono,
    State(store): State<Store>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Path(id): Path<String>,
) -> StatusCode {
    let mut d = store.escrever();
    if let Some(s) = d.solicitacoes.iter_mut().find(|s| s.id == id) {
        s.situacao = "Recusada".into();
        let protocolo = s.protocolo.clone();
        drop(d);
        store.registrar(
            "Recusa",
            &format!("Solicitação {} recusada por {}", protocolo, dono.email),
            &addr.ip().to_string(),
            false,
        );
        return StatusCode::NO_CONTENT;
    }
    StatusCode::NOT_FOUND
}

// ---------- proposta ----------

async fn get_proposta(
    State(store): State<Store>,
    Path(id): Path<String>,
) -> Resultado<PropostaPublica> {
    let d = store.ler();
    d.propostas
        .iter()
        .find(|p| p.id == id)
        .map(|p| Json(p.publica()))
        .ok_or_else(|| nao_encontrado("Proposta"))
}

async fn aceitar_proposta(
    State(store): State<Store>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Path(id): Path<String>,
    Json(aceite): Json<Aceite>,
) -> Resultado<PropostaPublica> {
    let mut d = store.escrever();
    let p = d
        .propostas
        .iter_mut()
        .find(|p| p.id == id)
        .ok_or_else(|| nao_encontrado("Proposta"))?;
    p.aceita_em = Some(agora());
    // A forma de pagamento é parte do aceite: é ela que fixa o valor da
    // cláusula 4ª. Sem ela o contrato sairia oferecendo dois números.
    p.forma_pagamento = Some(aceite.forma);
    p.observacoes = Some(aceite.observacoes.clone()).filter(|o| !o.trim().is_empty());
    let publica = p.publica();
    drop(d);

    let forma = match aceite.forma {
        FormaPagamento::Avista => format!("pagamento à vista de {}", publica.pagamento.avista),
        FormaPagamento::Parcelado => {
            format!("{} parcelas de {}", publica.pagamento.parcelas, publica.pagamento.parcela)
        }
    };
    store.registrar(
        "Aceite",
        &format!(
            "Proposta {} aceita {} — {}",
            id,
            if aceite.observacoes.trim().is_empty() { "sem ressalvas" } else { "com observações" },
            forma
        ),
        &addr.ip().to_string(),
        true,
    );
    Ok(Json(publica))
}

async fn gerar_contrato(
    State(store): State<Store>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Path(id): Path<String>,
    Json(dados): Json<DadosContrato>,
) -> Resultado<Contrato> {
    let proposta = {
        let d = store.ler();
        d.propostas.iter().find(|p| p.id == id).cloned().ok_or_else(|| nao_encontrado("Proposta"))?
    };
    if proposta.aceita_em.is_none() {
        return Err((StatusCode::CONFLICT, "A proposta precisa ser aceita antes do contrato".into()));
    }
    // A validação do formulário no navegador é conveniência; a barreira é esta.
    // O contrato identifica a parte pelo que for gravado aqui, e um CNPJ
    // inválido só aparece quando for preciso cobrar.
    for (ok, erro) in [
        (cpf_ou_cnpj_valido(&dados.cnpj), "CNPJ ou CPF inválido"),
        (cpf_valido(&dados.cpf_rep), "CPF do representante inválido"),
        (email_valido(&dados.email), "E-mail inválido"),
    ] {
        if !ok {
            return Err((StatusCode::UNPROCESSABLE_ENTITY, erro.into()));
        }
    }

    let contrato = Contrato {
        id: uuid::Uuid::new_v4().to_string(),
        numero: format!("CT-{}", id.trim_start_matches("PRJ-")),
        proposta_id: id.clone(),
        clausulas: clausulas(&dados, &proposta.publica()),
        pdf_url: format!("/api/contratos/{}/pdf", id),
        whatsapp_url: "https://wa.me/5500000000000".into(),
        assinado_em: None,
        provedor: None,
    };

    store.escrever().contratos.insert(0, contrato.clone());
    store.registrar(
        "Contrato",
        &format!("Contrato {} gerado para {}", contrato.numero, dados.razao),
        &addr.ip().to_string(),
        false,
    );
    Ok(Json(contrato))
}

async fn get_contrato(State(store): State<Store>, Path(id): Path<String>) -> Resultado<Contrato> {
    let d = store.ler();
    d.contratos
        .iter()
        .find(|c| c.id == id || c.numero == id)
        .cloned()
        .map(Json)
        .ok_or_else(|| nao_encontrado("Contrato"))
}

async fn assinar_contrato(
    State(store): State<Store>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Path(id): Path<String>,
    Json(pedido): Json<PedidoAssinatura>,
) -> Resultado<Contrato> {
    // Integração real: trocar por chamada ao provedor (Gov.br / Autentique)
    // e persistir o hash do documento assinado devolvido por ele.
    let mut d = store.escrever();
    let c = d
        .contratos
        .iter_mut()
        .find(|c| c.id == id || c.numero == id)
        .ok_or_else(|| nao_encontrado("Contrato"))?;
    c.assinado_em = Some(agora());
    c.provedor = Some(pedido.provedor.clone());
    let copia = c.clone();
    drop(d);

    store.registrar(
        "Assinatura",
        &format!("Contrato {} assinado via {}", copia.numero, pedido.provedor),
        &addr.ip().to_string(),
        true,
    );
    Ok(Json(copia))
}

// ---------- conta e admin ----------

async fn minha_conta(Autenticado(usuario): Autenticado) -> Json<serde_json::Value> {
    // Projetos, cursos e documentos ainda são o conjunto semeado; o que já é
    // real é quem está pedindo — sem sessão válida esta rota nem chega aqui.
    Json(serde_json::json!({
        "nome": usuario.nome,
        "iniciais": UsuarioPublico::from(&usuario).iniciais,
        "projetos": [
            { "id": "PRJ-2026-0091", "titulo": "Projeto acústico, sonorização e iluminação cênica",
              "meta": "Comunidade Vale Verde · entrega prevista 14/10/2026",
              "status": "Aguardando seu aceite", "destaque": true, "fase": 1,
              "cta": "Ver proposta e aceitar", "pendencia": "Proposta válida até 09/09/2026." },
            { "id": "PRJ-2026-0074", "titulo": "Projeto acústico do salão paroquial",
              "meta": "Igreja Monte Alto · contrato assinado em 12/08/2026",
              "status": "Em execução", "destaque": false, "fase": 4,
              "cta": "Ver status do projeto",
              "pendencia": "Pendente com você: fotos do forro após a remoção do PVC." }
        ],
        "cursos": [
            { "tag": "Curso · 6 h", "titulo": "Acústica prática para igrejas",
              "descricao": "Diagnóstico de reverberação, escolha de materiais e erros comuns.",
              "progresso": 100, "situacao": "Concluído · certificado emitido", "cta": "Rever" },
            { "tag": "Curso · 8 h", "titulo": "Operação de mesa digital ao vivo",
              "descricao": "Ganho, EQ, dinâmica e gestão de realimentação no culto.",
              "progresso": 42, "situacao": "Módulo 4 de 9", "cta": "Continuar" }
        ],
        "licencas": [
            { "titulo": "Calculadora de reverberação", "descricao": "RT60 por Sabine e Eyring",
              "chave": "GLB-RT60-8842-XK", "vencimento": "Renova 12/10/2026", "situacao": "Ativa", "ativa": true },
            { "titulo": "Gerador de mapa DMX", "descricao": "Endereçamento e cenas",
              "chave": "GLB-DMX-0417-BR", "vencimento": "Expirou 02/06/2026", "situacao": "Expirada", "ativa": false }
        ],
        "documentos": [
            { "tipo": "Proposta", "titulo": "Proposta técnica e comercial · PRJ-2026-0091", "data": "25/08/2026", "url": "#" },
            { "tipo": "Contrato", "titulo": "Contrato de prestação de serviços · Monte Alto", "data": "12/08/2026", "url": "#" }
        ]
    }))
}

/// E-mail e WhatsApp em uma linha só, pulando o que veio vazio — é o que o
/// dono precisa ler para responder a solicitação.
fn contato_de(s: &Solicitacao) -> String {
    [s.email.as_str(), s.fone.as_str()]
        .iter()
        .filter(|c| !c.trim().is_empty())
        .copied()
        .collect::<Vec<_>>()
        .join(" · ")
}

async fn admin_resumo(_dono: Dono, State(store): State<Store>) -> Json<serde_json::Value> {
    let pendentes = store
        .ler()
        .solicitacoes
        .iter()
        .filter(|s| s.situacao == "Aguardando análise")
        .cloned()
        .collect::<Vec<_>>();

    let mut acoes = pendentes
        .iter()
        .map(|s| {
            serde_json::json!({
                "tipo": "Triagem",
                "texto": format!("Nova solicitação — {}", if s.instituicao.is_empty() { s.solicitante.clone() } else { s.instituicao.clone() }),
                "prazo": "hoje", "urgente": true, "cta": "Aprovar",
                "solicitacao_id": s.id,
                "contato": contato_de(s)
            })
        })
        .collect::<Vec<_>>();

    acoes.extend(vec![
        serde_json::json!({ "tipo": "Financeiro", "texto": "Parcela 2 vencida — Igreja Monte Alto",
                            "prazo": "9 dias", "urgente": true, "cta": "Cobrar", "solicitacao_id": null }),
        serde_json::json!({ "tipo": "Proposta", "texto": "Proposta PRJ-2026-0091 expira em 3 dias",
                            "prazo": "09/09", "urgente": false, "cta": "Prorrogar", "solicitacao_id": null }),
    ]);

    Json(serde_json::json!({
        "kpis": [
            { "label": "Em negociação", "valor": "R$ 40.000", "sub": "5 propostas abertas", "alerta": false },
            { "label": "A receber em 30 dias", "valor": "R$ 12.000", "sub": "4 parcelas", "alerta": false },
            { "label": "Vencido", "valor": "R$ 2.500", "sub": "1 parcela, 9 dias", "alerta": true },
            { "label": "Solicitações na fila", "valor": pendentes.len().to_string(), "sub": "aguardando sua análise", "alerta": !pendentes.is_empty() }
        ],
        "acoes": acoes,
        "pipeline": [
            { "titulo": "Triagem", "cards": pendentes.iter().map(|s| serde_json::json!({
                "cliente": if s.instituicao.is_empty() { s.solicitante.clone() } else { s.instituicao.clone() },
                "valor": format!("R$ {:.0}–{:.0}k", s.faixa_minima_centavos as f64 / 100_000.0, s.faixa_maxima_centavos as f64 / 100_000.0),
                "idade": "hoje", "parado": false,
                "contato": contato_de(s) })).collect::<Vec<_>>() },
            { "titulo": "Rascunho", "cards": [] },
            { "titulo": "Enviada", "cards": [
                { "cliente": "Comunidade Vale Verde", "valor": "R$ 10.000", "idade": "expira em 3 dias", "parado": true } ] },
            { "titulo": "Aceita", "cards": [
                { "cliente": "Auditório Ipê Amarelo", "valor": "R$ 24.000", "idade": "contrato pendente", "parado": false } ] },
            { "titulo": "Em execução", "cards": [
                { "cliente": "Igreja Monte Alto", "valor": "R$ 4.500", "idade": "dia 18 de 30", "parado": false } ] },
            { "titulo": "Entregue", "cards": [
                { "cliente": "Teatro Aurora", "valor": "R$ 9.800", "idade": "entregue 02/08", "parado": false } ] }
        ],
        "financeiro": {
            "ano": 2026,
            "mei_faturado": 4_800_000_i64,
            "mei_limite": 8_100_000_i64,
            "kpis": [
                { "label": "Recebido em 2026", "valor": "R$ 48.000", "sub": "59% do limite MEI", "alerta": false },
                { "label": "A receber", "valor": "R$ 20.000", "sub": "contratos assinados", "alerta": false },
                { "label": "Vencido", "valor": "R$ 2.500", "sub": "sujeito a multa e juros", "alerta": true }
            ],
            "parcelas": [
                { "cliente": "Igreja Monte Alto", "parcela": "2 de 2", "valor_centavos": 250_000, "vencimento": "16/08/2026", "situacao": "Vencida" },
                { "cliente": "Auditório Ipê Amarelo", "parcela": "1 de 3", "valor_centavos": 800_000, "vencimento": "05/09/2026", "situacao": "A vencer" },
                { "cliente": "Teatro Aurora", "parcela": "2 de 2", "valor_centavos": 500_000, "vencimento": "02/08/2026", "situacao": "Recebida" },
                { "cliente": "Aditivo técnico — Auditório Ipê Amarelo", "parcela": "cortesia", "valor_centavos": 0, "vencimento": "—", "situacao": "Isento" }
            ]
        },
        "execucao": [
            { "titulo": "Igreja Monte Alto · projeto acústico",
              "prazo": "dia 18 de 30 úteis · entrega 11/09/2026",
              "frentes": [
                { "titulo": "Levantamento", "progresso": 100, "situacao": "Concluído" },
                { "titulo": "Cálculo RT60", "progresso": 100, "situacao": "Concluído" },
                { "titulo": "Detalhamento", "progresso": 55, "situacao": "Em andamento" },
                { "titulo": "Memorial", "progresso": 0, "situacao": "Não iniciado" } ],
              "bloqueio": "aguardando fotos do forro após remoção do PVC — prazo suspenso desde 21/08." }
        ],
        "produtos": [
            { "tipo": "Curso", "titulo": "Acústica prática para igrejas", "descricao": "6 h · diagnóstico, materiais e erros comuns", "preco": "R$ 297", "volume": "84 alunos" },
            { "tipo": "Curso", "titulo": "Operação de mesa digital ao vivo", "descricao": "8 h · ganho, EQ, dinâmica", "preco": "R$ 397", "volume": "51 alunos" },
            { "tipo": "Licença", "titulo": "Calculadora de reverberação", "descricao": "RT60 Sabine e Eyring · anual", "preco": "R$ 180/ano", "volume": "37 ativas" }
        ],
        "modelos": [
            { "titulo": "Proposta técnica e comercial", "descricao": "Premissas, cronograma e onboarding", "versao": "v4", "data": "25/08/2026", "uso": "5 propostas ativas", "congelado": false },
            { "titulo": "Contrato de prestação de serviços", "descricao": "Projeto acústico e audiovisual · MEI", "versao": "v3", "data": "25/08/2026", "uso": "3 contratos vigentes", "congelado": false },
            { "titulo": "Contrato de prestação de serviços", "descricao": "Versão anterior, sem suspensão por inadimplência", "versao": "v2", "data": "12/08/2026", "uso": "1 contrato congelado nesta versão", "congelado": true }
        ]
    }))
}

async fn get_auditoria(_dono: Dono, State(store): State<Store>) -> Json<Vec<LogAuditoria>> {
    Json(store.ler().auditoria.clone())
}

/// Comparação de regimes tributários para o mês corrente.
///
/// As alíquotas e o teto do MEI são de tabela; a receita ainda vem de números
/// de demonstração, como o resto do painel — quando a escrituração real entrar,
/// só a origem de `acumulado` e `receita_mes` muda, e as contas seguem iguais.
async fn get_impostos(_dono: Dono) -> Json<Impostos> {
    const LIMITE_MEI: i64 = 8_100_000;
    const ACUMULADO: i64 = 9_600_000;
    const RECEITA_MES: i64 = 1_800_000;
    const FATOR_R: f32 = 28.0;

    let parcela = |aliquota: f32| (RECEITA_MES as f32 * aliquota / 100.0) as i64;

    Json(Impostos {
        acumulado_centavos: ACUMULADO,
        limite_mei_centavos: LIMITE_MEI,
        percentual_do_limite: (ACUMULADO as f32 / LIMITE_MEI as f32) * 100.0,
        alerta: concat!(
            "Acumulado acima do teto do MEI. Migrar para ME no Simples e manter o Fator R ",
            "garante Anexo III (6%) em vez de Anexo V (15,5%)."
        )
        .into(),
        regimes: vec![
            Regime {
                nome: "MEI · DAS fixo".into(),
                carga_efetiva: 0.4,
                imposto_mes_centavos: 7_600,
                recomendado: false,
                nota: concat!(
                    "Teto anual de R$ 81 mil já ultrapassado — excedente acima de 20% ",
                    "obriga desenquadramento retroativo."
                )
                .into(),
            },
            Regime {
                nome: "ME · Simples, Anexo III".into(),
                carga_efetiva: 6.0,
                imposto_mes_centavos: parcela(6.0),
                recomendado: true,
                nota: "Exige Fator R ≥ 28% da receita em folha/pró-labore.".into(),
            },
            Regime {
                nome: "ME · Simples, Anexo V".into(),
                carga_efetiva: 15.5,
                imposto_mes_centavos: parcela(15.5),
                recomendado: false,
                nota: "É onde a atividade cai se o pró-labore ficar abaixo de 28% da receita.".into(),
            },
        ],
        fator_r_minimo: FATOR_R,
        pro_labore_sugerido_centavos: (RECEITA_MES as f32 * FATOR_R / 100.0) as i64,
    })
}

async fn health() -> &'static str {
    "ok"
}

/// Origens que podem falar com a API com cookie.
///
/// `CorsLayer::permissive()` combinava com uma API aberta; agora que existe
/// sessão, origem coringa mais credenciais é rejeitado pelo próprio navegador —
/// e seria um convite a CSRF onde não fosse.
fn cors() -> CorsLayer {
    let origens = std::env::var("GARIOLI_ORIGENS")
        .unwrap_or_else(|_| "http://localhost:5173,http://127.0.0.1:5173".to_string());

    let lista: Vec<_> = origens
        .split(',')
        .filter_map(|o| o.trim().parse::<axum::http::HeaderValue>().ok())
        .collect();

    CorsLayer::new()
        .allow_origin(lista)
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([header::CONTENT_TYPE])
        .allow_credentials(true)
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt::init();
    let store = Store::nova();

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/auth/entrar", post(entrar))
        .route("/api/auth/criar-conta", post(criar_conta))
        .route("/api/auth/sair", post(sair))
        .route("/api/auth/eu", get(eu))
        .route("/api/triagem/schema", get(get_schema))
        .route("/api/solicitacoes", get(listar_solicitacoes).post(post_solicitacao))
        .route("/api/solicitacoes/:id/aprovar", post(aprovar_solicitacao))
        .route("/api/solicitacoes/:id/recusar", post(recusar_solicitacao))
        .route("/api/propostas/:id", get(get_proposta))
        .route("/api/propostas/:id/aceite", post(aceitar_proposta))
        .route("/api/propostas/:id/dados-contrato", post(gerar_contrato))
        .route("/api/contratos/:id", get(get_contrato))
        .route("/api/contratos/:id/assinatura", post(assinar_contrato))
        .route("/api/conta/me", get(minha_conta))
        .route("/api/admin/resumo", get(admin_resumo))
        .route("/api/admin/auditoria", get(get_auditoria))
        .route("/api/admin/impostos", get(get_impostos))
        .layer(cors())
        .with_state(store);

    let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
    tracing::info!("Garioli Labs API em http://{addr}");
    // Falhar aqui é falhar ao subir: a porta ocupada precisa aparecer como
    // erro de inicialização, não como pânico com stack trace.
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await?;
    Ok(())
}
