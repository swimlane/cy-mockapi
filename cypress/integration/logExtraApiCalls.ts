describe('logExtraApiCalls', () => {
  before(() => {
    cy.visit('index.html');
  });

  beforeEach(() => {
    cy.logExtraApiCalls('/api/');
    cy.intercept('/api/test/');
  });

  it('should log on undefined routes', () => {
    cy.request('/api/fail/').should('contain', 'The file was not found');
  });

  it('should not log on defined routes', () => {
    cy.request('/api/test/').should('contain', 'The file was not found');
  });

  it('should not interfere with exiting api', () => {
    cy.request('/api/test.json').should('match', /"test": "api"/);
  });
});
