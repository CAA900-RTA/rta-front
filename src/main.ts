import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Amplify } from 'aws-amplify';
// Update the import path if your config file is named differently, e.g., 'aws-exports'
import { awsConfig } from './aws-config';

Amplify.configure(awsConfig);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
