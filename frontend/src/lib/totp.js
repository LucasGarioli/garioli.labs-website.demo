//! Segundo fator por aplicativo — TOTP, RFC 6238.
//!
//! Isto **não** é simulado. O código de seis dígitos que a demonstração aceita
//! é o mesmo que o Google Authenticator, o Aegis ou o 1Password mostram para o
//! segredo emitido aqui: HMAC-SHA1 sobre o contador de trinta segundos, como
//! manda a RFC 4226 e a 6238. O que a demonstração não tem é servidor — o
//! segredo vive em `sessionStorage` e morre com a aba.
//!
//! `crypto.subtle` só existe em contexto seguro (https ou localhost). Fora
//! dele, `emitirSegredo` avisa em vez de devolver um segredo que ninguém
//! conseguiria conferir.

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PASSO = 30; // segundos por código
const DIGITOS = 6;

/// Base32 sem preenchimento, que é o que os aplicativos autenticadores leem.
export function base32(bytes) {
  let acumulado = 0;
  let bits = 0;
  let saida = '';
  for (const b of bytes) {
    acumulado = (acumulado << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      saida += ALFABETO[(acumulado >> bits) & 31];
    }
  }
  if (bits > 0) saida += ALFABETO[(acumulado << (5 - bits)) & 31];
  return saida;
}

/// O caminho de volta. Aceita espaços e minúsculas, que é como as pessoas
/// digitam um segredo copiado da tela.
export function deBase32(texto) {
  let acumulado = 0;
  let bits = 0;
  const bytes = [];
  for (const c of texto.replace(/[\s-]/g, '').toUpperCase()) {
    const v = ALFABETO.indexOf(c);
    if (v < 0) {
      if (c === '=') continue;
      throw new Error('segredo inválido');
    }
    acumulado = (acumulado << 5) | v;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((acumulado >> bits) & 255);
    }
  }
  return Uint8Array.from(bytes);
}

/// Vinte bytes de aleatoriedade — o tamanho do bloco do SHA-1, que é o que a
/// RFC 4226 recomenda como mínimo para a chave.
export function emitirSegredo() {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new Error('este navegador não oferece geração de números aleatórios');
  }
  return base32(crypto.getRandomValues(new Uint8Array(20)));
}

/// `otpauth://` — o formato que todo aplicativo autenticador entende. No
/// telefone, tocar no link abre o aplicativo direto.
export function uriOtpAuth({ segredo, conta, emissor }) {
  const rotulo = encodeURIComponent(`${emissor}:${conta}`);
  const busca = new URLSearchParams({
    secret: segredo,
    issuer: emissor,
    algorithm: 'SHA1',
    digits: String(DIGITOS),
    period: String(PASSO)
  });
  return `otpauth://totp/${rotulo}?${busca}`;
}

/// O contador de oito bytes, big-endian. `BigInt` porque o número de passos
/// cabe folgado em 53 bits hoje, mas o campo é de 64 e a conta tem que ser a
/// do campo, não a do que cabe.
function contador(passos) {
  const buf = new Uint8Array(8);
  let n = BigInt(passos);
  for (let i = 7; i >= 0; i--) {
    buf[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return buf;
}

async function hmacSha1(chave, mensagem) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    throw new Error('a verificação em dois fatores precisa de uma conexão segura (https)');
  }
  const k = await crypto.subtle.importKey(
    'raw',
    chave,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, mensagem));
}

/// Código de `digitos` para um instante. `segundos` é tempo Unix; deixá-lo
/// como parâmetro é o que torna os vetores da RFC verificáveis.
export async function codigo(segredo, segundos = Math.floor(Date.now() / 1000), digitos = DIGITOS) {
  const mac = await hmacSha1(deBase32(segredo), contador(Math.floor(segundos / PASSO)));
  // Truncagem dinâmica da RFC 4226 §5.3: o nibble final escolhe de onde
  // saem os quatro bytes, e o bit de sinal do primeiro deles é descartado.
  const desloc = mac[mac.length - 1] & 0x0f;
  const bruto =
    ((mac[desloc] & 0x7f) << 24) |
    (mac[desloc + 1] << 16) |
    (mac[desloc + 2] << 8) |
    mac[desloc + 3];
  return String(bruto % 10 ** digitos).padStart(digitos, '0');
}

/// Confere o código aceitando um passo para trás e um para a frente: relógio
/// de telefone atrasado alguns segundos é a causa mais comum de recusa, e
/// negar um código certo é pior do que uma janela de noventa segundos.
export async function confere(segredo, digitado, segundos = Math.floor(Date.now() / 1000)) {
  const limpo = (digitado ?? '').replace(/\s/g, '');
  if (!/^\d{6}$/.test(limpo)) return false;
  for (const salto of [-1, 0, 1]) {
    if (await codigo(segredo, segundos + salto * PASSO) === limpo) return true;
  }
  return false;
}

/// Códigos de recuperação: o que resta quando o telefone se perde. Dez
/// grupos de quatro caracteres do mesmo alfabeto, sem ambiguidade entre 0/O
/// e 1/I porque a pessoa vai copiá-los à mão.
export function codigosDeRecuperacao(quantos = 8) {
  const bytes = crypto.getRandomValues(new Uint8Array(quantos * 5));
  const saida = [];
  for (let i = 0; i < quantos; i++) {
    const pedaco = base32(bytes.slice(i * 5, i * 5 + 5)).slice(0, 8);
    saida.push(`${pedaco.slice(0, 4)}-${pedaco.slice(4)}`);
  }
  return saida;
}
