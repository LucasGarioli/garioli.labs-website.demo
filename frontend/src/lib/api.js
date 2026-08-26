//! Escolhe com qual backend as páginas falam.
//!
//! Com `VITE_API_BASE` definida, o site conversa com a API Axum de verdade
//! (`backend/`) — é assim que roda em produção. Sem ela, entra o backend de
//! demonstração, que roda dentro do navegador e deixa esta build de portfólio
//! ser inteiramente estática: nada para hospedar além de arquivos.
//!
//! As duas implementações expõem exatamente a mesma superfície e lançam o mesmo
//! `ErroApi`, então nenhuma página sabe qual das duas está atendendo.

import { api as http } from './api-http.js';
import { api as demo, EMAIL_DONO } from './api-demo.js';

export { ErroApi, exigeSessao } from './api-erros.js';

/** Verdadeiro quando não há backend configurado — a build de portfólio. */
export const MODO_DEMO = !import.meta.env.VITE_API_BASE;

/** E-mail que entra como dono na demonstração. Mostrado na tela de acesso. */
export { EMAIL_DONO };

export const api = MODO_DEMO ? demo : http;
