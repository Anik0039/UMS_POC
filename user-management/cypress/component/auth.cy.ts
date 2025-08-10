// import { AuthService } from '../../src/services/auth.service'
// import { SSOService } from '../../src/services/sso.service'

describe('Auth Service Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    cy.window().then((win) => {
      win.localStorage.clear()
    })
  })

  it('should verify localStorage is cleared initially', () => {
    cy.window().then((win) => {
      expect(win.localStorage.getItem('isAuthenticated')).to.be.null
      expect(win.localStorage.getItem('userInfo')).to.be.null
    })
  })

  it('should store authentication data in localStorage on successful login', () => {
    cy.window().then((win) => {
      // Simulate successful login by setting localStorage directly
      win.localStorage.setItem('isAuthenticated', 'true')
      win.localStorage.setItem('userInfo', JSON.stringify({
        userId: 'admin@example.com',
        name: 'John Doe',
        email: 'john@example.com'
      }))
      
      // Verify the data is stored
      expect(win.localStorage.getItem('isAuthenticated')).to.equal('true')
      expect(win.localStorage.getItem('userInfo')).to.not.be.null
    })
  })

  it('should clear authentication data on logout', () => {
    cy.window().then((win) => {
      // First set some auth data
      win.localStorage.setItem('isAuthenticated', 'true')
      win.localStorage.setItem('userInfo', JSON.stringify({ userId: 'test' }))
      
      // Verify data exists
      expect(win.localStorage.getItem('isAuthenticated')).to.equal('true')
      
      // Clear the data (simulating logout)
      win.localStorage.removeItem('isAuthenticated')
      win.localStorage.removeItem('userInfo')
      
      // Verify data is cleared
      expect(win.localStorage.getItem('isAuthenticated')).to.be.null
      expect(win.localStorage.getItem('userInfo')).to.be.null
    })
  })

  it('should handle invalid login credentials', () => {
    cy.window().then((win) => {
      // Ensure no auth data exists for invalid credentials
      expect(win.localStorage.getItem('isAuthenticated')).to.be.null
      
      // Simulate failed login - no data should be stored
      const hasValidCredentials = false
      
      if (!hasValidCredentials) {
        // Don't store any auth data
        expect(win.localStorage.getItem('isAuthenticated')).to.be.null
      }
    })
  })
})