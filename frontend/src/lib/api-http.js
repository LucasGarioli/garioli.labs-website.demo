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

export const api = {
  entrar: (email, senha) => req('POST', '/api/auth/entrar', { email, senha }),
  criarConta: (nome, email, senha) => req('POST', '/api/auth/criar-conta', { nome, email, senha }),
  sair: () => req('POST', '/api/auth/sair'),
  eu: () => req('GET', '/api/auth/eu'),

  triagemSchema: () => req('GET', '/api/triagem/schema'),
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
