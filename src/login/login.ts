import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  standalone: true,
  styleUrl: './login.css'
})
export class LoginComponent {

  constructor(private router: Router) {
  }

  open() {
    this.router.navigate(["/dashboard"])
  }
}
