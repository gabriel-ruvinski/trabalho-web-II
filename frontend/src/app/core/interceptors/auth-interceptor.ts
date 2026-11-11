import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth.service';

// Rotas que o backend restringe a funcionários.
const ROTAS_DE_FUNCIONARIO = /\/api\/(funcionarios|clientes)(\/|\?|$)/;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!ROTAS_DE_FUNCIONARIO.test(req.url) || req.params.has('solicitanteId')) {
    return next(req);
  }

  const usuarioId = inject(AuthService).getUsuario()?.id;

  if (usuarioId === undefined || usuarioId === null) {
    return next(req);
  }

  return next(
    req.clone({ params: req.params.set('solicitanteId', usuarioId) }),
  );
};