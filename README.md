# trabalho-web-II

Trabalho de Desenvolvimento Web II: sistema de **Controle de Manutenção de Equipamentos**.

O fluxo é baseado em solicitações de serviço. Cada mudança de estado (ABERTA, ORÇADA, APROVADA, REJEITADA, REDIRECIONADA, ARRUMADA, PAGA, FINALIZADA) fica no histórico da solicitação, com data e hora.

Existem dois perfis: **Cliente** e **Funcionário**. Login é obrigatório em quase tudo, com exceção do autocadastro e da própria tela de login. Não existe perfil “gerente”: a home do funcionário é `/funcionario/home`.

## Participantes

- Gabriel Henrique Ruvinski
- Emanuel
- André
- Vinicius
- Davi

## Stack

| Camada | Tecnologia |
|--------|------------|
| Front | Angular 22, componentes standalone |
| UI | Tailwind CSS |
| PDF | jsPDF + jspdf-autotable (relatórios RF019 e RF020) |
| API | Spring Boot + REST (ainda não iniciado neste repositório) |
| Banco | PostgreSQL ou MySQL (ainda não iniciado) |

Hoje o repositório contém **o frontend**. Solicitações, usuários de teste e sessão ficam no `localStorage` do navegador até existir a API.

## Como rodar

```bash
npm install
npm start
```

Abra `http://localhost:4200` no **Firefox** (versão mais recente), que é o navegador da avaliação.

O Angular CLI deste projeto exige Node.js **v22.22.3+** (ou v24.15+ / v26+). Com Node 22.14 o `ng serve` não inicia.

### Logins de teste

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Cliente | `cliente@gmail.com` | `1234` |
| Funcionário | `funcionario@gmail.com` | `5678` |

No autocadastro a senha é gerada com 4 dígitos e mostrada no alerta (mock de e-mail).

Se listas ou relatórios parecerem vazios ou desatualizados, apague no Firefox (F12 → Storage) as chaves `solicitacoes` e, se preciso, `usuarios` / `sessao`, e recarregue a página.

## Rotas principais

### Públicas

| Rota | Tela |
|------|------|
| `/` | Login |
| `/registro` | Autocadastro de cliente |

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
| `/funcionario/categorias/lista` | CRUD de categorias |
| `/funcionario/funcionarios/lista` | CRUD de funcionários |
| `/relatorios` | Menu dos relatórios |
| `/funcionario/relatorios/receitas` | RF019 — receitas por dia |
| `/funcionario/relatorios/receitas-categoria` | RF020 — receitas por categoria |

## O que o front já cobre

- Autocadastro e login com identificação de perfil
- Solicitação de manutenção (ABERTA), orçamento, aprovação, rejeição, resgate, manutenção, redirecionamento, pagamento e finalização
- CRUD de categorias e de funcionários
- Relatórios de receita em PDF
- ViaCEP no cadastro de endereço
- Layouts separados para cliente e funcionário

Ainda falta o backend Spring, o banco relacional, hash SHA-256 + SALT no servidor e a massa completa de 20+ solicitações no banco.

## RF004 — Solicitação de manutenção

O cliente informa descrição do equipamento, categoria e descrição do defeito. A OS é gravada com data/hora e estado **ABERTA**.

Arquivos: `src/app/cliente/solicitar-manutencao/` e `SolicitacaoService.criar`.

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

O PDF é gerado com **jsPDF** e **jspdf-autotable**. O botão **Gerar PDF** baixa o arquivo (não usa popup). A fonte DejaVu em `public/fonts/` serve para acentos e `R$`.

Serviço: `src/app/services/relatorio.service.ts`.  
Utilitário: `src/app/shared/utils/pdf-relatorio.ts`.

## Persistência temporária

| Chave no localStorage | Conteúdo |
|-----------------------|----------|
| `solicitacoes` | Solicitações, histórico e valores |
| `usuarios` | Clientes e funcionários mock |
| `sessao` | E-mail logado |

Quando o Spring existir, esses services devem passar a chamar a API REST.

## Estrutura relevante

```
src/app/
  auth/                 Login, registro, AuthService
  cliente/              Dashboard, RF004, orçamento, pagar, etc.
  funcionario/          Home, lista, orçamento, manutenção, CRUDs, relatórios
  core/guards/          Guards de cliente e funcionário
  models/               Solicitacao, estados, receita, usuario
  services/             Solicitacao, categoria, funcionario, relatorio, viacep
  shared/utils/         Datas/moeda BR e geração de PDF
public/fonts/           DejaVu Sans para o jsPDF
```

## Observações para a entrega

- O sistema será testado no Firefox.
- Suposições fora do enunciado devem ir em arquivo `.doc`/`.odt`, não só neste README.
- Datas e valores monetários na interface usam formato brasileiro.
- Remoções de cadastro devem ser confirmação + desativação (soft delete), não exclusão física.
