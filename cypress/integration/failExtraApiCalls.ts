
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

  it('should fail on unmocked calls', () => {
    // @ts-ignore
    cy.fails(() => {
      cy.request('/api/xxx/').should('contain', 'The file was not found');
    }, 'The GET API call to "http://localhost:63392/api/xxx/" is not mocked');
  });

  it('should not fail on defined routes', () => {
    cy.request('/api/test/').should('contain', 'The file was not found');
  });

  it('should fail on unmocked but valid calls', () => {
    // @ts-ignore
    cy.fails(() => {
      cy.request('/api/test.json').should('contain', 'The file was not found');
    }, 'The GET API call to "http://localhost:63392/api/test.json" is not mocked');
  });
});