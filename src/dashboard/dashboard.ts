import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  uploadedFileName: string = '';
  uploadedFileURL: string | ArrayBuffer | null = '';
  jobDescription: string = '';

  builtFileURL: string | null = null;
  builtFileName: string = '';
  builtFileContent: string = ''; // content to show on right

  constructor(private router: Router) {
  }

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

  goToProfile() {
    window.location.reload();
    this.router.navigate(['/dashboard']);
  }
}

