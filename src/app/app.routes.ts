import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Registro } from './auth/registro/registro';
import { Dashboard } from './cliente/dashboard/dashboard';
import { SolicitarManutencao } from './cliente/solicitar-manutencao/solicitar-manutencao';
import { Home } from './funcionario/home/home';
import { ListaSolicitacoes } from './funcionario/lista-solicitacoes/lista-solicitacoes';
import { EfetuarManutencao } from './funcionario/efetuar-manutencao/efetuar-manutencao';
import { EfetuarOrcamento } from './funcionario/efetuar-orcamento/efetuar-orcamento';
import { FinalizarSolicitacao } from './funcionario/finalizar-solicitacao/finalizar-solicitacao';
import { VisualizarSolicitacao } from './cliente/visualizar-solicitacao/visualizar-solicitacao';
import{ MostrarOrcamento } from './cliente/mostrar-orcamento/mostrar-orcamento';
import {RejeitarServico} from './cliente/rejeitar-servico/rejeitar-servico';
export const routes: Routes = [
  { path: '', component: Login },
  { path: 'registro', component: Registro },
  { path: 'dashboard', component: Dashboard },
  { path: 'solicitar-manutencao', component: SolicitarManutencao },
  { path: 'funcionario/home', component: Home },
  { path: 'lista-solicitacoes', component: ListaSolicitacoes },
  { path: 'funcionario/efetuar-orcamento/:id', component: EfetuarOrcamento },
  { path: 'funcionario/efetuar-manutencao/:id', component: EfetuarManutencao },
  { path: 'funcionario/finalizar-solicitacao/:id', component: FinalizarSolicitacao },
  { path: 'solicitacao/:id', component: VisualizarSolicitacao },
  { path: 'orcamento/:id', component: MostrarOrcamento },
  { path: 'rejeitar-servico/:id', component: RejeitarServico },
];
