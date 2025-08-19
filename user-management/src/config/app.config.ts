// Application Configuration
// Update these values according to your environment

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  keycloak: {
    url: string;
    realm: string;
    clientId: string;
  };
  features: {
    enableKeycloak: boolean;
    enableApiIntegration: boolean;
    enableUserManagement: boolean;
    enableRoleBasedAccess: boolean;
  };
}

// Development Configuration
export const developmentConfig: AppConfig = {
  api: {
    baseUrl: 'http://10.11.201.69:8007/api', // Your API base URL
    timeout: 30000,
    retries: 3
  },
  keycloak: {
    url: 'http://10.11.201.80:8080', // Your Keycloak server URL
    realm: 'era-platform', // Your realm name
    clientId: 'ums-web' // Your client ID
  },
  features: {
    enableKeycloak: false,
    enableApiIntegration: true,
    enableUserManagement: true,
    enableRoleBasedAccess: true
  }
};

// Production Configuration
export const productionConfig: AppConfig = {
  api: {
    baseUrl: 'http://10.11.201.80:8080/api', // Your production API URL
    timeout: 30000,
    retries: 3
  },
  keycloak: {
    url: 'http://10.11.201.80:8080', // Your production Keycloak URL
    realm: 'era-platform', // Your realm name
    clientId: 'ums-web' // Your client ID
  },
  features: {
    enableKeycloak: false,
    enableApiIntegration: true,
    enableUserManagement: true,
    enableRoleBasedAccess: true
  }
};

// Get current configuration based on environment
export function getAppConfig(): AppConfig {
  // You can use environment variables or other methods to determine the environment
  const isProduction = window.location.hostname !== 'localhost';
  return isProduction ? productionConfig : developmentConfig;
}

// Export current config
export const appConfig = getAppConfig();