import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';

// Importar y registrar datos de localización para español (Perú)
import { registerLocaleData } from '@angular/common';
import localeEsPe from '@angular/common/locales/es-PE';
registerLocaleData(localeEsPe);

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));