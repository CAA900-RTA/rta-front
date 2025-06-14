import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPage{

  constructor(private router: Router) {}

  openDashboard() {
    this.router.navigate(['/login']);
  }

}
