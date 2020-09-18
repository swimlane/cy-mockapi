const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

/**
 * Log when an api call is not defined
 */
Cypress.Commands.add('logExtraApiCalls', (apiPath: string) => {
  METHODS.forEach(method => {
    cy.route({
      url: `${apiPath}**`,
      method,
      onResponse: (request: XMLHttpRequest) => {
        // @ts-ignore
        const message = `The ${request.method} API call to "${request.url}" is not mocked`;
        Cypress.log({
          name: 'logExtraApiCalls',
          message,
          consoleProps: () => {
            return request;
          }
        });
      }
    });
  });
});

/**
 * Fail test when api call is not defined
 */
Cypress.Commands.add('failExtraApiCalls', (apiPath) => {
  METHODS.forEach(method => {
    cy.route({
      url: `${apiPath}**`,
      method,
      status: 404,
      onRequest: (request: XMLHttpRequest) => {
        // @ts-ignore
        const message = `The ${request.method} API call to "${request.url}" is not mocked`;
        Cypress.log({
          name: 'failExtraApiCalls',
          message,
          // @ts-ignore
          state: 'failed',
          ended: true,
          consoleProps: () => {
            return request;
          }
        });
        throw new Error(message);
      }
    });
  });
});

/**
 * Add routes
 */
Cypress.Commands.add('mockApi', (options = {}) => {
  cy.task('getMocks', options, { log: false })
    // @ts-ignore
    .then((mocks: Mocks[]) => {
      mocks.forEach(mock => {
        cy.route(mock).as(mock.alias);
      });
    });
});