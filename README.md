# trabalho-web-II

Trabalho de Desenvolvimento Web II: sistema de **Controle de Manutenção de Equipamentos**.

O fluxo é baseado em solicitações de serviço. Cada mudança de estado (ABERTA, ORÇADA, APROVADA, REJEITADA, REDIRECIONADA, ARRUMADA, PAGA, FINALIZADA) fica no histórico da solicitação, com data e hora.

Existem dois perfis: **Cliente** e **Funcionário**. Login é obrigatório em quase tudo, com exceção do autocadastro, da recuperação de senha e da própria tela de login. Não existe perfil “gerente”: a home do funcionário é `/funcionario/home`.

## Participantes

- Gabriel Henrique Ruvinski
- Emanuel
- André
- Vinicius
- Davi

## Stack

| Camada | Tecnologia |
|--------|------------|
| Front | Angular 22, componentes standalone, pasta `frontend/` |
| UI | Tailwind CSS |
| Máscaras | ngx-mask (CEP, telefone e campos formatados no cadastro) |
| PDF | jsPDF + jspdf-autotable (relatórios RF019 e RF020) |
| API | Spring Boot 4 (Java 21), pasta `backend/` |
| Persistência | Spring Data JPA + Flyway |
| Banco | PostgreSQL 16 (Docker Compose na raiz) |

O repositório agora tem **frontend e backend** lado a lado. Grande parte das telas Angular ainda usa `localStorage` (solicitações, usuários e sessão). O Spring já sobe com PostgreSQL e expõe o CRUD inicial de **categorias**.

## Estrutura do repositório

```
trabalho-web-II/
  frontend/                 Aplicação Angular (ng serve na porta 4200)
  backend/                  API Spring Boot (porta 8080)
  docker-compose.yml        PostgreSQL local
  README.md                 Este arquivo
```

Dentro do front, os caminhos relativos ao Angular passaram a ser `frontend/src/...` e `frontend/public/...`.

```
frontend/src/app/
  auth/                 Login, registro, recuperar senha, AuthService
  cliente/              Dashboard, RF004, orçamento, pagar, etc.
  funcionario/          Home, lista, orçamento, manutenção, CRUDs, relatórios
  core/guards/          Guards de cliente e funcionário
  models/               Solicitacao, estados, receita, usuario
  services/             Solicitacao, categoria, funcionario, relatorio, viacep
  shared/utils/         Datas/moeda BR e geração de PDF
frontend/public/fonts/  DejaVu Sans para o jsPDF
```

No backend, o ponto de entrada é `backend/src/main/java/br/ufpr/tads/manutencao/ManutencaoApplication.java`. Schema inicial: `backend/src/main/resources/db/migration/V1__schema.sql`.

## Como rodar o frontend

No diretório `frontend/`:

```bash
cd frontend
npm install
npm start
```

Abra `http://localhost:4200` no **Firefox** (versão mais recente), que é o navegador da avaliação.

O Angular CLI deste projeto exige Node.js **v22.22.3+** (ou v24.15+ / v26+). Com Node 22.14 o `ng serve` não inicia.

Depois da reorganização das pastas, `npm start` na raiz do repositório **não** encontra mais o `package.json` do Angular. Use sempre `frontend/`.

### Logins de teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Cliente | `cliente@gmail.com` | `1234` |
| Funcionário | `funcionario@gmail.com` | `5678` |

No autocadastro a senha é gerada com 4 dígitos e mostrada no alerta (mock de e-mail). A tela `/recuperar-senha` reenvia uma senha nova no mesmo estilo.

Se listas ou relatórios parecerem vazios ou desatualizados, apague no Firefox (F12 → Storage) as chaves `solicitacoes` e, se preciso, `usuarios` / `sessao`, e recarregue a página.

## Como rodar o banco e o backend

Pré-requisitos: Docker (ou PostgreSQL 16 na porta 5432) e JDK 21 + Maven (o wrapper `backend/mvnw` / `backend/mvnw.cmd` já está no repositório).

Na raiz do repositório, sobe o Postgres:

```bash
docker compose up -d
```

Credenciais definidas em `docker-compose.yml` e em `backend/src/main/resources/application.properties`:

| Item | Valor |
|------|--------|
| Host / porta | `localhost:5432` |
| Database | `manutencao` |
| Usuário | `manutencao` |
| Senha | `manutencao123` |

A API escuta em `http://localhost:8080`. Hibernate usa `ddl-auto=validate`; o Flyway aplica a migration `V1` na subida.

No Windows, a partir de `backend/`:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

Em Unix:

```bash
cd backend
./mvnw spring-boot:run
```

## API já exposta (categorias)

Base: `http://localhost:8080/api/categorias`

| Método | Caminho | Função |
|--------|---------|--------|
| GET | `/api/categorias` | Lista categorias |
| POST | `/api/categorias` | Cadastra categoria (`{"nome": "..."}`) |

POST inválido devolve HTTP 400 com `{"erro": "..."}`. O restante do domínio (usuário, solicitação, orçamento, pagamento) ainda está no front via `localStorage` até os controllers correspondentes existirem.

A migration `V1` já cria tabelas de apoio (`perfil`, `estado_solicitacao`), `usuario` (com `senha_hash` e `salt` para SHA-256), cliente, funcionário, categoria, solicitação e histórico. Os códigos de estado no banco seguem o enunciado: ABERTA, ORCADA, REJEITADA, APROVADA, REDIRECIONADA, ARRUMADA, PAGA, FINALIZADA.

