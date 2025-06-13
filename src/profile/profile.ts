import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import {Dashboard} from '../dashboard/dashboard'; // For mat-button, mat-raised-button


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
  isLinear = true;

  // Stepper FormGroup
  profileForm: FormGroup;
  secondFormGroup: FormGroup;

  // Resume form
  resumeForm: FormGroup;

  // List of skills
  skillsList: string[] = ['JavaScript', 'Python', 'Java', 'C++', 'Angular', 'Node.js'];

  constructor(private fb: FormBuilder) {
    // Step 1 form: profile
    this.profileForm = this.fb.group({
      skills: this.fb.group(
        this.skillsList.reduce((acc, skill) => {
          acc[skill] = [false];
          return acc;
        }, {} as { [key: string]: any })
      ),
      experiences: this.fb.array([
        this.createExperienceGroup()
      ]),
      education: this.fb.array([
        this.createEducationGroup()
      ]),
      description: ['']
    });

    // Step 2 form: address
    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required]
    });

    // Resume form
    this.resumeForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      summary: ['']
    });
  }

  // Experience FormArray methods
  get experiences(): FormArray {
    return this.profileForm.get('experiences') as FormArray;
  }

  createExperienceGroup(): FormGroup {
    return this.fb.group({
      jobTitle: [''],
      years: ['']
    });
  }

  addExperience(): void {
    this.experiences.push(this.createExperienceGroup());
  }

  removeExperience(index: number): void {
    this.experiences.removeAt(index);
  }

  // Education FormArray methods
  get education(): FormArray {
    return this.profileForm.get('education') as FormArray;
  }

  createEducationGroup(): FormGroup {
    return this.fb.group({
      degree: [''],
      year: ['']
    });
  }

  addEducation(): void {
    this.education.push(this.createEducationGroup());
  }

  removeEducation(index: number): void {
    this.education.removeAt(index);
  }

  // Resume submit
  onSubmitResume(): void {
    console.log('Resume Form Data:', this.resumeForm.value);
    // You can trigger resume generation here
  }

  ngOnInit(): void {
  }

  get skillsFormGroup(): FormGroup {
    return this.profileForm.get('skills') as FormGroup;
  }
}
