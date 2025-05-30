// app.ts
import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'rta';

  constructor(private router: Router) {}

  onSignup() {
    this.router.navigate(['/signup']);
  }
}
