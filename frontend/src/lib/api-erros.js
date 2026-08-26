/** Erro de API que carrega o status. As páginas guardadas precisam distinguir
 *  "sem sessão" (401 → mandar para /entrar) de "deu ruim" (mostrar o texto).
 *
 *  Vive em módulo próprio porque os dois clientes — o HTTP e o de demonstração —
 *  precisam lançar o *mesmo* tipo, senão o `instanceof` abaixo falharia para um
 *  deles e a página guardada erraria o destino. */
export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

/** Manda para o login guardando de onde a pessoa veio, para voltar depois do
 *  acesso. Só 401: um 404 vindo de rota de dono significa "você está logado,
 *  mas isto não é seu" — mandar para o login ali daria um vaivém sem fim. */
export function exigeSessao(erro, goto, volta) {
  if (erro instanceof ErroApi && erro.status === 401) {
    // O login fica no mesmo idioma da página que exigiu a sessão.
    const porta = volta.startsWith('/en') ? '/en/entrar' : '/entrar';
    goto(`${porta}?volta=${encodeURIComponent(volta)}`);
    return true;
  }
  return false;
}
