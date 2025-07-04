import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.css']
})
export class LandingPage {

  private apiUrl = 'https://bdtwdawg26.execute-api.ca-central-1.amazonaws.com/dev/fetchProfile'; // Replace with your API Gateway URL

  constructor(private router: Router, private http: HttpClient) {}

  openDashboard() {
    this.router.navigate(['/login']);
  }

  testApi() {
    this.http.get(this.apiUrl).subscribe({
      next: (res) => console.log('API response:', res),
      error: (err) => console.error('API error:', err)
    });
  }
}
