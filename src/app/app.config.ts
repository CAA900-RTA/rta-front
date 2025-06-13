// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {LandingPage} from '../landing-page/landing-page';
import { LoginComponent } from '../login/login';
import { SignupComponent } from '../signup/signup';
import {Profile} from '../profile/profile';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([
      {
        path: '',
        component: LandingPage,
      },
      {
        path: 'home',
        component: LandingPage,
      },
      {
        path: 'dashboard',
        component: Profile,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'signup',
        component: SignupComponent,
      },

      {
        path: '**',
        redirectTo: '',
      },

    ])
  ]
};
