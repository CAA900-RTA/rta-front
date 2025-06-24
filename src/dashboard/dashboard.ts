import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

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
    console.log('File:', this.uploadedFileName);
    console.log('Job Description:', this.jobDescription);
    // Submit logic here
  }

  isFormValid(): boolean {
    return !!this.uploadedFileName && !!this.jobDescription.trim();
  }
}
