<script>
  /// Marca do provedor de identidade, desenhada aqui dentro.
  ///
  /// Nada de arquivo externo: a página é estática e se serve inteira, e um
  /// logotipo buscado no domínio do provedor entregaria a visita dele a cada
  /// carregamento desta tela.
  let { provedor, tamanho = 18 } = $props();
</script>

{#if provedor === 'google'}
  <svg width={tamanho} height={tamanho} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
    <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
    <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
  </svg>
{:else if provedor === 'apple'}
  <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M17.05 12.54c-.02-2.24 1.83-3.32 1.91-3.37-1.04-1.52-2.66-1.73-3.24-1.76-1.38-.14-2.69.81-3.39.81-.7 0-1.78-.79-2.92-.77-1.5.02-2.89.87-3.66 2.21-1.56 2.71-.4 6.72 1.12 8.92.74 1.08 1.63 2.29 2.79 2.25 1.12-.05 1.54-.72 2.9-.72 1.35 0 1.74.72 2.92.7 1.21-.02 1.97-1.1 2.71-2.18.85-1.25 1.2-2.46 1.22-2.52-.03-.01-2.34-.9-2.36-3.57z" />
    <path
      fill="currentColor"
      d="M14.86 5.87c.62-.75 1.03-1.79.92-2.83-.89.04-1.96.59-2.6 1.34-.57.66-1.07 1.72-.94 2.74.99.08 2-.5 2.62-1.25z" />
  </svg>
{:else if provedor === 'microsoft'}
  <svg width={tamanho} height={tamanho} viewBox="0 0 21 21" aria-hidden="true" focusable="false">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
{/if}
