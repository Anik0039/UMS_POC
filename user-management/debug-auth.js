// Debug script to check authentication status
console.log('=== Authentication Debug ===');

// Check localStorage for authentication data
console.log('localStorage items:');
console.log('- isAuthenticated:', localStorage.getItem('isAuthenticated'));
console.log('- userInfo:', localStorage.getItem('userInfo'));
console.log('- authMethod:', localStorage.getItem('authMethod'));
console.log('- api_access_token:', localStorage.getItem('api_access_token'));
console.log('- api_refresh_token:', localStorage.getItem('api_refresh_token'));
console.log('- api_token_expiration:', localStorage.getItem('api_token_expiration'));

// Check if token is expired
const expiration = localStorage.getItem('api_token_expiration');
if (expiration) {
  const isExpired = Date.now() >= parseInt(expiration);
  console.log('- Token expired:', isExpired);
  console.log('- Current time:', new Date(Date.now()).toISOString());
  console.log('- Token expires at:', new Date(parseInt(expiration)).toISOString());
}

console.log('=== End Debug ===');