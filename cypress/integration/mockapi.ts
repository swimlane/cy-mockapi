describe('mockApi', () => {
  before(() => {
    cy.visit('index.html');
  });

  beforeEach(() => {
    cy.mockApi({
      apiPath: '/api/',
      mocksFolder: './mocks/a/',
      cache: false
    });
  });

  it('simple', () => {
    cy.request({url: '/api/test/'})
      .should('equal', '{"hello":"world"}');

    cy.request({method: 'POST', url: '/api/test/'})
      .should('equal', '{"hello":"post"}');

    cy.request({method: 'PUT', url: '/api/test/'})
      .should('equal', '{"hello":"put"}');

    cy.request({method: 'DELETE', url: '/api/test/'})
      .should('equal', '{"hello":"delete"}');
  });

  it('catch all', () => {
    cy.request({url: '/api/catch/anything/'})
      .should('equal', '{"catch":"get"}');

    cy.request({method: 'POST', url: '/api/catch/at/'})
      .should('equal', '{"catch":"post"}');

    cy.request({method: 'PUT', url: '/api/catch/all/'})
      .should('equal', '{"catch":"put"}');

    cy.request({method: 'DELETE', url: '/api/catch/really/'})
      .should('equal', '{"catch":"delete"}');
  });

  it('query strings', () => {
    cy.request({url: '/api/query/string?q=1'})
      .should('equal', '{"query":"get"}');

    cy.request({url: '/api/query/string?q=2'})
      .should('equal', '{"query":"get-2"}');

    cy.request({method: 'POST', url: '/api/query/string?q=3'})
      .should('equal', '{"query":"post"}');

    cy.request({method: 'PUT', url: '/api/query/string?q=4'})
      .should('equal', '{"query":"put"}');

    cy.request({method: 'DELETE', url: '/api/query/string?q=5'})
      .should('equal', '{"query":"delete"}');
  });

  describe('options', () => {
    it('defaults', () => {
      // Default response, default method, default url
      cy.request({url: '/api/options'})
        .should('equal', '{"query":"get"}');

      // Default response, default method, defined url
      cy.request({url: '/api/options?q=1'})
        .should('equal', '{"query":"get"}');

      // Defined response, default method, defined url
      cy.request({url: '/api/options?q=2'})
        .should('equal', '{"query":"get-2"}');

      cy.request({method: 'POST', url: '/api/options'})
        .should('equal', '{"query":"post"}');

      cy.request({method: 'PUT', url: '/api/options'})
        .should('equal', '{"query":"put"}');

      cy.request({method: 'DELETE', url: '/api/options'})
        .should('equal', '{"query":"delete"}');
    });

    it('aliases', () => {
      // Default alias
      cy.request({url: '/api/options'});
      cy.wait('@GET:options').its('response.body').should('deep.equal', { query: 'get' });

      // Default alias
      cy.request({url: '/api/options?q=1'});
      cy.wait('@GET:options?q=*').its('response.body').should('deep.equal', { query: 'get' });

      // Defined alias
      cy.request({url: '/api/options?q=2'});
      cy.wait('@get-options-2').its('response.body').should('deep.equal', { query: 'get-2' });

      // Defined alias
      cy.request({method: 'POST', url: '/api/options'});
      cy.wait('@postAlias').its('response.statusCode').should('equal', 200);

      // Default alias
      cy.request({method: 'PUT', url: '/api/options'});
      cy.wait('@PUT:options').its('request.method').should('equal', 'PUT');

      // Default alias
      cy.request({method: 'DELETE', url: '/api/options'});
      cy.wait('@DELETE:options').its('request.method').should('equal', 'DELETE');
    });

    it('statusCode', () => {
      // cy.request({url: '/api/options'});
      // cy.wait('@GET:options').its('response.statusCode').should('equal', 200);

      cy.request({url: '/api/options?q=1'});
      cy.wait('@GET:options?q=*').its('response.statusCode').should('equal', 200);

      cy.request({url: '/api/options?q=2'});
      cy.wait('@get-options-2').its('response.statusCode').should('equal', 404);

      cy.request({method: 'PUT', url: '/api/options'});
      cy.wait('@PUT:options').its('response.statusCode').should('equal', 201);
    });

    it('headers', () => {
      cy.request({url: '/api/options'});
      cy.wait('@GET:options').its('response.headers.X-Token').should('equal', 'My X-Token');

      cy.request({url: '/api/options?q=1'});
      cy.wait('@GET:options?q=*').its('response.headers.x-token').should('not.exist');

      cy.request({url: '/api/options?q=2'});
      cy.wait('@get-options-2').its('response.headers.x-token').should('not.exist');
    });

    it.skip('redirects', () => {
      cy.request({url: '/api/query?q=3'});
      cy.wait('@abc').its('status').should('equal', 503);
    });
  });
});

describe('can load alternative sets', () => {
  beforeEach(() => {
    cy.server();

    cy.mockApi({
      apiPath: '/api/',
      mocksFolder: './mocks/b/',
      cache: true
    });
  });

  it('overides work', () => {
    cy.request({url: '/api/test/'})
      .should('equal', '{"hello":"world-b"}');

    cy.request({method: 'POST', url: '/api/test/'})
      .should('equal', '{"hello":"post-b"}');

    cy.request({method: 'PUT', url: '/api/test/'})
      .should('equal', '{"hello":"put-b"}');

    cy.request({method: 'DELETE', url: '/api/test/'}).
      should('equal', '{"hello":"delete-b"}');
  });

  it('other set not found', () => {
    cy.request({url: '/api/catch/anything/'}).should('contain', 'The file was not found');

    cy.request({method: 'POST', url: '/api/catch/at/'}).should('contain', 'The file was not found');

    cy.request({method: 'PUT', url: '/api/catch/all/'}).should('contain', 'The file was not found');

    cy.request({method: 'DELETE', url: '/api/catch/really/'}).should('contain', 'The file was not found');
  });
});

describe('can load multiple sets', () => {
  beforeEach(() => {
    cy.server();

    cy.mockApi({
      apiPath: '/api/',
      mocksFolder: './mocks/a/',
      cache: true
    });

    cy.mockApi({
      apiPath: '/api/',
      mocksFolder: './mocks/b/',
      cache: true
    });
  });

  it('overides work', () => {
    cy.request({url: '/api/test/'})
      .should('equal', '{"hello":"world-b"}');

    cy.request({method: 'POST', url: '/api/test/'})
      .should('equal', '{"hello":"post-b"}');

    cy.request({method: 'PUT', url: '/api/test/'})
      .should('equal', '{"hello":"put-b"}');

    cy.request({method: 'DELETE', url: '/api/test/'})
      .should('equal', '{"hello":"delete-b"}');
  });

  it('originals work', () => {
    cy.request({url: '/api/catch/anything/'})
      .should('equal', '{"catch":"get"}');

    cy.request({method: 'POST', url: '/api/catch/at/'})
      .should('equal', '{"catch":"post"}');

    cy.request({method: 'PUT', url: '/api/catch/all/'})
      .should('equal', '{"catch":"put"}');

    cy.request({method: 'DELETE', url: '/api/catch/really/'})
      .should('equal', '{"catch":"delete"}');
  });
});