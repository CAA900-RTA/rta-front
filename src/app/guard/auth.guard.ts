// src/app/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    try {
      const isAuthenticated = await this.authService.isAuthenticatedAsync();
      if (!isAuthenticated) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    } catch (error) {
      this.router.navigate(['/login']);
      return false;
    }
  }
}  
