import { KeycloakConfig } from 'keycloak-js';
import { appConfig } from './config/app.config';

// Keycloak configuration from centralized config
export const keycloakConfig: KeycloakConfig = {
  url: appConfig.keycloak.url,
  realm: appConfig.keycloak.realm,
  clientId: appConfig.keycloak.clientId
};

// Keycloak initialization options
export const keycloakInitOptions = {
  onLoad: 'check-sso' as const,
  silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
  checkLoginIframe: false,
  enableLogging: true,
  pkceMethod: 'S256' as const
};

// Alternative initialization options for troubleshooting
export const keycloakInitOptionsAlternative = {
  onLoad: 'login-required' as const,
  checkLoginIframe: false,
  enableLogging: true
};