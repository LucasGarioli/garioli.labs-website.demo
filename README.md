# Garioli Labs — plataforma (demonstração)

Site institucional e plataforma de uma consultoria de engenharia acústica e
audiovisual: **SvelteKit 5** no front, **Axum (Rust)** na API, uma identidade
visual só do site público ao painel administrativo.

> **Versão de demonstração.** Este repositório existe para mostrar o trabalho.
> Clientes, valores, prazos, parcelas e números fiscais são **fictícios** —
> criados para exercitar as telas, não para descrever nenhum cliente real nem a
> situação de nenhuma empresa. O painel avisa isso na própria interface. A
> versão que roda o negócio é privada.
>
> A página publicada roda **inteiramente no navegador** — sem servidor, sem
> banco. Veja [Dois backends, um front](#dois-backends-um-front).

O percurso completo está aqui: alguém pede um orçamento pela triagem pública, o
dono analisa e aprova no painel, a proposta é gerada, o cliente aceita, o
contrato sai do aceite e é assinado — cada passo gravado numa trilha de
auditoria que não tem caminho de remoção.

## O que vale olhar

| Onde | Por quê |
| --- | --- |
| `backend/src/auth.rs` | Argon2id, cookie de sessão e dois extratores — `Autenticado` e `Dono` — que fecham a API pelo tipo, não por `if` espalhado |
| `backend/src/triagem.rs` | regra de preço por frente com teste garantindo que área maior nunca sai mais barata |
| `backend/src/store.rs` | trilha de auditoria append-only e o texto das cláusulas gerado dos dados do cliente |
| `frontend/src/lib/Nav.svelte` | barra grudenta com scroll-spy escrito direto no DOM, fora do caminho reativo |
| `frontend/src/routes/orcamento/` | triagem de 11 passos que não devolve preço ao cliente |

## Dois backends, um front

O front não sabe com quem está falando. `src/lib/api.js` escolhe entre duas
implementações da mesma superfície:

| | Quando | O que roda |
| --- | --- | --- |
| `api-http.js` | `VITE_API_BASE` definida | a API Axum de verdade, com cookie de sessão `HttpOnly` |
| `api-demo.js` | sem `VITE_API_BASE` | um porte da API em JavaScript, dentro do navegador |

É isso que deixa a demonstração ser um site estático: nada para hospedar além de
arquivos, e ainda assim todas as telas funcionam — a triagem calcula faixa de
preço, o aceite gera contrato, a assinatura fecha a trilha de auditoria.

O que o porte preserva: as rotas, as formas de resposta, os códigos de erro, o
cálculo da triagem, a separação cliente/dono (rota de dono responde 404) e a
trilha append-only. O que ele não tem: hash Argon2id, cookie assinado e
persistência — o estado vive em `sessionStorage` e some ao fechar a aba.
**Qualquer** senha de 8 caracteres entra; `demo@exemplo.com` entra como dono.
A tela de acesso diz isso e traz um botão que preenche o acesso do dono.

A lógica que importa continua sendo a do Rust — é ela que roda em produção, e é
para ela que vale olhar.

## Rodar

```bash
# API (porta 8080)
cd backend
GARIOLI_ADMIN_SENHA="escolha uma senha" cargo run

# Front (porta 5173, com proxy /api → 8080)
cd frontend
npm install
npm run dev
```

Sem `GARIOLI_ADMIN_SENHA`, a conta do dono nasce com uma senha sorteada, avisada
uma vez no log de inicialização — nenhuma credencial padrão mora neste
repositório, e não deve passar a morar.

| Variável | Para quê | Sem ela |
| --- | --- | --- |
| `GARIOLI_ADMIN_SENHA` | senha da conta do dono | sorteia uma e avisa no log |
| `GARIOLI_ADMIN_EMAIL` | e-mail da conta do dono | `demo@exemplo.com` |
| `GARIOLI_COOKIE_SECURE` | marca o cookie de sessão como `Secure` | cookie sem `Secure` — só para desenvolvimento em http |
| `GARIOLI_ORIGENS` | origens aceitas pelo CORS, separadas por vírgula | `http://localhost:5173,http://127.0.0.1:5173` |

Em produção, `GARIOLI_COOKIE_SECURE` é obrigatório: sem ele o cookie de sessão
viaja em claro.

Testes da regra de precificação:

```bash
cd backend && cargo test
```

## Estrutura

```
frontend/
  src/lib/design-system.css   design system Modernist (tokens + componentes), copiado íntegro
  src/lib/app.css             utilitários do projeto (.display, .kicker, .btn-solid…)
  src/lib/api.js              escolhe o backend: HTTP real ou demonstração
  src/lib/api-http.js         cliente da API Axum — um método por endpoint
  src/lib/api-demo.js         porte da API em JS, roda no navegador (build de portfólio)
  src/lib/api-erros.js        ErroApi e o desvio para /entrar, compartilhados pelos dois
  src/lib/content.js          textos institucionais (serviços, processo, rodapé)
  src/lib/Nav.svelte          barra de navegação
  src/lib/Footer.svelte       rodapé com dados da empresa e selo ARS
  src/routes/+page.svelte             /            site institucional
  src/routes/entrar/+page.svelte      /entrar      acesso: entrar, criar conta, recuperar
  src/routes/orcamento/+page.svelte   /orcamento   triagem pública (11 passos)
  src/routes/conta/+page.svelte       /conta       conta única: projetos, cursos, licenças, documentos
  src/routes/proposta/+page.svelte    /proposta    aceite → dados → contrato → assinatura
  src/routes/admin/+page.svelte       /admin       painel do dono (8 visões)

backend/
  src/models.rs    tipos de domínio (serde) — solicitação, proposta, contrato, auditoria, usuário
  src/auth.rs      senha (Argon2id), cookie de sessão e os extratores Autenticado / Dono
  src/triagem.rs   questionário + regra de preço por frente e multiplicador de área + testes
  src/store.rs     estado em memória, trilha de auditoria append-only, texto das cláusulas
  src/main.rs      rotas Axum
```

## Endpoints

Rotas marcadas **dono** respondem 404 — não 403 — para quem tem sessão mas não é
dono: a rota não se anuncia a quem não é dela.

| Método | Rota | Para quê |
| --- | --- | --- |
| POST | `/api/auth/entrar` | login → cookie `gl_sessao` |
| POST | `/api/auth/criar-conta` | conta de cliente |
| POST | `/api/auth/sair` | encerra a sessão no servidor |
| GET | `/api/auth/eu` | quem está na sessão |
| GET | `/api/triagem/schema` | questionário (o front não hardcoda perguntas) |
| POST | `/api/solicitacoes` | envio da triagem → protocolo |
| GET | `/api/solicitacoes` | fila do admin · **dono** |
| POST | `/api/solicitacoes/:id/aprovar` | aprovação → gera proposta · **dono** |
| POST | `/api/solicitacoes/:id/recusar` | recusa · **dono** |
| GET | `/api/propostas/:id` | proposta para o portal |
| POST | `/api/propostas/:id/aceite` | aceite com observações (grava IP e hora) |
| POST | `/api/propostas/:id/dados-contrato` | dados do cliente → gera contrato |
| GET | `/api/contratos/:id` | contrato gerado |
| POST | `/api/contratos/:id/assinatura` | assinatura eletrônica |
| GET | `/api/conta/me` | painel do cliente · **autenticado** |
| GET | `/api/admin/resumo` | KPIs, pipeline, financeiro, execução · **dono** |
| GET | `/api/admin/auditoria` | trilha imutável · **dono** |
| GET | `/api/admin/impostos` | MEI × Simples Anexo III × Anexo V · **dono** |

## Decisões que o código carrega de propósito

- **Nenhum preço vai ao cliente na triagem.** A faixa é calculada no servidor e só aparece no admin.
  O cliente vê "solicitação recebida" — você não fica preso a número que um formulário calculou.
- **A trilha de auditoria não tem caminho de remoção.** `Store::registrar` só insere; não existe
  `remover`. Aceite e assinatura gravam IP e horário e são marcados como críticos.
- **Contrato exige aceite.** `POST /dados-contrato` devolve 409 se a proposta não foi aceita.
- **O texto das cláusulas vive em `store.rs`**, gerado a partir dos dados que o cliente informa —
  o mesmo texto serve a tela e ao PDF, sem duas redações divergindo.
- **Login não diz quais contas existem.** Senha errada e e-mail inexistente devolvem a mesma
  mensagem e o mesmo 401; caso contrário o formulário vira um oráculo de cadastro.
- **Nenhuma credencial padrão no repositório.** Sem `GARIOLI_ADMIN_SENHA`, a senha do dono é
  sorteada a cada início e avisada no log — errar para o lado de "ninguém entra" em vez de
  "todo mundo sabe a senha".
- **A comparação de regimes é apoio à decisão, não parecer contábil.** As alíquotas e o teto do
  MEI são de tabela; a receita é dado fictício, como o resto do painel.
- **Multiplicador de área** (1.0 / 1.2 / 1.5 / 1.9) é a única variável de dimensionamento no preço,
  com teste garantindo que área maior nunca sai mais barata.

## O que está stub e precisa de você

1. **Persistência** — hoje é `RwLock` em memória; troque por PostgreSQL (sqlx) sem mudar as rotas.
   Sessões e usuários vivem no mesmo `Store`, então a troca não muda a assinatura de nada.
2. **Recuperação de senha** — `/entrar` diz com todas as letras que o link automático não existe
   e manda escrever para o e-mail da empresa. Precisa de envio de e-mail para virar fluxo real.
3. **Assinatura eletrônica** — `assinar_contrato` marca a data localmente. A integração real
   (Gov.br ou Autentique) deve guardar o hash do documento devolvido pelo provedor.
4. **Geração de PDF** — `pdf_url` aponta para rota inexistente. Os PDFs atuais saem das páginas
   HTML deste projeto; para gerar pelo servidor, renderize as cláusulas com `typst` ou headless Chrome.
5. **Agente de dúvidas** — o campo de perguntas do portal responde com texto fixo. Plugue seu LLM.
6. **E-mail / WhatsApp** — nenhum envio real acontece.

## Licença

Código aberto para leitura e avaliação. A marca, os textos institucionais e a
identidade visual da Garioli Labs não são de uso livre.
