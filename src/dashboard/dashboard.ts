import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../app/services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnChanges {
  uploadedFileName: string = '';
  uploadedFileURL: string | ArrayBuffer | null = '';
  jobDescription: string = '';
  buildFileURL = 'https://uqd364ammi6ufsqikkc5mvbeaa0txxlb.lambda-url.us-east-1.on.aws';
  builtFileName: string = '';
  builtFileContent: string = '';

  currentUser: User | null = null;

  @Input() personalData: any = '';
  finalData: any = '';
  responseData: any;

  isLoading: boolean = false; // ✅ Spinner flag

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/login']);
      }
    });

    this.modifyData(this.personalData);
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated;
  }

  get userName(): string {
    return this.currentUser?.username || this.currentUser?.email || 'User';
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
    this.isLoading = true; // ✅ Start spinner
    this.http.post(this.buildFileURL, this.finalData).subscribe({
      next: (res) => {
        console.log('Generated', res);
        this.responseData = res;
        this.isLoading = false; // ✅ Stop spinner
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false; // ✅ Stop spinner
      }
    });
  }

  isFormValid(): boolean {
    return !!this.uploadedFileName || !!this.jobDescription.trim();
  }

  goToProfile(): void {
    this.router.navigate(['/dashboard']);
  }

  async logout(): Promise<void> {
    try {
      await this.authService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  modifyData(data: any) {
    this.finalData = {
      candidate_data: {
        name: data.fullName || '',
        skills: data.skills || [],
        experience: (data.experiences || []).map((exp: any) => ({
          job_title: exp.jobTitle,
          company: exp.company,
          start_date: exp.startDate,
          end_date: exp.endDate,
          location: 'N/A',
          responsibilities: [exp.responsibilities]
        })),
        education: (data.education || []).map((edu: any) => ({
          degree: edu.degree,
          institution: edu.institution,
          start_year: new Date(edu.startDate).getFullYear().toString(),
          end_year: new Date(edu.endDate).getFullYear().toString(),
          location: 'N/A'
        }))
      },
      job_description: data.description
    };

    console.log("finalData", this.finalData);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['personalData'] && !changes['personalData'].isFirstChange()) {
      console.log('Parent data changed:', this.personalData);
    }

    this.modifyData(this.personalData);
  }

  downloadFile(): void {
    const url = this.responseData.s3_urls.download_url;
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = '';
    anchor.target = '_blank';
    anchor.click();
  }
}
