import { Component, OnInit } from '@angular/core';
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

  profileForm: FormGroup;
  secondFormGroup: FormGroup;
  resumeForm: FormGroup;


  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      experiences: this.fb.array([
        this.createExperienceGroup()
      ]),
      education: this.fb.array([
        this.createEducationGroup()
      ]),
      description: [''],

      // New reactive input + list for tags
      customTagsInput: [''],
      customTags: this.fb.array([])
    });

    this.secondFormGroup = this.fb.group({
      secondCtrl: ['', Validators.required]
    });

    this.resumeForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      summary: ['']
    });
  }

  ngOnInit(): void {}

  // --- Experiences ---
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

  // --- Education ---
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

  // --- Resume Submit ---
  onSubmitResume(): void {
    console.log('Resume Form Data:', this.resumeForm.value);
  }

  // --- Custom Tags (type + enter + x to remove) ---
  get customTags(): FormArray {
    return this.profileForm.get('customTags') as FormArray;
  }

  addCustomTag(): void {
    const inputControl = this.profileForm.get('customTagsInput');
    const value = inputControl?.value?.trim();

    if (value && !this.customTags.value.includes(value)) {
      this.customTags.push(this.fb.control(value));
    }

    inputControl?.reset();
  }

  removeCustomTag(index: number): void {
    this.customTags.removeAt(index);
  }
}
