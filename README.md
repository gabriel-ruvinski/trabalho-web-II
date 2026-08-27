# trabalho-web-II

Trabalho de Desenvolvimento Web II: sistema de **Controle de Manutenção de Equipamentos**.

O fluxo é baseado em solicitações de serviço, com histórico de mudança de estado. Há dois perfis (Cliente e Funcionário). Login é obrigatório em quase tudo, com exceção do autocadastro e da própria tela de login.

## Participantes

- Gabriel
- Emanuel
- André
- Vinicius
- Davi

## Stack prevista

| Camada | Tecnologia |
|--------|------------|
| Front | Angular 22, componentes **standalone** |
| UI | CSS próprio + Tailwind configurado |
| API | Spring Boot + REST (ainda não iniciado) |
| Banco | PostgreSQL ou MySQL (ainda não iniciado) |

Hoje o repositório contém **somente o frontend**. Dados de solicitação ficam no `localStorage` do navegador até existir a API.

## Como rodar

```bash
npm install
ng serve
```

Abra o endereço indicado pelo CLI (em geral `http://localhost:4200`).

O Angular CLI deste projeto exige Node.js **v22.22.3+** (ou v24.15+ / v26+). Com Node **22.14** o `ng serve` e o `ng test` **não iniciam**.

Login mock atual (ainda não é o fluxo do enunciado):

- e-mail: `teste@gmail.com`
- senha: `1234`

## Rotas

| Rota | Tela |
|------|------|
| `/` | Login |
| `/registro` | Registro / autocadastro (incompleto) |
| `/dashboard` | Página inicial do cliente (lista de solicitações) |
| `/solicitar-manutencao` | RF004 — nova solicitação de manutenção |

Ainda **não** há rotas de funcionário, orçamento, pagamento, CRUDs nem relatórios.

## O que já está no front

### Login e registro

- Telas visuais de login e registro.
- Login usa um `AuthService` em memória (credencial fixa). O HTML do login ainda não está ligado de forma confiável ao formulário reativo.
- Registro pede nome, sobrenome, e-mail e senha. **Falta** CPF, telefone, endereço, ViaCEP, senha aleatória de 4 dígitos e envio por e-mail (RF001).
- Não há identificação de perfil (cliente vs funcionário) nem guards de rota (RF002).

### Dashboard do cliente

- Layout com menu lateral e tabela de solicitações.
- A lista deixa de ser HTML fixo: mostra o que foi gravado pelo RF004.
- Colunas: data/hora, descrição do equipamento (até 30 caracteres) e estado.
- Ações por estado (aprovar, rejeitar, resgatar, pagar, visualizar) **ainda não existem** (RF003 / RF005–RF010).

### RF004 — Solicitação de manutenção

O cliente registra uma solicitação com:

1. Descrição do equipamento
2. Categoria do equipamento
3. Descrição do defeito

A solicitação é armazenada com **data/hora** e estado **ABERTA** (pronta para a empresa orçar).

Como usar:

1. Ir ao dashboard
2. Clicar em **Solicitar Manutenção** ou **Novo Chamado**
3. Preencher o formulário e registrar

Detalhes de implementação:

- Rota: `/solicitar-manutencao`
- Validação no front (campos obrigatórios)
- Categorias iniciais: Notebook, Desktop, Impressora, Mouse, Teclado
- Persistência temporária em `localStorage` (`solicitacoes`)
- Histórico inicial com o passo ABERTA
- Após gravar, redireciona para o dashboard

Essa entrega **não foi testada no Firefox** nesta máquina por causa da versão do Node.

## Estrutura relevante

```
src/app/
  auth/login/                 Login
  auth/registro/              Registro
  auth/dashboard/             Home do cliente
  auth/services/auth.service.ts
  cliente/solicitar-manutencao/   RF004
  models/                     Solicitação, categoria, estados
  services/                   CategoriaService, SolicitacaoService
```

## O que ainda falta (visão geral)

**Cliente:** orçamento (aprovar/rejeitar), visualizar com histórico, resgatar, pagar.

**Funcionário:** home com ABERTAS, efetuar orçamento, listagem com filtros e cores, manutenção, redirecionamento, finalizar, CRUD de categorias e de funcionários, relatórios em PDF.

**Não-funcionais ainda sem:** Spring + REST integrado, banco 3FN, ViaCEP, SHA-256 + SALT, máscaras (CPF, CEP, telefone, moeda), datas/valores no formato BR com calendário, exclusão lógica com confirmação, seed (Maria, Mário, 4 clientes, 5 categorias, 20+ solicitações).

**Mínimo para defesa ainda incompleto:** RF001, RF002, RF003, RF004 (front local, sem API), RF005, RF006, RF011, RF012, RF017, RF018.

## Observações

- Qualquer suposição fora do enunciado deve ir para o `.doc`/`.odt` da entrega, não para este README.
- A tela será avaliada no **Firefox** (versão mais recente).
- Quando o backend existir, o `SolicitacaoService` deve passar a chamar a API REST em vez do `localStorage`.
