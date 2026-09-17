import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-layout-cliente',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
})
export class LayoutCliente {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  usuario = this.authService.getUsuario();

  sair(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}