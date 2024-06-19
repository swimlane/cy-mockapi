describe('failExtraApiCalls', () => {
  before(() => {
    cy.visit('index.html');
  });

  beforeEach(() => {
    cy.failExtraApiCalls('/api/');
    cy.intercept('/api/test/', {});
  });

  it('should fail on unmocked calls', () => {
    cy.fails(() => {
      cy.request('/api/xxx/').should('contain', 'The file was not found');
    }, '/api/xxx/" is not mocked');
  });

  it('should not fail on defined routes', () => {
    cy.request('/api/test/').should('equal', '');
  });

  it('should fail on unmocked but valid calls', () => {
    cy.fails(() => {
      cy.request('/api/test.json').should('contain', 'The file was not found');
    }, '/api/test.json" is not mocked');
  });
});
