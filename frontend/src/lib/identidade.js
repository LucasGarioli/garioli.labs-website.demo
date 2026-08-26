/// Identidade da empresa e modo de exibição.
///
/// **Este é o único arquivo que difere entre o repositório real e este, público
/// de demonstração.** Aqui os dados cadastrais são neutros, o selo de parceria
/// sai e `demonstracao` fica `true`, o que troca a nota do estudo de caso nos
/// dois idiomas, tira as páginas do índice de busca e esvazia o sitemap — a
/// vitrine nunca deve competir com o site real pela mesma busca. Todo o resto
/// do site é byte a byte o mesmo.

export const empresa = {
  nome: 'GARIOLI LABS',
  razao: 'Razão social de exemplo',
  cnpj: '00.000.000/0001-00',
  cidade: 'Cachoeiro de Itapemirim · ES',
  cidadeSimples: 'Cachoeiro de Itapemirim',
  estado: 'ES',
  pais: 'BR',
  site: 'demo.gariolilabs.com',
  url: 'https://demo.gariolilabs.com',
  fone: '(00) 00000-0000',
  foneE164: '+550000000000',
  email: 'contato@example.com',
  selo: '', // credencial real omitida na demonstração
  responsavel: 'Lucas Ribeiro Garioli'
};

/// `true` só nesta versão pública de demonstração.
export const demonstracao = true;
