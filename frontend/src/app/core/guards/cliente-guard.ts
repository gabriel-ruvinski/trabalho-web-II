import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { SolicitacaoService } from '../../services/solicitacao.service';

export const clienteGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.getUsuario();

  if (!usuario || usuario.perfil !== 'cliente') {
    return router.parseUrl('/');
  }

  const id = route.paramMap.get('id');
  if (id) {
    const solicitacaoService = inject(SolicitacaoService);
    const solicitacao = solicitacaoService.obterPorId(Number(id));

    if (!solicitacao || solicitacao.clienteEmail !== usuario.email) {
      return router.parseUrl('/dashboard');
    }
  }

  return true;
};