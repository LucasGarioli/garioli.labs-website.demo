//! Sessão, senha e separação cliente / dono.
//!
//! As sessões vivem no mesmo `Store` em memória do resto do estado: trocar por
//! Postgres depois não muda a assinatura de nada aqui nem das rotas.

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use axum::{
    async_trait,
    extract::FromRequestParts,
    http::{header, request::Parts, StatusCode},
};

use crate::{models::*, store::Store};

/// Nome do cookie de sessão. `HttpOnly`, então o JavaScript da página nunca o lê.
pub const COOKIE: &str = "gl_sessao";

/// Duração da sessão. Curta o bastante para limitar um token vazado, longa o
/// bastante para o dono não reautenticar a cada visita ao painel.
const HORAS: i64 = 12;

// ---------- senha ----------

/// Gera o hash Argon2id da senha. O texto puro nunca é guardado nem registrado.
pub fn hash_senha(senha: &str) -> Result<String, (StatusCode, String)> {
    let sal = SaltString::generate(&mut OsRng);
    Argon2::default()
        .hash_password(senha.as_bytes(), &sal)
        .map(|h| h.to_string())
        .map_err(|_| erro_interno("não foi possível registrar a senha"))
}

/// Confere a senha contra o hash guardado.
///
/// Qualquer falha — hash corrompido inclusive — é `false`, nunca um erro
/// distinto: a resposta ao cliente precisa ser a mesma para senha errada e para
/// e-mail inexistente, senão vira um oráculo de quais contas existem.
pub fn senha_confere(senha: &str, hash: &str) -> bool {
    PasswordHash::new(hash)
        .map(|h| Argon2::default().verify_password(senha.as_bytes(), &h).is_ok())
        .unwrap_or(false)
}

// ---------- cookie ----------

/// `Set-Cookie` de entrada. `Secure` sai apenas quando `GARIOLI_COOKIE_SECURE`
/// está definido — em desenvolvimento o site é http e o navegador descartaria
/// o cookie silenciosamente.
pub fn cookie_de_sessao(token: &str) -> String {
    let seguro = if std::env::var("GARIOLI_COOKIE_SECURE").is_ok() { "; Secure" } else { "" };
    format!(
        "{COOKIE}={token}; HttpOnly; SameSite=Lax; Path=/; Max-Age={}{seguro}",
        HORAS * 3600
    )
}

/// `Set-Cookie` de saída: mesmo nome, validade zerada.
pub fn cookie_de_saida() -> String {
    let seguro = if std::env::var("GARIOLI_COOKIE_SECURE").is_ok() { "; Secure" } else { "" };
    format!("{COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0{seguro}")
}

/// Lê o token do cabeçalho `Cookie`, que pode trazer vários pares.
fn token_do_cabecalho(parts: &Parts) -> Option<String> {
    parts
        .headers
        .get_all(header::COOKIE)
        .iter()
        .filter_map(|v| v.to_str().ok())
        .flat_map(|linha| linha.split(';'))
        .filter_map(|par| par.split_once('='))
        .find(|(nome, _)| nome.trim() == COOKIE)
        .map(|(_, valor)| valor.trim().to_string())
}

// ---------- extratores ----------

fn erro_interno(que: &str) -> (StatusCode, String) {
    (StatusCode::INTERNAL_SERVER_ERROR, que.to_string())
}

fn nao_autenticado() -> (StatusCode, String) {
    (StatusCode::UNAUTHORIZED, "Faça login para continuar".into())
}

/// Qualquer usuário com sessão válida.
pub struct Autenticado(pub Usuario);

#[async_trait]
impl FromRequestParts<Store> for Autenticado {
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, store: &Store) -> Result<Self, Self::Rejection> {
        let token = token_do_cabecalho(parts).ok_or_else(nao_autenticado)?;
        store.usuario_da_sessao(&token).map(Autenticado).ok_or_else(nao_autenticado)
    }
}

/// Só o dono. É o que separa `/api/admin/*` do resto.
pub struct Dono(pub Usuario);

#[async_trait]
impl FromRequestParts<Store> for Dono {
    type Rejection = (StatusCode, String);

    async fn from_request_parts(parts: &mut Parts, store: &Store) -> Result<Self, Self::Rejection> {
        let Autenticado(usuario) = Autenticado::from_request_parts(parts, store).await?;
        if usuario.papel == Papel::Dono {
            Ok(Dono(usuario))
        } else {
            // 404, não 403: quem não é dono não precisa sequer saber que a rota existe.
            Err((StatusCode::NOT_FOUND, "não encontrado".into()))
        }
    }
}
