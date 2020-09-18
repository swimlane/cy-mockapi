// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

it.fails = function (title, fn) {
  it(title, function() {
    fn.call(this);
    setTimeout((test) => {
      if (test.state === 'failed') {
        test.state = 'passed';
      } else {
        throw new Error('fail');
      }
    }, 0, this.test);
  });
}

Cypress.Commands.overwrite('request', (_, obj) => {
  if (typeof obj === 'string') obj = { url: obj };
  return cy.window().then(win => win.request(obj));
});

