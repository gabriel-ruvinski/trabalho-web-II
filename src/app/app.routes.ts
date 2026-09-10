import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Registro } from './auth/registro/registro';
import { Dashboard } from './auth/dashboard/dashboard';
import { SolicitarManutencao } from './cliente/solicitar-manutencao/solicitar-manutencao';
import { Home } from './funcionario/home/home';
import {ListaSolicitacoes} from './funcionario/lista-solicitacoes/lista-solicitacoes'
import {EfetuarManutencao} from './funcionario/efetuar-manutencao/efetuar-manutencao';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'registro', component: Registro },
  { path: 'dashboard', component: Dashboard },
  { path: 'solicitar-manutencao', component: SolicitarManutencao },
  { path: 'funcionario/home', component: Home },
  { path: 'lista-solicitacoes', component: ListaSolicitacoes},
  { path: 'funcionario/efetuar-manutencao', component: EfetuarManutencao},
];
