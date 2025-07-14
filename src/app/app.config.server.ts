// src/app/app.config.server.ts (config SSR sin rutas server específicas)

import { ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { provideServerRouting } from '@angular/ssr';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    provideServerRouting(appRoutes) // sin argumentos si no usas serverRoutes
  ]
};

export const config = serverConfig;
