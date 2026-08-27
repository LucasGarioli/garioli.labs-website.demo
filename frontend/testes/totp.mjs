/** Os vetores de teste da RFC 6238, apêndice B.
 *
 *  O segundo fator é a única coisa desta demonstração que precisa estar certa
 *  contra uma especificação, e não contra o gosto de quem escreveu: se o código
 *  aqui divergir um dígito do que o aplicativo autenticador mostra, ninguém
 *  entra. Por isso os vetores da própria RFC, e não um teste que confere a
 *  implementação consigo mesma.
 *
 *  O segredo dos vetores é a cadeia ASCII "12345678901234567890" — vinte bytes,
 *  o tamanho do bloco do SHA-1. Aqui ela aparece em base32, que é a forma que
 *  `codigo()` recebe.
 *
 *  uso: node testes/totp.mjs
 */
import {
  base32,
  codigo,
  codigosDeRecuperacao,
  confere,
  deBase32,
  emitirSegredo,
  uriOtpAuth
} from '../src/lib/totp.js';

const SEGREDO = base32(new TextEncoder().encode('12345678901234567890'));

// RFC 6238, apêndice B — a coluna SHA-1 da tabela.
const VETORES = [
  [59, '94287082'],
  [1111111109, '07081804'],
  [1111111111, '14050471'],
  [1234567890, '89005924'],
  [2000000000, '69279037'],
  [20000000000, '65353130']
];

let falhas = 0;
const conferir = (nome, obtido, esperado) => {
  const ok = obtido === esperado;
  if (!ok) falhas++;
  console.log(`${ok ? 'ok  ' : 'FALHA'} ${nome}${ok ? '' : ` — esperado ${esperado}, obtido ${obtido}`}`);
};

for (const [segundos, esperado] of VETORES) {
  // Os vetores são de oito dígitos; a produção usa seis, que são os últimos
  // seis do mesmo número — é a mesma truncagem, com módulo diferente.
  conferir(`RFC 6238 t=${segundos}`, await codigo(SEGREDO, segundos, 8), esperado);
  conferir(`RFC 6238 t=${segundos} (6 dígitos)`, await codigo(SEGREDO, segundos, 6), esperado.slice(2));
}

// Base32 tem que ser reversível: é por ela que o segredo passa da tela para o
// aplicativo e de volta.
const bytes = crypto.getRandomValues(new Uint8Array(20));
conferir('base32 ida e volta', base32(deBase32(base32(bytes))), base32(bytes));
conferir(
  'base32 aceita espaços e minúsculas',
  base32(deBase32(base32(bytes).match(/.{1,4}/g).join(' ').toLowerCase())),
  base32(bytes)
);

// A janela de tolerância: um passo para trás e um para a frente entram, dois
// não. Sem isso, telefone com relógio atrasado nunca entra; com demais, a
// janela deixa de ser janela.
const t = 1700000000;
for (const [salto, esperado] of [[-2, false], [-1, true], [0, true], [1, true], [2, false]]) {
  const c = await codigo(SEGREDO, t + salto * 30);
  conferir(`janela ${salto} passo(s)`, await confere(SEGREDO, c, t), esperado);
}
conferir('código malformado é recusado', await confere(SEGREDO, '12345', t), false);
conferir('código vazio é recusado', await confere(SEGREDO, '', t), false);

// O segredo emitido precisa servir a um aplicativo de verdade.
const novo = emitirSegredo();
conferir('segredo emitido tem 32 caracteres', novo.length, 32);
conferir('segredo emitido é base32 válido', deBase32(novo).length, 20);

const uri = uriOtpAuth({ segredo: novo, conta: 'alguem@exemplo.com', emissor: 'Garioli Labs' });
const params = new URL(uri).searchParams;
conferir('otpauth é totp', uri.startsWith('otpauth://totp/'), true);
conferir('otpauth leva o segredo', params.get('secret'), novo);
conferir('otpauth declara SHA1', params.get('algorithm'), 'SHA1');
conferir('otpauth declara 6 dígitos', params.get('digits'), '6');
conferir('otpauth declara 30 s', params.get('period'), '30');

// Códigos de recuperação: oito, distintos, no formato que se copia à mão.
const recuperacao = codigosDeRecuperacao();
conferir('oito códigos de recuperação', recuperacao.length, 8);
conferir('todos distintos', new Set(recuperacao).size, 8);
conferir('formato XXXX-XXXX', recuperacao.every((c) => /^[A-Z2-7]{4}-[A-Z2-7]{4}$/.test(c)), true);

console.log(falhas ? `\n${falhas} falha(s)` : '\ntudo certo');
process.exit(falhas ? 1 : 0);
