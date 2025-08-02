import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../app/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';
  showSignOutOption = false;
  private authSubscription?: Subscription;

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Subscribe to auth state changes
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User is authenticated, redirect to dashboard
        this.router.navigate(['/dashboard']);
      }
    });

    // Check if user is already authenticated
    await this.checkExistingAuth();
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private async checkExistingAuth(): Promise<void> {
    try {
      const isAuthenticated = await this.authService.isAuthenticatedAsync();
      if (isAuthenticated) {
        // User is already signed in, redirect to dashboard
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      // No current user, show login form
      console.log('No authenticated user found');
    }
  }

  async open(): Promise<void> {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.showSignOutOption = false;

      try {
        const email = this.loginForm.get('username')?.value;
        const password = this.loginForm.get('password')?.value;
        
        // Try regular sign in first
        await this.authService.signIn(email, password);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', email);
        window.location.reload();
        
        // Navigation will happen automatically via the subscription
        
      } catch (error: any) {
        console.error('Login error:', error);
        
        // Check if the error is about existing signed-in user
        if (error.message && error.message.includes('already a signed in user')) {
          this.errorMessage = 'There is already a user signed in. Please sign out first or use "Sign Out & Login".';
          this.showSignOutOption = true;
        } else {
          this.errorMessage = error.message || 'An error occurred during sign in';
        }
      } finally {
        this.loading = false;
      }
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  // Force sign out existing user and sign in with new credentials
  async forceSignIn(): Promise<void> {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.showSignOutOption = false;

      try {
        const email = this.loginForm.get('username')?.value;
        const password = this.loginForm.get('password')?.value;
        
        // Use force sign in to handle existing sessions
        await this.authService.forceSignIn(email, password);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', email);
        window.location.reload();
        
        // Navigation will happen automatically via the subscription
        
      } catch (error: any) {
        this.errorMessage = error.message || 'An error occurred during sign in';
        console.error('Force login error:', error);
      } finally {
        this.loading = false;
      }
    }
  }

  // Sign out current user
  async signOutCurrentUser(): Promise<void> {
    try {
      await this.authService.signOut();
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      this.errorMessage = '';
      this.showSignOutOption = false;
      this.loginForm.reset();
    } catch (error: any) {
      console.error('Sign out error:', error);
      this.errorMessage = 'Error signing out current user';
    }
  }

  get f() {
    return this.loginForm.controls;
  }
}