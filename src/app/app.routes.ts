import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Registro } from './auth/registro/registro';
export const routes: Routes = [
    { path: '', component: Login },
    { path: 'registro', component: Registro },
];
