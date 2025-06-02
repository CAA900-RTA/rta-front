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

  onSubmit() {
    console.log('Signup Form Data:', this.formData);
    // You can send formData to your backend API here
  }
}

