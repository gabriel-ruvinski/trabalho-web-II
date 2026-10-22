# trabalho-web-II

Trabalho de Desenvolvimento Web II: sistema de **Controle de Manutenção de Equipamentos**.

O fluxo é baseado em solicitações de serviço. Cada mudança de estado (ABERTA, ORÇADA, APROVADA, REJEITADA, REDIRECIONADA, ARRUMADA, PAGA, FINALIZADA) fica no histórico da solicitação, com data e hora.

Existem dois perfis: **Cliente** e **Funcionário**. Login é obrigatório em quase tudo, com exceção do autocadastro, da recuperação de senha e da própria tela de login. Não existe perfil "gerente": a home do funcionário é `/funcionario/home`.

## Participantes

* Gabriel Henrique Ruvinski
* Emanuel
* André
* Vinicius
* Davi

## Stack

| Camada | Tecnologia |
|--------|------------|
| Front | Angular 22, componentes standalone, pasta `frontend/` |
| UI | Tailwind CSS |
| Máscaras | ngx-mask (CEP, telefone e campos formatados no cadastro) |
| PDF | jsPDF + jspdf-autotable (relatórios RF019 e RF020) |
| API | Spring Boot 4 (Java 21 ou superior, testado com JDK 25), pasta `backend/` |
| Persistência | Spring Data JPA + Flyway |
| Banco | PostgreSQL 16 (Docker Compose na raiz) |
| Documentação da API | springdoc OpenAPI (Swagger UI) |
| E-mail | Spring Mail (senha temporária enviada no cadastro) |
| Testes | JUnit 5 + MockMvc (testes de integração) |

O repositório tem **frontend e backend** lado a lado. O Spring sobe com PostgreSQL, expõe autenticação (cadastro e login), categorias e o fluxo de solicitações, e padroniza os erros da API. Grande parte das telas Angular ainda usa `localStorage` (solicitações, usuários e sessão) até a integração com a API.

## Estrutura do repositório

```
trabalho-web-II/
  frontend/                 Aplicação Angular (ng serve na porta 4200)
  backend/                  API Spring Boot (porta 8080)
  docker-compose.yml        PostgreSQL local
  README.md                 Este arquivo
```

Dentro do front, os caminhos relativos ao Angular são `frontend/src/...` e `frontend/public/...`.

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

No backend, o ponto de entrada é `backend/src/main/java/br/ufpr/tads/manutencao/ManutencaoApplication.java`.

```
backend/src/main/java/br/ufpr/tads/
  auth/                 Cadastro, login, envio de senha temporária
  categoria/            CRUD de categorias
  solicitacao/          Fluxo de estados da solicitação
  config/               CorsConfig e OpenApiConfig
  exception/            GlobalExceptionHandler e ApiError
backend/src/main/resources/db/migration/
  V1__schema.sql                Schema inicial
  V2__categoria_iniciais.sql    Categorias iniciais
backend/src/test/java/          Testes de integração
```

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

Valem apenas para o front com `localStorage`.

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Cliente | `cliente@gmail.com` | `1234` |
| Funcionário | `funcionario@gmail.com` | `5678` |

No autocadastro do front a senha é gerada com 4 dígitos e mostrada no alerta (mock de e-mail). A tela `/recuperar-senha` reenvia uma senha nova no mesmo estilo.

Se listas ou relatórios parecerem vazios ou desatualizados, apague no Firefox (F12, aba Storage) as chaves `solicitacoes` e, se preciso, `usuarios` e `sessao`, e recarregue a página.

## Como rodar o banco e o backend

Pré-requisitos: JDK 21 ou superior (testado com JDK 25), Docker com Docker Compose e Git. O wrapper `backend/mvnw` já está no repositório, então não é preciso instalar o Maven.

### 1. Subir o PostgreSQL

Na raiz do repositório:

```bash
docker compose up -d
docker ps
```

O container `manutencao-db` deve aparecer com status Up. Credenciais definidas em `docker-compose.yml` e em `backend/src/main/resources/application.properties`:

| Item | Valor |
|------|--------|
| Host / porta | `localhost:5432` |
| Database | `manutencao` |
| Usuário | `manutencao` |
| Senha | `manutencao123` |

### 2. Configurar o envio de e-mail

No cadastro de cliente, o backend gera uma senha temporária e a envia por e-mail. Por isso as variáveis abaixo precisam existir no terminal antes de iniciar a aplicação:

```bash
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=seu_email@gmail.com
export MAIL_PASSWORD=senha_de_app_do_gmail
```

O Gmail exige uma senha de app de 16 caracteres, gerada em Conta Google, Segurança, Verificação em duas etapas, Senhas de app. A senha normal da conta é recusada. Nunca coloque essa senha em arquivos versionados.

Para desenvolvimento sem Gmail, suba um servidor SMTP de teste (Mailpit), que captura os e-mails:

```bash
docker run -d --name mailpit -p 1025:1025 -p 8025:8025 axllent/mailpit
```

