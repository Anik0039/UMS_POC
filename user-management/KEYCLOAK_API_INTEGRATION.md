# Keycloak & API Integration Guide

This guide explains how to configure and use Keycloak authentication and custom API integration in your Angular user management application.

## 🚀 Quick Start

### 1. Configure Your Settings

Update the configuration in `src/config/app.config.ts`:

```typescript
export const developmentConfig: AppConfig = {
  api: {
    baseUrl: 'http://10.11.201.80:8080/api', // Your API URL
    timeout: 30000,
    retries: 3
  },
  keycloak: {
    url: 'http://10.11.201.80:8080',    // Your Keycloak server URL
    realm: 'era-platform',             // Your realm name
    clientId: 'ums-web'                // Your client ID
  },
  features: {
    enableKeycloak: true,
    enableApiIntegration: true,
    enableUserManagement: true,
    enableRoleBasedAccess: true
  }
};
```

### Test Credentials
- Username: `zidan`
- Password: `1234`

### Redirect URI Configuration
The application is configured with the following redirect URIs:
- **Main Redirect URI**: `http://localhost:4200/`
- **Silent Check SSO**: `http://localhost:4200/assets/silent-check-sso.html`

**CRITICAL**: You MUST configure these redirect URIs in your Keycloak client settings:

#### Step-by-Step Keycloak Client Configuration:
1. **Access Keycloak Admin Console**: Navigate to `http://10.11.201.80:8080/admin/`
2. **Select Realm**: Choose `era-platform` realm
3. **Navigate to Clients**: Go to Clients → `ums-web`
4. **Configure Redirect URIs**: In the "Valid Redirect URIs" field, add:
   ```
   http://localhost:4200/*
   http://localhost:4200/assets/silent-check-sso.html
   ```
5. **Configure Post Logout Redirect URIs**: In the "Valid Post Logout Redirect URIs" field, add:
   ```
   http://localhost:4200/*
   ```
6. **Save Configuration**: Click "Save"

#### Additional Client Settings:
- **Access Type**: `public`
- **Standard Flow Enabled**: `ON`
- **Direct Access Grants Enabled**: `ON`
- **Web Origins**: `http://localhost:4200`

**Note**: If you're still getting "Invalid parameter: redirect_uri" error, it means the Keycloak client configuration on the server side is not properly set up with these redirect URIs.

## Troubleshooting "Invalid parameter: redirect_uri" Error

If you continue to see the "We are sorry... Invalid parameter: redirect_uri" error, follow these steps:

### 1. Verify Keycloak Client Configuration
- Double-check that the redirect URIs are correctly configured in the Keycloak admin console
- Ensure the client ID `ums-web` exists in the `era-platform` realm
- Verify that the client is enabled and properly configured

### 2. Alternative Configuration (If Issue Persists)
If the standard configuration doesn't work, you can try the alternative initialization:

1. **Edit** `src/app/app.config.ts`
2. **Replace** `keycloakInitOptions` with `keycloakInitOptionsAlternative`:
   ```typescript
   import { keycloakConfig, keycloakInitOptionsAlternative } from '../keycloak.config';
   
   function initializeKeycloak(keycloak: KeycloakService) {
     return () =>
       keycloak.init({
         config: keycloakConfig,
         initOptions: keycloakInitOptionsAlternative, // Use alternative options
       });
   }
   ```

### 3. Manual URL Fix (Temporary Workaround)
If you need immediate access:
1. When you see the error page, look at the browser URL
2. Remove the `?redirect_uri=...` parameter from the URL
3. Press Enter to reload the page

### 4. Check Network Configuration
- Ensure the Keycloak server at `http://10.11.201.80:8080` is accessible
- Verify there are no firewall or network issues
- Check if the realm `era-platform` and client `ums-web` are correctly configured

### 2. Keycloak Setup

#### Prerequisites
- Keycloak server running at `http://10.11.201.80:8080`
- Realm `era-platform` created
- Client `ums-web` configured
- API server running at `http://10.11.201.80:8080`

#### Client Configuration
In your Keycloak admin console:

1. **Client Settings:**
   - Client ID: `ums-web`
   - Realm: `era-platform`
   - Server URL: `http://10.11.201.80:8080`
   - Client Protocol: `openid-connect`
   - Access Type: `public`
   - Standard Flow Enabled: `ON`
   - Direct Access Grants Enabled: `ON`

2. **Valid Redirect URIs:**
   ```
   http://localhost:4200/*
   https://your-domain.com/*
   ```

3. **Web Origins:**
   ```
   http://localhost:4200
   https://your-domain.com
   ```

### 3. API Integration

#### API Service Usage

The `ApiService` automatically handles:
- Authentication headers (Keycloak tokens)
- Error handling
- Request/response transformation

```typescript
// Example: Using the UserApiService
import { UserApiService } from './services/user-api.service';

@Component({...})
export class UserListComponent {
  constructor(private userApi: UserApiService) {}

  loadUsers() {
    this.userApi.getUsers({ page: 1, limit: 10 }).subscribe({
      next: (response) => {
        console.log('Users:', response.users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }
}
```

## 🔧 Configuration Details

### Keycloak Configuration

**File:** `src/keycloak.config.ts`

