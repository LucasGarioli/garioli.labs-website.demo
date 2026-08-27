//! Lembrete de interface — **não** é autorização.
//!
//! A barra de topo precisa saber, no primeiro quadro, se há alguém logado. A
//! resposta de verdade vem de `api.eu()`, que é assíncrona: com a demonstração
//! são 180 ms de latência simulada, e com a API real é uma ida ao servidor.
//! Nesse intervalo a barra desenhava "Entrar" para quem acabara de entrar —
//! que foi o defeito relatado.
//!
//! Então o resultado da última verificação fica anotado aqui, e a barra começa
//! por ele. A anotação é uma dica de desenho: quem manda continua sendo o
//! backend, e toda página guardada segue perguntando a ele. Uma anotação
//! mentirosa (sessão que caiu do outro lado, aba antiga) só faz a barra
//! aparecer errada por um quadro — a verificação real a corrige em seguida, e
//! nenhuma porta se abre por causa dela.
//!
//! Vive em `sessionStorage`, como o resto do estado da demonstração: fechou a
//! aba, esqueceu.

const CHAVE = 'gl_sessao_ui';

/** Avisa quem desenha a barra que a anotação mudou.
 *
 *  A barra lê a anotação uma vez, ao montar. Trocar a foto ou o nome no
 *  cadastro acontece em outra parte da página, e sem este aviso a barra só
 *  descobriria a mudança na próxima navegação — a pessoa salva a foto e a
 *  barra continua com as iniciais. */
const AVISO = 'gl:sessao';

function avisar() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(AVISO));
}

/** Assina o aviso e devolve como cancelar. */
export function aoMudar(quando) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(AVISO, quando);
  return () => window.removeEventListener(AVISO, quando);
}

/** O que a última verificação encontrou, ou `null`. */
export function lembrada() {
  if (typeof sessionStorage === 'undefined') return null;
  try {
    const cru = sessionStorage.getItem(CHAVE);
    if (!cru) return null;
    const u = JSON.parse(cru);
    // Só o que a barra desenha. Se a forma mudar, a dica é descartada em vez
    // de quebrar a barra.
    return u && u.papel && u.iniciais ? u : null;
  } catch {
    return null;
  }
}

/** Anota o que o backend acabou de responder. */
export function lembrar(u) {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(
      CHAVE,
      JSON.stringify({ nome: u.nome, iniciais: u.iniciais, papel: u.papel, foto: u.foto ?? null })
    );
  } catch {
    // Armazenamento bloqueado: a barra só perde o atalho, não a função.
  }
  avisar();
}

/** Apaga a anotação — saída, ou 401 na verificação. */
export function esquecer() {
  if (typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.removeItem(CHAVE);
  } catch {
    /* idem */
  }
  avisar();
}
