import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Registro } from './auth/registro/registro';
import { LayoutCliente } from './cliente/layout/layout';
import { Dashboard } from './cliente/dashboard/dashboard';
import { SolicitarManutencao } from './cliente/solicitar-manutencao/solicitar-manutencao';
import { VisualizarSolicitacao } from './cliente/visualizar-solicitacao/visualizar-solicitacao';
import { MostrarOrcamento } from './cliente/mostrar-orcamento/mostrar-orcamento';
import { RejeitarServico } from './cliente/rejeitar-servico/rejeitar-servico';
import { PagarServico } from './cliente/pagar-servico/pagar-servico';
import { ResgatarServico } from './cliente/resgatar-servico/resgatar-servico';
import { LayoutFuncionario } from './funcionario/layout/layout';
import { Home } from './funcionario/home/home';
import { ListaSolicitacoes } from './funcionario/lista-solicitacoes/lista-solicitacoes';
import { EfetuarManutencao } from './funcionario/efetuar-manutencao/efetuar-manutencao';
import { EfetuarOrcamento } from './funcionario/efetuar-orcamento/efetuar-orcamento';
import { FinalizarSolicitacao } from './funcionario/finalizar-solicitacao/finalizar-solicitacao';
import { Form } from './funcionario/categorias/form/form';
import { Lista } from './funcionario/categorias/lista/lista';
import { Form as FuncionarioForm } from './funcionario/funcionarios/form/form';
import { Lista as FuncionarioLista } from './funcionario/funcionarios/lista/lista';
import { Relatorios } from './funcionario/relatorios/relatorios';
import { Receitas } from './funcionario/relatorios/receitas/receitas';
import { ReceitasCategoria } from './funcionario/relatorios/receitas-categoria/receitas-categoria';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'registro', component: Registro },
  {
    path: '',
    component: LayoutCliente,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'solicitar-manutencao', component: SolicitarManutencao },
      { path: 'solicitacao/:id', component: VisualizarSolicitacao },
      { path: 'orcamento/:id', component: MostrarOrcamento },
      { path: 'rejeitar-servico/:id', component: RejeitarServico },
      { path: 'pagar-servico/:id', component: PagarServico },
      { path: 'resgatar-servico/:id', component: ResgatarServico },
    ],
  },
  {
    path: '',
    component: LayoutFuncionario,
    children: [
      { path: 'funcionario/home', component: Home },
      { path: 'lista-solicitacoes', component: ListaSolicitacoes },
      { path: 'funcionario/efetuar-orcamento/:id', component: EfetuarOrcamento },
      { path: 'funcionario/efetuar-manutencao/:id', component: EfetuarManutencao },
      { path: 'funcionario/finalizar-solicitacao/:id', component: FinalizarSolicitacao },
      { path: 'funcionario/categorias/lista', component: Lista },
      { path: 'funcionario/categorias/form', component: Form },
      { path: 'funcionario/funcionarios/lista', component: FuncionarioLista },
      { path: 'funcionario/funcionarios/form', component: FuncionarioForm },
      { path: 'relatorios', component: Relatorios },
      { path: 'funcionario/relatorios/receitas', component: Receitas },
      { path: 'funcionario/relatorios/receitas-categoria', component: ReceitasCategoria },
    ],
  },
];