```typescript
export const keycloakInitOptions = {
  onLoad: 'check-sso' as const,
  silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
  checkLoginIframe: false,
  enableLogging: true
};
```

### API Configuration

**File:** `src/services/api.service.ts`

The API service provides:
- Automatic token injection
- Error handling
- Request/response transformation
- HTTP methods: GET, POST, PUT, DELETE, PATCH

## 🔐 Authentication Flow

### 1. SSO Login
```typescript
// Login with Keycloak
this.ssoService.loginWithSSO('keycloak').subscribe({
  next: (user) => {
    console.log('Logged in user:', user);
  },
  error: (error) => {
    console.error('Login failed:', error);
  }
});
```

### 2. Token Management
```typescript
// Get access token
const token = this.ssoService.getAccessToken();

// Check if token is valid
this.ssoService.validateSSOToken().subscribe(isValid => {
  console.log('Token valid:', isValid);
});
```

### 3. Role-Based Access
```typescript
// Check user roles
const roles = this.ssoService.getUserRoles();
const hasAdminRole = this.ssoService.hasRole('admin');

// Use in auth guard
if (this.authGuard.canActivateWithRole(['admin', 'manager'])) {
  // User has required role
}
```

## 📡 API Endpoints

### Authentication API

```typescript
// Login with custom API
const credentials = {
  userName: 'zidan',
  password: '1234'
};

this.authApiService.login(credentials).subscribe(response => {
  if (response.isSuccess) {
    console.log('Login successful:', response.value);
    // Access token: response.value.access_token
    // Refresh token: response.value.refresh_token
    // ID token: response.value.id_token
  }
});
```

### User Management

```typescript
// Get users with pagination
this.userApi.getUsers({
  page: 1,
  limit: 10,
  search: 'john',
  role: 'admin',
  sortBy: 'name',
  sortOrder: 'asc'
});

// Create user
this.userApi.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user'
});

// Update user
this.userApi.updateUser('user-id', {
  name: 'Jane Doe',
  status: 'active'
});

// Delete user
this.userApi.deleteUser('user-id');
```

### Bulk Operations

```typescript
// Bulk update
this.userApi.bulkUpdateUsers(['id1', 'id2'], {
  status: 'inactive'
});

// Bulk delete
this.userApi.bulkDeleteUsers(['id1', 'id2']);
```

## 🛡️ Security Features

### 1. Automatic Token Injection
All API requests automatically include the Keycloak access token in the Authorization header.

### 2. Token Validation
The application checks token validity and handles token expiration.

### 3. Role-Based Access Control
```typescript
// Protect routes with roles
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [AuthGuard],
  data: { roles: ['admin'] }
}
```

### 4. Secure Logout
```typescript
// Logout clears both local storage and Keycloak session
this.ssoService.logoutSSO();
```

## 🔄 Error Handling

### API Errors
```typescript
this.userApi.getUsers().subscribe({
  next: (users) => {
    // Handle success
  },
  error: (error) => {
    // Error is automatically formatted
    console.error(error.message);
    
    // Handle specific error codes
    if (error.message.includes('401')) {
      // Redirect to login
    }
  }
});
```

### Keycloak Errors
```typescript
this.ssoService.loginWithSSO('keycloak').subscribe({
  error: (error) => {
    console.error('Keycloak login error:', error);
    // Handle authentication errors
  }
});
```

## 🚀 Development Setup

### 1. Install Dependencies
```bash
npm install keycloak-angular keycloak-js --legacy-peer-deps
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Configure Environment
Update `src/config/app.config.ts` with your actual URLs and credentials.

## 📝 API Contract

### Expected API Response Format
```typescript
{
  "success": true,
  "data": { /* your data */ },
  "message": "Operation successful",
  "errors": []
}
```

### Error Response Format
```typescript
{
  "success": false,
  "data": null,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## 🔧 Customization

### Adding New API Endpoints

1. **Create a new service:**
```typescript
@Injectable()
export class CustomApiService {
  constructor(private apiService: ApiService) {}

  getCustomData(): Observable<any> {
    return this.apiService.get('/custom-endpoint');
  }
}
```

2. **Use in components:**
```typescript
this.customApi.getCustomData().subscribe(data => {
  console.log(data);
});
```

### Adding Custom Roles

1. **Configure in Keycloak:**
   - Add roles in Keycloak admin console
   - Assign roles to users

2. **Use in application:**
```typescript
if (this.ssoService.hasRole('custom-role')) {
  // Show custom content
}
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Configure CORS in your API server
   - Add your domain to Keycloak's Web Origins

2. **Token Expiration:**
   - Implement token refresh logic
   - Handle 401 responses appropriately

3. **Keycloak Connection:**
   - Verify Keycloak server is running
   - Check realm and client configuration
   - Verify redirect URIs

### Debug Mode
Enable debug logging in `src/keycloak.config.ts`:
```typescript
export const keycloakInitOptions = {
  // ...
  enableLogging: true
};
```

## 📚 Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Keycloak Angular Adapter](https://github.com/mauriciovigolo/keycloak-angular)
- [Angular HTTP Client](https://angular.io/guide/http)

---

**Note:** Remember to update the configuration files with your actual Keycloak server details and API endpoints before running the application.