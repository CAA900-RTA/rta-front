import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../app/services/auth.service'; // Adjust path as needed

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  // Existing properties
  uploadedFileName: string = '';
  uploadedFileURL: string | ArrayBuffer | null = '';
  jobDescription: string = '';
  builtFileURL = 'https://uqd364ammi6ufsqikkc5mvbeaa0txxlb.lambda-url.us-east-1.on.aws';
  builtFileName: string = '';
  builtFileContent: string = '';

  // New properties for authentication
  currentUser: User | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check authentication status and get user info
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        // If user is not authenticated, redirect to login
        this.router.navigate(['/login']);
      }
    });
  }

  // Getter methods for easy access in templates
  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated;
  }

  get userName(): string {
    return this.currentUser?.username || this.currentUser?.email || 'User';
  }

  // Existing methods (unchanged)
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF or Word documents are allowed.');
        return;
      }

      this.uploadedFileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedFileURL = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    const content = `Job Description:\n${this.jobDescription}`;
    const blob = new Blob([content], { type: 'text/plain' });

    // release old URL if exists
    if (this.builtFileURL) {
      URL.revokeObjectURL(this.builtFileURL);
    }

    this.builtFileURL = URL.createObjectURL(blob);
    this.builtFileName = 'built-job-description.txt';

    // read back to display content
    const reader = new FileReader();
    reader.onload = () => {
      this.builtFileContent = reader.result as string;
    };
    reader.readAsText(blob);
  }

  isFormValid(): boolean {
    return !!this.uploadedFileName || !!this.jobDescription.trim();
  }

  // Updated profile method (removed window.location.reload())
  goToProfile(): void {
    this.router.navigate(['/dashboard']);
  }

  // New method for logout
  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }
}
