import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../app/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class SignupComponent {
  formData = {
    username: '',
    password: '',
    email: '',
    phone: '',
    location: ''
  };

  // New properties for Cognito integration
  loading = false;
  errorMessage = '';
  showConfirmation = false;
  confirmationCode = '';

  showPasswordCriteria = false;
  passwordLength = false;
  hasUppercase = false;
  hasNumber = false;
  hasSpecialChar = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  validatePassword(password: string): void {
    this.passwordLength = password.length >= 8;
    this.hasUppercase = /[A-Z]/.test(password);
    this.hasNumber = /[0-9]/.test(password);
    this.hasSpecialChar = /[^A-Za-z0-9]/.test(password);
  }

  isPasswordValid(): boolean {
    return this.passwordLength && this.hasUppercase && this.hasNumber && this.hasSpecialChar;
  }

  isFormValid(): boolean {
    return this.formData.username.trim() !== '' &&
           this.formData.email.trim() !== '' &&
           this.isPasswordValid() &&
           this.isValidEmail(this.formData.email);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async onSubmit(): Promise<void> {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { username, password, email } = this.formData;
      
      // Use the AuthService to sign up
      await this.authService.signUp(email, password, username);
      
      // Show confirmation form
      this.showConfirmation = true;
      this.errorMessage = '';
      
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred during sign up';
      console.error('Signup error:', error);
    } finally {
      this.loading = false;
    }
  }

  async onConfirmSignUp(): Promise<void> {
    if (!this.confirmationCode.trim()) {
      this.errorMessage = 'Please enter the confirmation code';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.confirmSignUp(this.formData.email, this.confirmationCode);
      alert('Account confirmed successfully! Please sign in.');
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorMessage = error.message || 'An error occurred during confirmation';
      console.error('Confirmation error:', error);
    } finally {
      this.loading = false;
    }
  }

  // Method to go back to signup form from confirmation
  goBackToSignup(): void {
    this.showConfirmation = false;
    this.confirmationCode = '';
    this.errorMessage = '';
  }
}