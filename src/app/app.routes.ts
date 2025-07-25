import { Routes } from '@angular/router';
import { LoginComponent } from '../login/login'; // Adjust path as needed
import { SignupComponent } from '../signup/signup'; // Adjust path as needed
import { Dashboard } from '../dashboard/dashboard'; // Adjust path as needed
import { AuthGuard } from '../app/guard/auth.guard'; // Adjust path as needed

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' } // Wildcard route for 404 page
];