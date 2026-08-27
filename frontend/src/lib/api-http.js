//! Cliente HTTP da API real (backend Axum em `backend/`).
//!
//! É este o cliente usado em produção. A build de portfólio não define
//! `VITE_API_BASE` e cai no cliente de demonstração — ver `api.js`.

import { ErroApi } from './api-erros.js';

const BASE = import.meta.env.VITE_API_BASE ?? '';

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    // O cookie de sessão é HttpOnly: sem isto ele não acompanha a requisição
    // e toda rota autenticada responde 401.
    credentials: 'include',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new ErroApi(res.status, (await res.text()) || res.statusText);
  return res.status === 204 ? null : res.json();
}

/** Provedores de identidade que a API real oferece.
 *
 *  Vazio até o fluxo OIDC entrar no Axum. A tela de acesso lê esta lista para
 *  decidir se desenha os botões — botão que não autentica ninguém é pior do
 *  que botão nenhum. */
export const PROVEDORES = [];

/** As rotas abaixo ainda não existem no Axum. Enquanto não existirem, a
 *  página da conta não desenha a seção — melhor não ter a aba do que ter uma
 *  aba que responde 404. */
export const SEGUNDO_FATOR = false;

export const api = {
  entrar: (email, senha) => req('POST', '/api/auth/entrar', { email, senha }),
  entrarCom: (provedor) => req('POST', `/api/auth/oauth/${provedor}`),
  concluirSegundoFator: (desafio, codigo) =>
    req('POST', '/api/auth/segundo-fator', { desafio, codigo }),
  segundoFator: () => req('GET', '/api/conta/segundo-fator'),
  iniciarSegundoFator: () => req('POST', '/api/conta/segundo-fator/iniciar'),
  confirmarSegundoFator: (codigo) => req('POST', '/api/conta/segundo-fator/confirmar', { codigo }),
  desativarSegundoFator: (codigo) => req('POST', '/api/conta/segundo-fator/desativar', { codigo }),
  criarConta: (nome, email, senha) => req('POST', '/api/auth/criar-conta', { nome, email, senha }),
  sair: () => req('POST', '/api/auth/sair'),
  eu: () => req('GET', '/api/auth/eu'),

  // O questionário vem traduzido do servidor; as chaves de resposta (`val`)
  // são as mesmas nos dois idiomas, então a classificação não muda.
  triagemSchema: (lang = 'pt') => req('GET', `/api/triagem/schema?lang=${lang}`),
  criarSolicitacao: (payload) => req('POST', '/api/solicitacoes', payload),
  listarSolicitacoes: () => req('GET', '/api/solicitacoes'),
  aprovarSolicitacao: (id, ajustes) => req('POST', `/api/solicitacoes/${id}/aprovar`, ajustes ?? {}),
  recusarSolicitacao: (id, motivo) => req('POST', `/api/solicitacoes/${id}/recusar`, { motivo }),
  proposta: (id) => req('GET', `/api/propostas/${id}`),
  aceitarProposta: (id, payload) => req('POST', `/api/propostas/${id}/aceite`, payload),
  dadosContrato: (id, payload) => req('POST', `/api/propostas/${id}/dados-contrato`, payload),
  contrato: (id) => req('GET', `/api/contratos/${id}`),
  assinarContrato: (id, payload) => req('POST', `/api/contratos/${id}/assinatura`, payload),
  minhaConta: () => req('GET', '/api/conta/me'),
  adminResumo: () => req('GET', '/api/admin/resumo'),
  auditoria: () => req('GET', '/api/admin/auditoria'),
  impostos: () => req('GET', '/api/admin/impostos')
};
