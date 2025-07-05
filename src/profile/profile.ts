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


  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.profileForm = this.fb.group({
      experiences: this.fb.array([this.createExperienceGroup()]),
      education: this.fb.array([this.createEducationGroup()]),
      description: [''],
      skills: [''],
      customTags: this.fb.array([])
    });
  }

  ngOnInit(): void {}

  // --- Navigate to Next Tab ---
  goToNextTab(tabGroup: MatTabGroup): void {
    if (this.profileForm.valid) {
      tabGroup.selectedIndex = 1;
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
    years: ['', [Validators.required, Validators.min(0)]]
  });
}

  addExperience(): void {
    this.experiences.push(this.createExperienceGroup());
  }

  removeExperience(index: number): void {
    this.experiences.removeAt(index);
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
    year: ['', [Validators.required, Validators.min(1900)]]
  });
}

  addEducation(): void {
    this.education.push(this.createEducationGroup());
  }

  removeEducation(index: number): void {
    this.education.removeAt(index);
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

  submitProfile() {
    // if (this.profileForm.invalid) {
    //   alert('Please complete the form before submitting.');
    //   return;
    // }

    const payload = {
      description: this.profileForm.value.description,
      skills: this.profileForm.value.customTags,
      experiences: this.profileForm.value.experiences,
      education: this.profileForm.value.education,
    };

    console.log("payload", payload);


    //
    // this.http.post(this.saveUrl, payload).subscribe({
    //   next: (res) => console.log('✅ Save profile response:', res),
    //   error: (err) => console.error('❌ Save error:', err)
    // });

  }

}
