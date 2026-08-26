/// Carimba `<html lang>` de acordo com a URL.
///
/// O idioma do documento precisa estar no HTML que o buscador recebe, não em
/// um efeito do cliente: é por ele que o Google decide para qual público
/// mostrar a página, e é por ele que o leitor de tela escolhe a pronúncia.
/// Como o site é pré-renderizado, este gancho roda no build e o atributo sai
/// gravado em cada arquivo.
import { idiomaDaRota, textos } from '$lib/conteudo/index.js';

export async function handle({ event, resolve }) {
  const lang = textos(idiomaDaRota(event.url.pathname)).htmlLang;
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang)
  });
}
