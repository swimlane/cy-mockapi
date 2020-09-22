describe('mockApi', () => {
  before(() => {
    cy.visit('index.html');
  });

  beforeEach(() => {
    cy.server();

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

  describe('options', () => {
    it('query strings', () => {
      cy.request({url: '/api/query?q=1'})
        .should('equal', '{"query":"get"}');

      cy.request({url: '/api/query?q=2'})
        .should('equal', '{"query":"get-2"}');

      cy.request({method: 'POST', url: '/api/query?q=1'})
        .should('equal', '{"query":"post"}');

      cy.request({method: 'PUT', url: '/api/query?q=1'})
        .should('equal', '{"query":"put"}');

      cy.request({method: 'DELETE', url: '/api/query?q=1'})
        .should('equal', '{"query":"delete"}');
    });

    it('aliases', () => {
      cy.request({url: '/api/query?q=1'});
      cy.wait('@GET:query?*').its('response.body').should('deep.equal', { query: 'get' });

      cy.request({url: '/api/query?q=2'});
      cy.wait('@GET:query:2').its('response.body').should('deep.equal', { query: 'get-2' });

      cy.request({method: 'POST', url: '/api/query?q=1'});
      cy.wait('@postAlias').its('status').should('equal', 200);

      cy.request({method: 'PUT', url: '/api/query?q=1'});
      cy.wait('@PUT:query?*').its('method').should('equal', 'PUT');

      cy.request({method: 'DELETE', url: '/api/query?q=1'});
      cy.wait('@DELETE:query?*').its('constructor.name').should('equal', 'XMLHttpRequest');
    });

    it('status', () => {
      cy.request({url: '/api/query?q=1'});
      cy.wait('@GET:query?*').its('status').should('equal', 200);

      cy.request({url: '/api/query?q=2'});
      cy.wait('@GET:query:2').its('status').should('equal', 404);

      cy.request({method: 'PUT', url: '/api/query?q=1'});
      cy.wait('@PUT:query?*').its('status').should('equal', 201);
    });

    it('headers', () => {
      cy.request({url: '/api/query?q=1'});
      cy.wait('@GET:query?*').its('response.headers.x-token').should('equal', 'My X-Token');

      cy.request({url: '/api/query?q=2'});
      cy.wait('@GET:query:2').its('response.headers.x-token').should('not.exist');
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