describe('User Management App', () => {
  it('Should redirect to login page', () => {
    cy.visit('/')
    cy.url().should('include', '/login')
  })

  it('Should display login form', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible')
  })

  it('Should navigate to dashboard after login', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('admin@example.com')
    cy.get('input[type="password"]').type('admin123')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})
