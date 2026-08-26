import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    // Toda rota é pré-renderizada (ver src/routes/+layout.js), então o
    // `index.html` do build é a home de verdade — o fallback precisa de outro
    // nome, ou sobrescreve a página com uma casca vazia.
    adapter: adapter({ fallback: '404.html' }),
    alias: { $lib: 'src/lib' }
  }
};
