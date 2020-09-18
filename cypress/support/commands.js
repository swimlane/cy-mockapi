Cypress.Commands.overwrite('request', (_, obj) => {
  if (typeof obj === 'string') obj = { url: obj };
  return cy.window().then(win => win.request(obj));
});

