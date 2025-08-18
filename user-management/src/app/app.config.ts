import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';

import { routes } from './app.routes';
import { keycloakConfig, keycloakInitOptions } from '../keycloak.config';
import { appConfig as config } from '../config/app.config';

function initializeKeycloak(keycloak: KeycloakService) {
  return () => {
    if (config.features.enableKeycloak) {
      return keycloak.init({
        config: keycloakConfig,
        initOptions: keycloakInitOptions,
      });
    }
    return Promise.resolve();
  };
}

// Conditional providers based on feature flags
const getProviders = () => {
  const baseProviders: any[] = [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
  ];

  if (config.features.enableKeycloak) {
    baseProviders.push(importProvidersFrom(KeycloakAngularModule));
    baseProviders.push({
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService],
    });
  }

  return baseProviders;
};

export const appConfig: ApplicationConfig = {
  providers: getProviders()
};
