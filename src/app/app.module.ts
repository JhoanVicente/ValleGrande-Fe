// This file is no longer needed when using standalone components and bootstrapApplication.
// You can delete this file.

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/services/auth.interceptor';

export const providers = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
