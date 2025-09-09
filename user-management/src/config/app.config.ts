// Application Configuration
// Update these values according to your environment

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  features: {
    enableApiIntegration: boolean;
    enableUserManagement: boolean;
    enableRoleBasedAccess: boolean;
  };
}

// Development Configuration
export const developmentConfig: AppConfig = {
  api: {
    baseUrl: 'http://10.11.201.85:5001', // Your API base URL
    timeout: 30000,
    retries: 3
  },
  features: {
    enableApiIntegration: false,
    enableUserManagement: true,
    enableRoleBasedAccess: true
  }
};

// Production Configuration
export const productionConfig: AppConfig = {
  api: {
    baseUrl: 'http://10.11.201.85:5001', // Your production API URL
    timeout: 30000,
    retries: 3
  },
  features: {
    enableApiIntegration: false,
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