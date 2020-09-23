describe('failExtraApiCalls', () => {
  before(() => {
    cy.visit('index.html');
  });

  beforeEach(() => {
    cy.server();

    cy.failExtraApiCalls('/api/');
    cy.route('/api/test/');
  });

  it('should fail on unmocked calls', () => {
    cy.fails(() => {
      cy.request('/api/xxx/').should('contain', 'The file was not found');
    }, '/api/xxx/" is not mocked');
  });

  it('should not fail on defined routes', () => {
    cy.request('/api/test/').should('contain', 'The file was not found');
  });

  it('should fail on unmocked but valid calls', () => {
    cy.fails(() => {
      cy.request('/api/test.json').should('contain', 'The file was not found');
    }, '/api/test.json" is not mocked');
  });
});