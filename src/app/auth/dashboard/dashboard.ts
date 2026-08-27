import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
 
@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

    constructor(
        private authService: AuthService,
        private router: Router
    ){}

    sair(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}