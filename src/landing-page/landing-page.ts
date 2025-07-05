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

  private fetchUrl = 'https://bdtwdawg26.execute-api.ca-central-1.amazonaws.com/dev/fetchProfile';
  private saveUrl = 'https://bdtwdawg26.execute-api.ca-central-1.amazonaws.com/dev/saveProfile';

  constructor(private router: Router, private http: HttpClient) {}

  openDashboard() {
    this.router.navigate(['/login']);
  }

  testFetchProfile() {
    this.http.post(this.fetchUrl, { email: 'sb7@email.com' }).subscribe({
      next: (res) => console.log('✅ Fetch profile response:', res),
      error: (err) => console.error('❌ Fetch error:', err)
    });
  }

  testSaveProfile() {
    const payload = {
      firstName: 'Ven',
      lastName: 'Louie',
      email: 'ven@example.com',
      phoneNumber: '123-456-7890',
      location: 'Ontario, Canada',
      linkedinUrl: 'https://linkedin.com/in/venlouie',
      githubUrl: 'https://github.com/venlouie',
      personalWebsiteUrl: 'https://venlouie.dev'
    };

    this.http.post(this.saveUrl, payload).subscribe({
      next: (res) => console.log('✅ Save profile response:', res),
      error: (err) => console.error('❌ Save error:', err)
    });
  }
}
