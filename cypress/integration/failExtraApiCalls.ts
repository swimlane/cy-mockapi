
describe('failExtraApiCalls', () => {
  before(() => {
    cy.visit('index.html');
  });

  beforeEach(() => {
    cy.server();

    // @ts-ignore
    cy.failExtraApiCalls('/api/');
    cy.route('/api/test/');
  });

  // @ts-ignore
  it.fails('should fail on unmocked calls', () => {
    cy.request('/api/xxx/').should('contain', 'The file was not found');
  });

  it('should not fail on defined routes', () => {
    cy.request('/api/test/').should('contain', 'The file was not found');
  });

  // @ts-ignore
  it.fails('should fail on unmocked valid calls', () => {
    cy.request('/api/test.json').should('contain', 'The file was not found')
  });
});