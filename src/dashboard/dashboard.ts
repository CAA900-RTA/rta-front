import {Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../app/services/auth.service';
import {HttpClient, HttpHeaders} from '@angular/common/http'; // Adjust path as needed

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
  buildFileURL = 'https://uqd364ammi6ufsqikkc5mvbeaa0txxlb.lambda-url.us-east-1.on.aws';
  builtFileName: string = '';
  builtFileContent: string = '';

  // New properties for authentication
  currentUser: User | null = null;

  @Input() data: string;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
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

    // this.modifyData();
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
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });


    const test = {
      "candidate_data": {
        "name": "John Doe",
        "skills": [
          "Python",
          "AWS",
          "JavaScript",
          "React",
          "Node.js",
          "Docker",
          "Kubernetes",
          "CI/CD",
          "Git",
          "SQL"
        ],
        "experience": [
          {
            "job_title": "Senior Software Engineer",
            "company": "Tech Innovations Inc.",
            "start_date": "2021-03-01",
            "end_date": "Present",
            "location": "San Francisco, CA",
            "responsibilities": [
              "Led development of microservices architecture using Python and AWS",
              "Implemented CI/CD pipelines reducing deployment time by 70%",
              "Mentored junior developers and conducted code reviews",
              "Collaborated with cross-functional teams to deliver high-quality software"
            ]
          },
          {
            "job_title": "Software Developer",
            "company": "StartupXYZ",
            "start_date": "2019-06-01",
            "end_date": "2021-02-28",
            "location": "New York, NY",
            "responsibilities": [
              "Developed full-stack web applications using React and Node.js",
              "Designed and implemented RESTful APIs",
              "Optimized database queries improving performance by 40%",
              "Participated in agile development processes"
            ]
          }
        ],
        "education": [
          {
            "degree": "Bachelor of Science in Computer Science",
            "institution": "State University",
            "start_year": "2015",
            "end_year": "2019",
            "location": "California, USA"
          }
        ],
        "certifications": [
          {
            "name": "AWS Certified Solutions Architect",
            "issuer": "Amazon Web Services",
            "issue_date": "2023-06-15"
          },
          {
            "name": "Certified Kubernetes Administrator",
            "issuer": "Cloud Native Computing Foundation",
            "issue_date": "2022-11-20"
          }
        ]
      },
      "job_description": "Senior Software Engineer - Cloud Platform Team\n\nWe are seeking a highly skilled Senior Software Engineer to join our Cloud Platform team. The ideal candidate will have extensive experience in cloud technologies, particularly AWS, and a strong background in Python development.\n\nKey Responsibilities:\n- Design and implement scalable cloud-native applications\n- Build and maintain microservices architecture\n- Collaborate with DevOps teams to implement CI/CD pipelines\n- Mentor junior developers and provide technical leadership\n- Participate in architectural decisions and code reviews\n\nRequired Skills:\n- 5+ years of experience in software development\n- Strong proficiency in Python and modern web frameworks\n- Extensive experience with AWS services (EC2, S3, Lambda, RDS, etc.)\n- Experience with containerization technologies (Docker, Kubernetes)\n- Knowledge of CI/CD tools and practices\n- Strong understanding of database design and optimization\n- Experience with version control systems (Git)\n- Excellent problem-solving and communication skills\n\nPreferred Qualifications:\n- AWS certifications (Solutions Architect, Developer, etc.)\n- Experience with Infrastructure as Code (Terraform, CloudFormation)\n- Knowledge of monitoring and logging tools\n- Experience with agile development methodologies\n- Bachelor's degree in Computer Science or related field"
    }

    this.http.post(this.buildFileURL, test).subscribe({
      next: (res) => console.log('Generated', res),
      error: (err) => console.error('Error:', err),
    });


    //
    // // release old URL if exists
    // if (this.builtFileURL) {
    //   URL.revokeObjectURL(this.builtFileURL);
    // }
    //
    // this.builtFileURL = URL.createObjectURL(blob);
    // this.builtFileName = 'built-job-description.txt';
    //
    // // read back to display content
    // const reader = new FileReader();
    // reader.onload = () => {
    //   this.builtFileContent = reader.result as string;
    // };
    // reader.readAsText(blob);

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

  modifyData() {

  }
}
