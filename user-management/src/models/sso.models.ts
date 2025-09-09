export interface PermittedService {
  id: string;
  clientId: string;
  name: string;
  enabled: boolean;
  protocol: string;
  publicClient: boolean;
  serviceAccountsEnabled: boolean;
  standardFlowEnabled: boolean;
  directAccessGrantsEnabled: boolean;
  attributes: { [key: string]: any };
  baseUrl: string;
  description?: string;
  icon?: string;
  category?: string;
}

export interface PermittedServicesResponse {
  services: PermittedService[];
}

export interface SsoTokenRequest {
  clientId: string;
}

export interface SsoTokenResponse {
  token: string;
  expiresIn?: number;
}

export interface SsoRedirectInfo {
  service: PermittedService;
  token: string;
  redirectUrl: string;
}