Com ele ativo, use `MAIL_HOST=localhost` e `MAIL_PORT=1025`, deixe usuário e senha vazios e leia os e-mails em `http://localhost:8025`.

### 3. Iniciar o backend

Em Linux ou macOS, a partir de `backend/`:

```bash
cd backend
./mvnw spring-boot:run
```

No Windows:

```bash
cd backend
.\mvnw.cmd spring-boot:run
```

A API escuta em `http://localhost:8080`. O Hibernate usa `ddl-auto=validate` e o Flyway aplica as migrations automaticamente na inicialização: `V1__schema.sql` (tabelas e dados de apoio) e `V2__categoria_iniciais.sql` (categorias iniciais). Nomes de migration precisam seguir o padrão `V<número>__<descrição>.sql`, com V maiúsculo e dois underscores, senão o Flyway ignora o arquivo.

A migration `V1` cria as tabelas de apoio (`perfil`, `estado_solicitacao`), `usuario` (com `senha_hash` e `salt` para SHA-256), cliente, funcionário, categoria, solicitação e histórico. Os códigos de estado no banco seguem o enunciado: ABERTA, ORCADA, REJEITADA, APROVADA, REDIRECIONADA, ARRUMADA, PAGA, FINALIZADA.

## API exposta

Base: `http://localhost:8080`. A documentação interativa fica em `http://localhost:8080/swagger-ui.html`.

### Autenticação

| Método | Caminho | Função |
|--------|---------|--------|
| POST | `/api/auth/cadastro` | Cadastra cliente e envia senha temporária por e-mail (retorna 201 sem corpo) |
| POST | `/api/auth/login` | Autentica com `email` e `senha` (retorna id, nome, email e perfil) |

Campos do cadastro: `nome`, `email`, `cpf` (11 dígitos), `telefone` (10 ou 11 dígitos), `cep` (8 dígitos), `logradouro`, `numero`, `complemento` (opcional), `bairro`, `cidade` e `uf` (2 letras). CPF, telefone e CEP vão apenas com dígitos.

### Categorias

| Método | Caminho | Função |
|--------|---------|--------|
| GET | `/api/categorias` | Lista categorias |
| POST | `/api/categorias` | Cadastra categoria (`{"nome": "..."}`) |

### Fluxo de solicitações

Todas as rotas abaixo são POST e usam o `id` da solicitação.

| Caminho | Função |
|---------|--------|
| `/api/solicitacoes/{id}/orcamento` | Registrar orçamento (RF012) |
| `/api/solicitacoes/{id}/aprovar-orcamento` | Cliente aprova o orçamento |
| `/api/solicitacoes/{id}/rejeitar-orcamento` | Cliente rejeita o orçamento |
| `/api/solicitacoes/{id}/resgatar` | Cliente resgata serviço rejeitado |
| `/api/solicitacoes/{id}/manutencao` | Registrar manutenção (RF014) |
| `/api/solicitacoes/{id}/redirecionar` | Redirecionar manutenção (RF015) |
| `/api/solicitacoes/{id}/pagamento` | Registrar pagamento |
| `/api/solicitacoes/{id}/finalizar` | Finalizar solicitação (RF016) |

O restante do domínio (criação e listagem de solicitações, orçamento e pagamento completos) ainda está no front via `localStorage` até os controllers correspondentes existirem.

## Padrão de erros da API

Todos os erros saem no mesmo formato, definido em `GlobalExceptionHandler` e `ApiError`:

```json
{
  "timestamp": "2026-10-22T20:53:25.639Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Dados inválidos.",
  "path": "/api/auth/cadastro",
  "campos": [
    { "campo": "cpf", "mensagem": "CPF deve conter 11 dígitos" }
  ]
}
```

| Status | Quando acontece |
|--------|-----------------|
| 400 | Falha de validação dos DTOs (o array `campos` lista cada campo inválido) ou corpo JSON malformado |
| 401 | Credenciais inválidas no login |
| 404 | Rota ou recurso inexistente |
| 409 | Violação de integridade no banco (dado duplicado, por exemplo) |
| 500 | Erro inesperado (o detalhe fica só no log do servidor, sem stack trace na resposta) |

Os DTOs usam Bean Validation (`@Valid`, `@NotBlank`, `@Email`, `@Size`, `@Pattern`).

## CORS

A classe `config/CorsConfig.java` libera `http://localhost:4200` para as rotas `/api/**` com os métodos GET, POST, PUT, PATCH, DELETE e OPTIONS. Para outra origem, altere `allowedOrigins`.

## Testes de integração

```bash
cd backend
./mvnw test
```

Os testes sobem a aplicação inteira, então o PostgreSQL precisa estar rodando (`docker compose up -d`) e as variáveis de e-mail definidas. Eles verificam validação de DTOs, corpo malformado, rota inexistente, login inválido e CORS para o Angular.

## Problemas comuns

