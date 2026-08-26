<div align="center">

<img src="frontend/static/favicon-192.png" alt="" width="72" height="72" />

# Garioli Labs — plataforma

**Do primeiro contato ao contrato assinado, em um sistema só.**
SvelteKit 5 no front, Axum (Rust) na API, uma identidade visual do site público ao painel administrativo.

[![CI](https://github.com/LucasGarioli/garioli.labs-website.demo/actions/workflows/ci.yml/badge.svg)](https://github.com/LucasGarioli/garioli.labs-website.demo/actions/workflows/ci.yml)
[![Demo ao vivo](https://img.shields.io/badge/demo-demo.gariolilabs.com-ec3013)](https://demo.gariolilabs.com)
[![Rust](https://img.shields.io/badge/Rust-Axum%200.7-000000?logo=rust&logoColor=white)](https://github.com/tokio-rs/axum)
[![Svelte](https://img.shields.io/badge/Svelte-5%20runes-ff3e00?logo=svelte&logoColor=white)](https://svelte.dev)
[![Cloudflare Workers](https://img.shields.io/badge/deploy-Cloudflare%20Workers-f38020?logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/)

**[▶ Abrir a demonstração](https://demo.gariolilabs.com)** · entre com `demo@exemplo.com` e qualquer senha de 8 caracteres

</div>

---

> [!IMPORTANT]
> **Versão de demonstração.** Este repositório existe para mostrar o trabalho.
> Clientes, valores, prazos, parcelas, números fiscais e os números do estudo de
> caso da home são **fictícios** — criados para exercitar as telas, não para
> descrever nenhum cliente real nem a situação de nenhuma empresa. O painel e a
> própria home avisam isso na interface, e credenciais de parceria reais ficam
> de fora. A versão que roda o negócio é privada.
>
> A página publicada roda **inteiramente no navegador** — sem servidor, sem
> banco. Veja [Dois backends, um front](#dois-backends-um-front).

## Índice

- [O problema](#o-problema)
- [Ver funcionando](#ver-funcionando)
- [A página pública](#a-página-pública)
- [Arquitetura](#arquitetura)
  - [Dois backends, um front](#dois-backends-um-front)
  - [Topologia de publicação](#topologia-de-publicação)
- [O domínio: da triagem à assinatura](#o-domínio-da-triagem-à-assinatura)
  - [Estados de uma solicitação](#estados-de-uma-solicitação)
  - [A regra de preço](#a-regra-de-preço)
- [Decisões de projeto](#decisões-de-projeto)
- [Segurança](#segurança)
- [Estrutura](#estrutura)
- [Endpoints](#endpoints)
- [Rodar localmente](#rodar-localmente)
- [Testes e CI](#testes-e-ci)
- [Publicar](#publicar)
- [Limites conhecidos](#limites-conhecidos)
- [Licença](#licença)

## O problema

Uma consultoria de engenharia pequena perde dinheiro em dois lugares invisíveis:
no orçamento improvisado — cada proposta redigida do zero, cada valor negociado
de memória — e no que ninguém anotou: quando o cliente aceitou, o que ele
aceitou, quem prometeu o quê.

Este sistema fecha os dois. A triagem pública coleta o que define o preço; o
dono analisa e aprova; a proposta sai com escopo e faixa de valor; o cliente
aceita; o contrato é gerado **a partir do aceite**, com o mesmo texto e os
mesmos números; a assinatura fecha o ciclo. Cada passo grava uma linha numa
trilha de auditoria que não tem caminho de remoção.

O percurso inteiro está neste repositório e roda na demonstração.

## Ver funcionando

<table>
<tr>
<td width="50%"><img src="docs/img/home.jpg" alt="Site institucional" /><br /><sub><b>Site institucional</b> — a porta de entrada pública.</sub></td>
<td width="50%"><img src="docs/img/triagem.jpg" alt="Triagem de 11 passos" /><br /><sub><b>Triagem</b> — 11 passos que definem o preço, sem devolver preço ao cliente.</sub></td>
</tr>
<tr>
<td width="50%"><img src="docs/img/admin-hoje.jpg" alt="Painel do dono" /><br /><sub><b>Painel do dono</b> — o que exige ação hoje, antes de qualquer relatório.</sub></td>
<td width="50%"><img src="docs/img/admin-impostos.jpg" alt="Planejamento tributário" /><br /><sub><b>Planejamento tributário</b> — MEI × Simples Anexo III × Anexo V, com o Fator R.</sub></td>
</tr>
</table>

## A página pública

A home não é uma vitrine de adjetivos: ela é a primeira peça de prova. Oito
seções, todas ancoradas na barra de navegação com *scroll-spy*, levam o leitor
do problema ao contrato sem trocar de página.

| Seção | O que ela responde |
| --- | --- |
| Hero + números | o que a empresa faz, em uma frase e quatro medidas |
| Serviços | as seis frentes que podem ser contratadas separadamente |
| Processo | os cinco passos, da triagem à entrega |
| **Estudo de caso** | o resultado: cinco números, a ficha da sala e as três verificações normativas que decidiram o projeto |
| Entrega | o que fica com o cliente — plantas, memorial, diagramas, comissionamento |
| Software | as ferramentas que nasceram dos projetos, com o estado de cada uma |
| Ensino | material escrito, exercícios e vídeo, ligados à mesma conta |
| Sobre + Dúvidas | quem assina, a declaração de independência, a trajetória e o FAQ |

<img src="docs/img/home-caso.jpg" alt="Estudo de caso na home" />

<sub><b>Estudo de caso</b> — a única faixa escura da página, para o número ser a
coisa que o olho encontra primeiro. Norma citada ao lado de cada verificação
(ISO 3382-2, SPL a 4 kHz, IEC 60268-16), e a nota final dizendo que os valores
são ilustrativos.</sub>

Todo o texto vive em [`frontend/src/lib/content.js`](frontend/src/lib/content.js)
— arrays exportados que as páginas percorrem com `{#each}`. Nenhuma frase está
escrita dentro de um componente. É o que torna esta versão de demonstração
possível sem manter duas páginas: o arquivo é o mesmo do repositório privado,
com **cinco linhas** diferentes.

| Campo | Nesta versão |
| --- | --- |
| `empresa.razao`, `empresa.cnpj`, `empresa.fone` | valores neutros de exemplo |
| `empresa.selo` | vazio — a credencial de parceria é real e não entra aqui; o rodapé simplesmente não a desenha |
| `caso.nota` | declara que os números do estudo de caso são ilustrativos |

O acordeão de dúvidas é `<details>`/`<summary>` puro: abre sem JavaScript, o
sinal `+` → `−` é CSS, e a transição respeita `prefers-reduced-motion`.

## Arquitetura

```mermaid
flowchart TB
    subgraph nav["Navegador"]
        rotas["Rotas SvelteKit<br/>/ · /entrar · /orcamento<br/>/proposta · /conta · /admin"]
        disp["src/lib/api.js<br/><i>escolhe o backend</i>"]
        http["api-http.js<br/><i>fetch + cookie</i>"]
        demo["api-demo.js<br/><i>porte da API em JS</i>"]
        ss[("sessionStorage")]
    end

    subgraph srv["Servidor (produção)"]
        axum["Axum 0.7"]
        ext["Extratores<br/>Autenticado · Dono"]
        dom["triagem.rs · store.rs"]
        mem[("RwLock em memória")]
    end

    rotas --> disp
    disp -->|"VITE_API_BASE definida"| http
    disp -->|"sem VITE_API_BASE"| demo
    demo <--> ss
    http -->|"HTTPS, credentials: include"| axum
    axum --> ext --> dom --> mem
```

### Dois backends, um front

O front não sabe com quem está falando. `src/lib/api.js` escolhe entre duas
implementações da mesma superfície:

| | Quando | O que roda |
| --- | --- | --- |
| `api-http.js` | `VITE_API_BASE` definida | a API Axum de verdade, com cookie de sessão `HttpOnly` |
| `api-demo.js` | sem `VITE_API_BASE` | um porte da API em JavaScript, dentro do navegador |

Nenhuma página importa uma das duas diretamente, e as duas lançam o mesmo
`ErroApi` (de `api-erros.js`) — é o que faz `instanceof` continuar valendo e o
desvio para `/entrar` no 401 ser escrito uma vez só.

É isso que deixa a demonstração ser um site estático: nada para hospedar além
de arquivos, e ainda assim todas as telas funcionam — a triagem calcula faixa de
preço, o aceite gera contrato, a assinatura fecha a trilha de auditoria.

**O que o porte preserva:** as rotas, as formas de resposta, os códigos de erro,
o cálculo da triagem, a separação cliente/dono (rota de dono responde 404) e a
trilha append-only.
**O que ele não tem:** hash Argon2id, cookie assinado e persistência — o estado
vive em `sessionStorage` e some ao fechar a aba. **Qualquer** senha de 8
caracteres entra; `demo@exemplo.com` entra como dono. A tela de acesso diz isso
e traz um botão que preenche o acesso do dono.

A lógica que importa continua sendo a do Rust — é ela que roda em produção, e é
para ela que vale olhar.

### Topologia de publicação

```mermaid
flowchart LR
    dev["git push"] --> gh["GitHub<br/>main"]
    gh --> wb["Cloudflare<br/>Workers Builds"]
    wb -->|"npm run build<br/>npx wrangler deploy"| wk["Worker de assets<br/>garioli-labs-website-demo"]
    wk --> dom["demo.gariolilabs.com"]
    usr(["visitante"]) --> dom
```

Worker **só de assets**: sem `main`, sem bindings, porque não existe código de
servidor nesta build. O que existe é uma linha de configuração que não é
opcional:

```jsonc
// frontend/wrangler.jsonc
"assets": {
  "directory": "./build",
  "not_found_handling": "single-page-application"
}
```

O `adapter-static` emite um único `index.html` e o roteamento acontece no
cliente. Sem `single-page-application`, abrir `/admin` direto na barra de
endereços devolveria 404 — só a home funcionaria.

## O domínio: da triagem à assinatura

```mermaid
sequenceDiagram
    autonumber
    actor C as Cliente
    participant F as Front
    participant A as API
    actor D as Dono

    C->>F: responde 11 perguntas
    F->>A: POST /api/solicitacoes
    A-->>C: protocolo SOL-AAAA-NNNN
    Note over A: preço calculado no servidor,<br/>nunca devolvido ao cliente

    D->>A: POST /api/solicitacoes/:id/aprovar
    A-->>D: proposta PRJ-AAAA-NNNN

    C->>A: POST /api/propostas/:id/aceite
    A->>A: grava data, hora e IP · crítico

    C->>A: POST /api/propostas/:id/dados-contrato
    alt proposta não aceita
        A-->>C: 409 Conflict
    else aceita
        A-->>C: contrato CT-AAAA-NNNN
    end

    C->>A: POST /api/contratos/:id/assinatura
    A->>A: grava assinatura · crítico
```

### Estados de uma solicitação

```mermaid
stateDiagram-v2
    [*] --> Triagem: cliente envia
    Triagem --> Recusada: dono recusa
    Triagem --> Proposta: dono aprova
    Proposta --> Aceita: cliente aceita
    Aceita --> Contrato: dados do contratante
    Contrato --> Assinado: assinatura eletrônica
    Assinado --> [*]
    Recusada --> [*]

    note right of Aceita
        O aceite é pré-requisito do
        contrato: sem ele, 409.
    end note
```

### A regra de preço

Uma faixa por frente de trabalho, multiplicada pela área declarada. É a única
variável de dimensionamento, e é a única lógica do repositório com dinheiro
dentro — por isso é a única com teste.

| Frente | Faixa base |
| --- | ---: |
| Isolamento acústico | R$ 3.800 – 9.200 |
| Tratamento acústico | R$ 3.200 – 7.800 |
| Projeto de sonorização | R$ 2.800 – 6.500 |
| Projeto de projeção ou vídeo | R$ 2.200 – 5.000 |
| Projeto de iluminação | R$ 1.800 – 4.200 |
| Consultoria de compra | R$ 900 – 2.400 |
| _escopo indefinido_ (diagnóstico) | R$ 2.500 – 6.000 |

| Área declarada | Multiplicador |
| --- | ---: |
| até 120 m² | 1,0 |
| 120 a 300 m² | 1,2 |
| 300 a 600 m² | 1,5 |
| mais de 600 m² | 1,9 |

```rust
#[test]
fn area_maior_aumenta_a_faixa() {
    let pequena = frentes(&nova("Até 50 m²", vec!["Tratamento acústico"]));
    let grande = frentes(&nova("Mais de 600 m²", vec!["Tratamento acústico"]));
    assert!(grande[0].minimo_centavos > pequena[0].minimo_centavos);
}
```

Valores são `i64` em **centavos**, nunca ponto flutuante: dinheiro em `f64`
acumula erro de arredondamento a cada parcela.

Certas respostas levantam alerta em vez de preço — área "não sei" exige visita,
isolamento e tratamento pedidos juntos exigem confirmar obra civil, reclamação
de vizinhos exige checar a exigência municipal de ruído.

## Decisões de projeto

Cada uma destas está no código de propósito, e a consequência é o motivo.

<details open>
<summary><b>Nenhum preço vai ao cliente na triagem</b></summary>

A faixa é calculada no servidor e só aparece no painel do dono. O cliente vê
"solicitação recebida".
**Consequência:** você não fica preso a um número que um formulário calculou
antes de alguém olhar o espaço.
</details>

<details>
<summary><b>Rota de dono responde 404, não 403</b></summary>

O extrator `Dono` recusa com `NOT_FOUND`. Um 403 confirmaria que a rota existe
e que a conta simplesmente não tem permissão.
**Consequência:** quem não é dono não descobre o mapa do painel sondando URLs.
</details>

<details>
<summary><b>A trilha de auditoria não tem caminho de remoção</b></summary>

`Store::registrar` só insere; não existe `remover`. Aceite e assinatura gravam
IP e horário e são marcados como críticos.
**Consequência:** a trilha vale como prova porque nem o dono pode editá-la.
</details>

<details>
<summary><b>Contrato exige aceite</b></summary>

`POST /dados-contrato` devolve **409** se a proposta não foi aceita.
**Consequência:** não existe contrato que ninguém aceitou — a ordem dos eventos
é garantida pelo servidor, não pela ordem das telas.
</details>

<details>
<summary><b>O texto das cláusulas vive em <code>store.rs</code></b></summary>

Gerado a partir dos dados que o cliente informa; o mesmo texto serve a tela e
ao PDF.
**Consequência:** não há duas redações do contrato divergindo em silêncio.
</details>

<details>
<summary><b>Login não diz quais contas existem</b></summary>

Senha errada e e-mail inexistente devolvem a mesma mensagem e o mesmo 401.
`senha_confere` trata até hash corrompido como `false`, nunca como erro
distinto.
**Consequência:** o formulário não vira um oráculo de cadastro.
</details>

<details>
<summary><b>Nenhuma credencial padrão no repositório</b></summary>

Sem `GARIOLI_ADMIN_SENHA`, a senha do dono é sorteada a cada início e avisada
uma vez no log.
**Consequência:** erra-se para o lado de "ninguém entra" em vez de "todo mundo
sabe a senha".
</details>

<details>
<summary><b><code>Usuario</code> não deriva <code>Serialize</code></b></summary>

Existe um `UsuarioPublico` separado, e um `From<&Usuario>` para atravessar.
**Consequência:** o hash da senha não sai numa resposta por acidente — o
compilador impede, não a revisão de código.
</details>

<details>
<summary><b>A comparação de regimes é apoio à decisão, não parecer contábil</b></summary>

As alíquotas e o teto do MEI são de tabela; a receita é dado fictício, como o
resto do painel. A tela diz isso.
**Consequência:** a ferramenta ajuda a conversar com o contador, sem fingir
substituí-lo.
</details>

## Segurança

| Superfície | Como está tratada |
| --- | --- |
| Senha | Argon2id com sal por usuário (`argon2` 0.5); texto puro nunca guardado nem registrado |
| Sessão | cookie `gl_sessao` — `HttpOnly`, `SameSite=Lax`, `Path=/`, 12 h |
| `Secure` | ligado por `GARIOLI_COOKIE_SECURE`; **obrigatório em produção** |
| Autorização | por tipo, nos extratores `Autenticado` e `Dono` — não por `if` espalhado pelos handlers |
| Enumeração de contas | mesma resposta para senha errada e e-mail inexistente |
| Vazamento de hash | impedido pelo tipo (`Usuario` sem `Serialize`) |
| CORS | lista explícita em `GARIOLI_ORIGENS`, sem curinga |
| Auditoria | append-only, com IP e horário nos eventos críticos |

O que **não** está resolvido está em [Limites conhecidos](#limites-conhecidos).

## Estrutura

```
frontend/
  src/lib/design-system.css   design system Modernist (tokens + componentes), copiado íntegro
  src/lib/app.css             utilitários do projeto (.display, .kicker, .btn-solid…)
  src/lib/api.js              escolhe o backend: HTTP real ou demonstração
  src/lib/api-http.js         cliente da API Axum — um método por endpoint
  src/lib/api-demo.js         porte da API em JS, roda no navegador (build de portfólio)
  src/lib/api-erros.js        ErroApi e o desvio para /entrar, compartilhados pelos dois
  src/lib/content.js          todo o texto da home em arrays (serviços, processo, caso, entregas, software, ensino, sobre, dúvidas, rodapé)
  src/lib/Nav.svelte          barra de navegação com scroll-spy escrito direto no DOM
  src/lib/Footer.svelte       rodapé com dados da empresa e selo de parceria (omitido quando vazio)
  src/app.html                shell: fontes, ícones da aba, manifest
  src/routes/+page.svelte             /            site institucional (8 seções ancoradas)
  src/routes/entrar/+page.svelte      /entrar      acesso: entrar, criar conta, recuperar
  src/routes/orcamento/+page.svelte   /orcamento   triagem pública (11 passos)
  src/routes/conta/+page.svelte       /conta       conta única: projetos, cursos, licenças, documentos
  src/routes/proposta/+page.svelte    /proposta    aceite → dados → contrato → assinatura
  src/routes/admin/+page.svelte       /admin       painel do dono (8 visões)
  wrangler.jsonc              publicação como Worker de assets

backend/
  src/models.rs    tipos de domínio (serde) — solicitação, proposta, contrato, auditoria, usuário
  src/auth.rs      senha (Argon2id), cookie de sessão e os extratores Autenticado / Dono
  src/triagem.rs   questionário + regra de preço por frente e multiplicador de área + testes
  src/store.rs     estado em memória, trilha de auditoria append-only, texto das cláusulas
  src/main.rs      rotas Axum

.github/workflows/ci.yml      build, testes e clippy da API; build e dry-run do front
docs/img/                     capturas usadas neste README
```

### O que vale olhar primeiro

| Onde | Por quê |
| --- | --- |
| `backend/src/auth.rs` | dois extratores que fecham a API pelo tipo, não por `if` espalhado |
| `backend/src/triagem.rs` | regra de preço com teste garantindo que área maior nunca sai mais barata |
| `backend/src/store.rs` | trilha append-only e o texto das cláusulas gerado dos dados do cliente |
| `frontend/src/lib/api.js` | o dispatcher de três linhas que deixa a demonstração existir |
| `frontend/src/lib/content.js` | a home inteira como dado — quatro linhas separam esta versão da privada |
| `frontend/src/lib/Nav.svelte` | scroll-spy escrito direto no DOM, fora do caminho reativo |
| `frontend/src/routes/orcamento/` | triagem de 11 passos que não devolve preço ao cliente |

## Endpoints

Rotas marcadas **dono** respondem 404 — não 403 — para quem tem sessão mas não é
dono: a rota não se anuncia a quem não é dela.

| Método | Rota | Para quê |
| --- | --- | --- |
| GET | `/api/health` | sonda de saúde |
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
| POST | `/api/propostas/:id/dados-contrato` | dados do cliente → gera contrato (409 sem aceite) |
| GET | `/api/contratos/:id` | contrato gerado |
| POST | `/api/contratos/:id/assinatura` | assinatura eletrônica |
| GET | `/api/conta/me` | painel do cliente · **autenticado** |
| GET | `/api/admin/resumo` | KPIs, pipeline, financeiro, execução · **dono** |
| GET | `/api/admin/auditoria` | trilha imutável · **dono** |
| GET | `/api/admin/impostos` | MEI × Simples Anexo III × Anexo V · **dono** |

## Rodar localmente

Requisitos: Rust estável e Node 22+.

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
| `VITE_API_BASE` | base da API para o front | modo demonstração (backend no navegador) |

Em produção, `GARIOLI_COOKIE_SECURE` é obrigatório: sem ele o cookie de sessão
viaja em claro.

Para rodar o front **como a demonstração publicada**, basta não definir
`VITE_API_BASE` — nenhuma API precisa estar de pé.

## Testes e CI

```bash
cd backend && cargo test          # regra de preço e saídas da triagem
cd backend && cargo clippy --all-targets -- -D warnings
cd frontend && npm run build      # build de portfólio, sem VITE_API_BASE
```

O pipeline em [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda os
quatro passos em cada push e cada PR para `main`, e ainda valida a configuração
de publicação com `wrangler deploy --dry-run` — para que uma configuração
quebrada apareça no PR, não no deploy.

## Publicar

A build de portfólio é estática. Vai ao ar pelo **Cloudflare Workers Builds**,
ligado a este repositório: cada push em `main` reconstrói e republica.

| Campo do projeto | Valor |
| --- | --- |
| Nome do projeto | `garioli-labs-website-demo` |
| Diretório raiz | `frontend` |
| Comando da build | `npm run build` |
| Comando de implantação | `npx wrangler deploy` |
| Variáveis de ambiente | nenhuma — definir `VITE_API_BASE` tiraria o site do modo demonstração |

O nome do Worker em `wrangler.jsonc` precisa continuar batendo com o nome do
projeto; se divergir, um `wrangler deploy` manual cria um segundo Worker e o
domínio segue apontando para o primeiro.

Manualmente:

```bash
cd frontend
npm run build
npx wrangler deploy
```

## Limites conhecidos

Nada aqui é surpresa em produção — está listado porque falta mesmo.

1. **Persistência** — hoje é `RwLock` em memória; trocar por PostgreSQL (sqlx)
   não muda as rotas. Sessões e usuários vivem no mesmo `Store`, então a troca
   não muda a assinatura de nada.
2. **Recuperação de senha** — `/entrar` diz com todas as letras que o link
   automático não existe e manda escrever para o e-mail da empresa. Precisa de
   envio de e-mail para virar fluxo real.
3. **Assinatura eletrônica** — `assinar_contrato` marca a data localmente. A
   integração real (Gov.br ou Autentique) deve guardar o hash do documento
   devolvido pelo provedor.
4. **Geração de PDF** — `pdf_url` aponta para rota inexistente. Os PDFs atuais
   saem das páginas HTML deste projeto; para gerar pelo servidor, renderize as
   cláusulas com `typst` ou headless Chrome.
5. **Agente de dúvidas** — o campo de perguntas do portal responde com texto
   fixo. Plugue seu LLM.
6. **E-mail / WhatsApp** — nenhum envio real acontece.
7. **Rate limiting** — não há. Antes de expor a API de verdade, `/api/auth/*`
   precisa de limite por IP.
8. **Layout responsivo** — o desenho é feito para desktop. Só a faixa do estudo
   de caso e a barra de navegação têm tratamento abaixo de 1080 px; as demais
   grades ainda são de coluna fixa. Falta uma passada de mobile no site inteiro.

## Licença

Código aberto para leitura e avaliação. A marca, os textos institucionais e a
identidade visual da Garioli Labs não são de uso livre.
