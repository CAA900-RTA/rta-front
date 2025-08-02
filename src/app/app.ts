// app.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service'; // adjust the path if needed



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  providers: [AuthService],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'rta';
  isLoggedIn: boolean = false;
  username: string | null = '';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.username = localStorage.getItem('username');
  }

  onSignup() {
    this.router.navigate(['/signup']);
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

  async  onSignout() {
    await this.authService.signOut();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    this.isLoggedIn = false;
    this.username = '';
    this.router.navigate(['/login']);
  }

  isAuthPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/login' || currentUrl === '/signup';
  } 
}
