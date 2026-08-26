/// Pré-renderização de todas as rotas.
///
/// Sem isto o `adapter-static` entrega um `index.html` vazio e todo o texto
/// aparece só depois do JavaScript rodar — o buscador indexa a casca, não a
/// página. Com isto, cada rota vira um arquivo HTML já com título, descrição,
/// dados estruturados e o conteúdo nos dois idiomas.
///
/// As telas de conta, proposta e administração também são pré-renderizadas,
/// mas o que sai gravado é só a moldura: os dados continuam vindo da API no
/// navegador, depois da autenticação.
export const prerender = true;

/// O roteamento continua no cliente (o site é uma SPA depois do primeiro
/// carregamento); `trailingSlash` normalizado evita que `/en` e `/en/` sejam
/// duas URLs para o buscador.
export const trailingSlash = 'never';
