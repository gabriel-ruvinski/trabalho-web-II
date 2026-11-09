import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

export const clienteGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const usuario = authService.getUsuario();

  if (!usuario || usuario.perfil !== 'cliente') {
    return router.parseUrl('/');
  }

  return true;
};