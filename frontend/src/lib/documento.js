//! Validação de CPF e CNPJ.
//!
//! O passo 02 do fluxo de proposta alimenta a qualificação das partes na
//! cláusula 1ª — o contrato sai com o número que for digitado aqui. Aceitar
//! "12" como CNPJ produz um instrumento com a parte identificada errado, que é
//! exatamente o defeito que ninguém percebe até precisar cobrar.
//!
//! Os dígitos verificadores são os da Receita Federal; a mesma checagem existe
//! no backend (`backend/src/documento.rs`), porque validação de formulário no
//! navegador é conveniência, não barreira.

const digitos = (s) => (s ?? '').replace(/\D/g, '');

/** Todos os dígitos iguais passam na conta do verificador e não são documento
 *  válido — 111.111.111-11 fecha a aritmética e não existe. */
const repetido = (d) => /^(\d)\1+$/.test(d);

function verificador(base, pesos) {
  const soma = pesos.reduce((s, p, i) => s + Number(base[i]) * p, 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cpfValido(valor) {
  const d = digitos(valor);
  if (d.length !== 11 || repetido(d)) return false;
  const d1 = verificador(d, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = verificador(d, [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(d[9]) && d2 === Number(d[10]);
}

export function cnpjValido(valor) {
  const d = digitos(valor);
  if (d.length !== 14 || repetido(d)) return false;
  const d1 = verificador(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = verificador(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d1 === Number(d[12]) && d2 === Number(d[13]);
}

/** O campo aceita os dois: instituição com CNPJ, pessoa física com CPF. */
export function cpfOuCnpjValido(valor) {
  const d = digitos(valor);
  if (d.length === 11) return cpfValido(d);
  if (d.length === 14) return cnpjValido(d);
  return false;
}

export function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((valor ?? '').trim());
}

/** Máscara aplicada enquanto se digita: 11 dígitos viram CPF, 14 viram CNPJ,
 *  e o que estiver no meio do caminho fica como está para não brigar com o
 *  cursor. */
export function mascaraDocumento(valor) {
  const d = digitos(valor).slice(0, 14);
  if (d.length <= 11) {
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, '$1.$2.$3/$4-$5');
}

export function mascaraCpf(valor) {
  return mascaraDocumento(digitos(valor).slice(0, 11));
}

/** Qual regra cada campo do contrato obedece. A tela consulta esta tabela em
 *  vez de repetir `if (campo === 'cnpj')` em cada lugar. */
export const REGRA_CAMPO = {
  cnpj: { valida: cpfOuCnpjValido, mascara: mascaraDocumento, erro: 'documento' },
  cpf_rep: { valida: cpfValido, mascara: mascaraCpf, erro: 'cpf' },
  email: { valida: emailValido, mascara: (v) => v, erro: 'email' }
};

/** Um campo sem regra própria só precisa ter conteúdo de gente: duas letras
 *  não são um endereço nem uma razão social. */
export function campoValido(chave, valor) {
  const regra = REGRA_CAMPO[chave];
  if (regra) return regra.valida(valor);
  return (valor ?? '').trim().length >= 3;
}
