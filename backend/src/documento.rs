//! Validação de CPF, CNPJ e e-mail.
//!
//! O passo de dados do fluxo de proposta alimenta a qualificação das partes na
//! cláusula 1ª — o contrato sai com o número que for gravado aqui. Aceitar
//! "12" como CNPJ produz um instrumento com a parte identificada errado, e isso
//! só aparece quando for preciso cobrar.
//!
//! A mesma checagem existe em `frontend/src/lib/documento.js`, que dá o retorno
//! imediato no formulário. A do navegador é conveniência; esta é a barreira.

fn digitos(valor: &str) -> Vec<u32> {
    valor.chars().filter_map(|c| c.to_digit(10)).collect()
}

/// Todos os dígitos iguais fecham a aritmética do verificador e não são
/// documento válido — 111.111.111-11 passa na conta e não existe.
fn repetido(d: &[u32]) -> bool {
    d.windows(2).all(|par| par[0] == par[1])
}

fn verificador(base: &[u32], pesos: &[u32]) -> u32 {
    let soma: u32 = pesos.iter().zip(base).map(|(p, d)| p * d).sum();
    let resto = soma % 11;
    if resto < 2 {
        0
    } else {
        11 - resto
    }
}

pub fn cpf_valido(valor: &str) -> bool {
    let d = digitos(valor);
    if d.len() != 11 || repetido(&d) {
        return false;
    }
    verificador(&d, &[10, 9, 8, 7, 6, 5, 4, 3, 2]) == d[9]
        && verificador(&d, &[11, 10, 9, 8, 7, 6, 5, 4, 3, 2]) == d[10]
}

pub fn cnpj_valido(valor: &str) -> bool {
    let d = digitos(valor);
    if d.len() != 14 || repetido(&d) {
        return false;
    }
    verificador(&d, &[5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) == d[12]
        && verificador(&d, &[6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) == d[13]
}

/// O campo aceita os dois: instituição com CNPJ, pessoa física com CPF.
pub fn cpf_ou_cnpj_valido(valor: &str) -> bool {
    match digitos(valor).len() {
        11 => cpf_valido(valor),
        14 => cnpj_valido(valor),
        _ => false,
    }
}

/// Checagem de forma, não de existência: um endereço só se prova enviando.
pub fn email_valido(valor: &str) -> bool {
    let v = valor.trim();
    let mut partes = v.splitn(2, '@');
    let (usuario, dominio) = match (partes.next(), partes.next()) {
        (Some(u), Some(d)) => (u, d),
        _ => return false,
    };
    !usuario.is_empty()
        && !v.chars().any(char::is_whitespace)
        && !dominio.contains('@')
        && dominio
            .rsplit_once('.')
            .is_some_and(|(antes, tld)| !antes.is_empty() && tld.len() >= 2)
}

#[cfg(test)]
mod testes {
    use super::*;

    #[test]
    fn cpf_conhecido_passa() {
        assert!(cpf_valido("529.982.247-25"));
        assert!(cpf_valido("52998224725"));
    }

    #[test]
    fn cpf_com_digito_trocado_falha() {
        assert!(!cpf_valido("529.982.247-24"));
        assert!(!cpf_valido("529.982.247-15"));
    }

    #[test]
    fn cpf_com_tamanho_errado_falha() {
        assert!(!cpf_valido("5299822472"));
        assert!(!cpf_valido("529982247250"));
        assert!(!cpf_valido(""));
    }

    /// A sequência repetida é o caso que passa na conta e não é documento.
    #[test]
    fn cpf_repetido_falha() {
        for d in 0..=9 {
            assert!(!cpf_valido(&d.to_string().repeat(11)), "{d} repetido passou");
        }
    }

    #[test]
    fn cnpj_conhecido_passa() {
        assert!(cnpj_valido("11.222.333/0001-81"));
        assert!(cnpj_valido("11222333000181"));
    }

    #[test]
    fn cnpj_com_digito_trocado_falha() {
        assert!(!cnpj_valido("11.222.333/0001-82"));
        assert!(!cnpj_valido("11.222.333/0001-91"));
    }

    #[test]
    fn cnpj_repetido_falha() {
        for d in 0..=9 {
            assert!(!cnpj_valido(&d.to_string().repeat(14)), "{d} repetido passou");
        }
    }

    /// O campo do contrato aceita os dois, e nada além dos dois.
    #[test]
    fn campo_aceita_cpf_e_cnpj_e_recusa_o_resto() {
        assert!(cpf_ou_cnpj_valido("529.982.247-25"));
        assert!(cpf_ou_cnpj_valido("11.222.333/0001-81"));
        assert!(!cpf_ou_cnpj_valido("12"));
        assert!(!cpf_ou_cnpj_valido("sem número nenhum"));
        assert!(!cpf_ou_cnpj_valido("529.982.247-2"));
    }

    #[test]
    fn email_de_forma_valida_passa() {
        assert!(email_valido("rosana@exemplo.com"));
        assert!(email_valido("  rosana.vieira@sub.exemplo.com.br "));
    }

    #[test]
    fn email_sem_dominio_ou_com_espaco_falha() {
        assert!(!email_valido("rosana@exemplo"));
        assert!(!email_valido("rosana"));
        assert!(!email_valido("@exemplo.com"));
        assert!(!email_valido("ro sana@exemplo.com"));
        assert!(!email_valido("rosana@@exemplo.com"));
        assert!(!email_valido("rosana@.com"));
    }
}
