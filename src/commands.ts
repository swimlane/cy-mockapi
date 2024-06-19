/* eslint-disable @typescript-eslint/ban-ts-comment */

const METHODS = ['GET', 'POST', 'PUT', 'DELETE'];

/**
 * Log when an api call is not defined
 */
Cypress.Commands.add('logExtraApiCalls', (apiPath: string) => {
  METHODS.forEach((method) => {
    cy.intercept(
      {
        url: `${apiPath}**`,
        method,
      },
      (request: XMLHttpRequest) => {
        // @ts-ignore
        const message = `The ${request.method} API call to "${request.url}" is not mocked`;
        Cypress.log({
          name: 'logExtraApiCalls',
          message,
          consoleProps: () => {
            return request;
          },
        });
      }
    );
  });
});

/**
 * Fail test when api call is not defined
 */
Cypress.Commands.add('failExtraApiCalls', (apiPath) => {
  METHODS.forEach((method) => {
    cy.intercept(
      {
        url: `${apiPath}**`,
        method,
      },
      (request) => {
        const message = `The ${request.method} API call to "${request.url}" is not mocked`;
        Cypress.log({
          name: 'failExtraApiCalls',
          message,
          // @ts-ignore
          state: 'failed',
          ended: true,
          consoleProps: () => {
            return request;
          },
        });
        request.reply({
          statusCode: 404,
        });

        throw new Error(message);
      }
    );
  });
});

/**
 * Add routes
 */
Cypress.Commands.add(
  'mockApi',
  (options = { mocksFolder: '', apiPath: '', cache: true }) => {
    Cypress.log({
      name: 'Mock API',
      message: `Using ${options.mocksFolder} as API mock for ${options.apiPath}`,
      consoleProps: () => ({ options }),
    });

    cy.task('getMocks', options, { log: false })
      // @ts-ignore
      .then((mocks: Mocks[]) => {
        mocks.forEach((mock) => {
          cy.intercept(mock.matcher, (req) => {
            req.alias = mock.alias;
            if (mock.handler.redirect) {
              req.redirect(mock.handler.redirect, mock.handler.statusCode);
            } else {
              req.reply(mock.handler);
            }
          });
        });
      });
  }
);