| Sintoma | Causa e solução |
|---------|-----------------|
| `Connection to localhost:5432 refused` | O banco não está rodando. Execute `docker compose up -d`. |
| `Could not resolve placeholder 'MAIL_HOST'` | As variáveis de e-mail não foram definidas no terminal atual. |
| `Authentication failed` no cadastro (HTTP 500) | O Gmail recusou o login. Use senha de app ou o Mailpit. |
| Erro de CORS no console do navegador | O front precisa rodar em `http://localhost:4200`, ou a origem deve ser ajustada em `CorsConfig`. |
| Aviso do Flyway sobre migration ignorada | O arquivo não segue o padrão `V<número>__<descrição>.sql`. |
| Porta 5432 ocupada | Há outro PostgreSQL local. Pare com `sudo systemctl stop postgresql`. |
| Docker sem permissão (Fedora e outras distros) | Adicione o usuário ao grupo docker: `sudo usermod -aG docker $USER` e faça logout e login. |

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
| `/solicitar-manutencao` | RF004: nova solicitação |
| `/solicitacao/:id` | Visualizar solicitação e histórico |
| `/orcamento/:id` | Mostrar orçamento (aprovar ou rejeitar) |
| `/rejeitar-servico/:id` | Motivo da rejeição |
| `/resgatar-servico/:id` | Resgatar serviço rejeitado |
| `/pagar-servico/:id` | Confirmar pagamento |

### Funcionário (guard de perfil)

| Rota | Tela |
|------|------|
| `/funcionario/home` | Solicitações ABERTAS (orçamento) |
| `/lista-solicitacoes` | Listagem com filtros e cores por estado |
| `/funcionario/efetuar-orcamento/:id` | RF012: registrar orçamento |
| `/funcionario/efetuar-manutencao/:id` | RF014: registrar manutenção |
| `/funcionario/redirecionar-manutencao/:id` | RF015: redirecionar |
| `/funcionario/finalizar-solicitacao/:id` | RF016: finalizar após pagamento |
| `/funcionario/categorias/lista` | CRUD de categorias (front) |
| `/funcionario/funcionarios/lista` | CRUD de funcionários |
| `/relatorios` | Menu dos relatórios |
| `/funcionario/relatorios/receitas` | RF019: receitas por dia |
| `/funcionario/relatorios/receitas-categoria` | RF020: receitas por categoria |

Várias telas implementam `ngOnInit` para carregar dados ao abrir a rota (home, listas, orçamento, manutenção, relatórios, etc.).

## O que o front já cobre

* Autocadastro, login com identificação de perfil e recuperação de senha
* Solicitação de manutenção (ABERTA), orçamento, aprovação, rejeição, resgate, manutenção, redirecionamento, pagamento e finalização
* CRUD de categorias e de funcionários (ainda no cliente, em paralelo à API de categorias)
* Relatórios de receita em PDF
* ViaCEP no cadastro de endereço e máscaras nos inputs
* Layouts separados para cliente e funcionário
* Guards por perfil nas rotas autenticadas

Ainda falta ligar o Angular na API REST completa, hash SHA-256 + SALT de ponta a ponta no servidor e a massa de 20 ou mais solicitações no banco.

## RF004: Solicitação de manutenção

O cliente informa descrição do equipamento, categoria e descrição do defeito. A OS é gravada com data e hora e estado **ABERTA**.

Arquivos: `frontend/src/app/cliente/solicitar-manutencao/` e `SolicitacaoService.criar`.

## RF012: Efetuar orçamento

O funcionário vê os dados da solicitação e do cliente, informa o valor (formato BR) e a OS passa para **ORÇADA**, com funcionário e data e hora no histórico.

Rota: `/funcionario/efetuar-orcamento/:id`. Também acessível pela home (só ABERTAS).

## RF016: Finalizar solicitação

Só vale para OS **PAGA**. Ao confirmar, o estado vira **FINALIZADA** e o histórico registra funcionário e data e hora.

Rota: `/funcionario/finalizar-solicitacao/:id`.

A tela de efetuar manutenção (APROVADA ou REDIRECIONADA para ARRUMADA) fica em `/funcionario/efetuar-manutencao/:id`.

## RF019 e RF020: Relatórios em PDF

Entrada: menu **Relatórios**.

* **RF019:** filtro de data inicial e final (podem ser vazias). Receita agrupada **por dia**, usando a data do pagamento (passo PAGA no histórico). Só entram OS PAGA ou FINALIZADA com valor.
* **RF020:** receita **desde sempre**, agrupada **por categoria** de equipamento.

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

* O sistema será testado no Firefox.
* Suposições fora do enunciado devem ir em arquivo `.doc` ou `.odt`, não só neste README.
* Datas e valores monetários na interface usam formato brasileiro.
* Remoções de cadastro devem ser confirmação + desativação (soft delete), não exclusão física.
* Para contar linhas na raspagem de repositório, este README descreve front, back, Docker, rotas e RFs no mesmo arquivo.