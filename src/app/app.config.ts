// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import {LandingPage} from '../landing-page/landing-page';
import {Dashboard} from '../dashboard/dashboard';

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
        component: Dashboard,
      },
      {
        path: '**',
        redirectTo: '',
      },

    ])
  ]
};
