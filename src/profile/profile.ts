import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { Dashboard } from '../dashboard/dashboard';
import { MatTabGroup } from '@angular/material/tabs';
import {Router} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {AuthService, User} from '../app/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatStepperModule,
    MatButtonModule,
    Dashboard,
  ],
  templateUrl: 'profile.html',
  styleUrl: 'profile.css'
})
export class Profile implements OnInit {
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  profileForm: FormGroup;
  private fetchUrl = 'https://bdtwdawg26.execute-api.ca-central-1.amazonaws.com/dev/fetchProfile';
  private saveUrl = 'https://bdtwdawg26.execute-api.ca-central-1.amazonaws.com/dev/saveProfile';
  currentUser: User | null = null;

  dataToSubmit: { } = '';

  constructor(private fb: FormBuilder, private http: HttpClient,
              private router: Router,
              private authService: AuthService,) {
    this.profileForm = this.fb.group({
      experiences: this.fb.array([this.createExperienceGroup()]),
      education: this.fb.array([this.createEducationGroup()]),
      description: [''],
      fullName: [''],
      skills: [''],
      customTags: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        // If user is not authenticated, redirect to login
        this.router.navigate(['/login']);
      }
    });
  }

    saveData(tabGroup: MatTabGroup) {
    const experiencesArray = this.profileForm.get('experiences') as FormArray;
    for (let i = experiencesArray.length - 1; i >= 0; i--) {
      const exp = experiencesArray.at(i);
      if (exp.get('isDeleted')?.value === true) {
        experiencesArray.removeAt(i);
      }
    }

    const educationArray = this.profileForm.get('education') as FormArray;
    for (let i = educationArray.length - 1; i >= 0; i--) {
      const edu = educationArray.at(i);
      if (edu.get('isDeleted')?.value === true) {
        educationArray.removeAt(i);
      }
    }

    if (this.profileForm.valid) {

      const payload = {
        username: this.currentUser?.username,
        description: this.profileForm.value.description,
        fullName: this.profileForm.value.fullName,
        skills: this.profileForm.value.customTags,
        experiences: this.profileForm.value.experiences,
        education: this.profileForm.value.education,
      };

      console.log("payload", payload);


      // uncomment this while testing
      this.http.post(this.saveUrl, payload).subscribe({
        next: (res) => {
          console.log('✅ Save profile response:', res)
          this.dataToSubmit = payload;
          tabGroup.selectedIndex = 1;
        },
        error: (err) => console.error('❌ Save error:', err)
      });



    } else {
      alert('Please complete the profile form before proceeding.');
    }
  }


  // --- Experiences ---
  get experiences(): FormArray {
    return this.profileForm.get('experiences') as FormArray;
  }

 createExperienceGroup(): FormGroup {
  return this.fb.group({
    id: [''],
    jobTitle: ['', Validators.required],
    company: ['', Validators.required],
    responsibilities: [''],
    startDate: [''],
    endDate: [''],
    isDeleted: [false]
  });
}

  addExperience(): void {
    this.experiences.push(this.createExperienceGroup());
  }

  removeExperience(index: number): void {
    const work = this.experiences.at(index);
    if (work) {
      work.get('isDeleted')?.setValue(true);
    }
  }

  // --- Education ---
  get education(): FormArray {
    return this.profileForm.get('education') as FormArray;
  }

  createEducationGroup(): FormGroup {
    return this.fb.group({
      id: [''],
      degree: ['', Validators.required],
      institution: ['', Validators.required],
      startDate: [''],
      endDate: [''],
      isDeleted: [false]
    });
  }

  removeEducation(index: number): void {
    const edu = this.education.at(index);
    if (edu) {
      edu.get('isDeleted')?.setValue(true);
    }
  }

  addEducation(): void {
    this.education.push(this.createEducationGroup());
  }

  // --- Custom Tags ---
  get customTags(): FormArray {
    return this.profileForm.get('customTags') as FormArray;
  }

  addCustomTag(): void {
    const inputControl = this.profileForm.get('skills');
    const value = inputControl?.value?.trim();

    if (value && !this.customTags.value.includes(value)) {
      this.customTags.push(this.fb.control(value));
    }

    inputControl?.reset();


    console.log("form data",this.profileForm.value.value );
  }

  removeCustomTag(index: number): void {
    this.customTags.removeAt(index);
  }

  goToNextTab(tabGroup: MatTabGroup): void {
    // if (this.profileForm.valid) {
      tabGroup.selectedIndex = 1;
    // }

  }

}
