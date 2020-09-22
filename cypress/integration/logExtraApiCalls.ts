describe('logExtraApiCalls', () => {
  before(() => {
    cy.visit('index.html');
  });

  beforeEach(() => {
    cy.server();

    cy.logExtraApiCalls('/api/');
    cy.route('/api/test/');
  });

  it('should log on undefined routes', () => {
    cy.request('/api/fail/').should('contain', 'The file was not found');
  });

  it('should not log on defined routes', () => {
    cy.request('/api/test/').should('contain', 'The file was not found');
  });

  it('should not interfear with exiting api', () => {
    cy.request('/api/test.json').should('equal', '{\n  "test": "api"\n}');
  });
});