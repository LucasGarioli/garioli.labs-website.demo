const BASE = import.meta.env.VITE_API_BASE ?? '';

/** Erro de API que carrega o status. As páginas guardadas precisam distinguir
 *  "sem sessão" (401 → mandar para /entrar) de "deu ruim" (mostrar o texto). */
export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

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

/** Manda para o login guardando de onde a pessoa veio, para voltar depois do
 *  acesso. Só 401: um 404 vindo de rota de dono significa "você está logado,
 *  mas isto não é seu" — mandar para o login ali daria um vaivém sem fim. */
export function exigeSessao(erro, goto, volta) {
  if (erro instanceof ErroApi && erro.status === 401) {
    goto(`/entrar?volta=${encodeURIComponent(volta)}`);
    return true;
  }
  return false;
}