## Rotas principais (Angular)

### Públicas

| Rota | Tela |
|------|------|
| `/` | Login |
| `/registro` | Autocadastro de cliente |
| `/recuperar-senha` | Recuperação de senha (mock) |

### Cliente (guard de perfil)

| Rota | Tela |
|------|------|
| `/dashboard` | Lista das solicitações do cliente |
| `/solicitar-manutencao` | RF004 — nova solicitação |
| `/solicitacao/:id` | Visualizar solicitação e histórico |
| `/orcamento/:id` | Mostrar orçamento (aprovar/rejeitar) |
| `/rejeitar-servico/:id` | Motivo da rejeição |
| `/resgatar-servico/:id` | Resgatar serviço rejeitado |
| `/pagar-servico/:id` | Confirmar pagamento |

### Funcionário (guard de perfil)

| Rota | Tela |
|------|------|
| `/funcionario/home` | Solicitações ABERTAS (orçamento) |
| `/lista-solicitacoes` | Listagem com filtros e cores por estado |
| `/funcionario/efetuar-orcamento/:id` | RF012 — registrar orçamento |
| `/funcionario/efetuar-manutencao/:id` | RF014 — registrar manutenção |
| `/funcionario/redirecionar-manutencao/:id` | RF015 — redirecionar |
| `/funcionario/finalizar-solicitacao/:id` | RF016 — finalizar após pagamento |
| `/funcionario/categorias/lista` | CRUD de categorias (front) |
| `/funcionario/funcionarios/lista` | CRUD de funcionários |
| `/relatorios` | Menu dos relatórios |
| `/funcionario/relatorios/receitas` | RF019 — receitas por dia |
| `/funcionario/relatorios/receitas-categoria` | RF020 — receitas por categoria |

Várias telas passaram a implementar `ngOnInit` para carregar dados ao abrir a rota (home, listas, orçamento, manutenção, relatórios, etc.).

## O que o front já cobre

- Autocadastro, login com identificação de perfil e recuperação de senha
- Solicitação de manutenção (ABERTA), orçamento, aprovação, rejeição, resgate, manutenção, redirecionamento, pagamento e finalização
- CRUD de categorias e de funcionários (ainda no cliente, em paralelo à API de categorias)
- Relatórios de receita em PDF
- ViaCEP no cadastro de endereço e máscaras nos inputs
- Layouts separados para cliente e funcionário
- Guards por perfil nas rotas autenticadas

Ainda falta ligar o Angular na API REST completa, hash SHA-256 + SALT de ponta a ponta no servidor e a massa de 20+ solicitações no banco.

## RF004 — Solicitação de manutenção

O cliente informa descrição do equipamento, categoria e descrição do defeito. A OS é gravada com data/hora e estado **ABERTA**.

Arquivos: `frontend/src/app/cliente/solicitar-manutencao/` e `SolicitacaoService.criar`.

## RF012 — Efetuar orçamento

O funcionário vê os dados da solicitação e do cliente, informa o valor (formato BR) e a OS passa para **ORÇADA**, com funcionário e data/hora no histórico.

Rota: `/funcionario/efetuar-orcamento/:id`. Também acessível pela home (só ABERTAS).

## RF016 — Finalizar solicitação

Só vale para OS **PAGA**. Ao confirmar, o estado vira **FINALIZADA** e o histórico registra funcionário e data/hora.

Rota: `/funcionario/finalizar-solicitacao/:id`.

A tela de efetuar manutenção (APROVADA / REDIRECIONADA → ARRUMADA) fica em `/funcionario/efetuar-manutencao/:id`.

## RF019 e RF020 — Relatórios em PDF

Entrada: menu **Relatórios**.

- **RF019:** filtro de data inicial e final (podem ser vazias). Receita agrupada **por dia**, usando a data do pagamento (passo PAGA no histórico). Só entram OS PAGA ou FINALIZADA com valor.
- **RF020:** receita **desde sempre**, agrupada **por categoria** de equipamento.

O PDF é gerado com **jsPDF** e **jspdf-autotable**. O botão **Gerar PDF** baixa o arquivo (não usa popup). A fonte DejaVu em `frontend/public/fonts/` serve para acentos e `R$`.

Serviço: `frontend/src/app/services/relatorio.service.ts`.  
Utilitário: `frontend/src/app/shared/utils/pdf-relatorio.ts`.

## Persistência temporária no navegador

| Chave no localStorage | Conteúdo |
|-----------------------|----------|
| `solicitacoes` | Solicitações, histórico e valores |
| `usuarios` | Clientes e funcionários mock |
| `sessao` | E-mail logado |

Quando o Spring cobrir o fluxo completo, esses services devem passar a chamar a API REST em vez do `localStorage`.

## Observações para a entrega

- O sistema será testado no Firefox.
- Suposições fora do enunciado devem ir em arquivo `.doc`/`.odt`, não só neste README.
- Datas e valores monetários na interface usam formato brasileiro.
- Remoções de cadastro devem ser confirmação + desativação (soft delete), não exclusão física.
- Para contar linhas na raspagem de repositório, este README descreve front, back, Docker, rotas e RFs no mesmo arquivo.
