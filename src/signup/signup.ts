import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  passwordLength = false;
hasUppercase = false;
hasNumber = false;
hasSpecialChar = false;

validatePassword(password: string): void {
  this.passwordLength = password.length >= 8;
  this.hasUppercase = /[A-Z]/.test(password);
  this.hasNumber = /[0-9]/.test(password);
  this.hasSpecialChar = /[^A-Za-z0-9]/.test(password);
}

isPasswordValid(): boolean {
  return this.passwordLength && this.hasUppercase && this.hasNumber && this.hasSpecialChar;
}


  onSubmit() {
    console.log('Signup Form Data:', this.formData);
    // You can send formData to your backend API here
  }
}

