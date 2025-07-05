// app.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'rta';
  isLoggedIn: boolean = false;
  username: string | null = '';

  constructor(private router: Router) {}

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

  onSignout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    this.isLoggedIn = false;
    this.username = '';
    this.router.navigate(['/login']);
  }
}
