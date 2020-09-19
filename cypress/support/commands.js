Cypress.Commands.overwrite('request', (_, obj) => {
  if (typeof obj === 'string') obj = { url: obj };
  return cy.window().then(win => win.request(obj));
});

Cypress.Commands.add('fails', function (fn, message) {
  const failed = `Expected to fail with "${message}"`;
  const passed = `${failed}, but it did not fail`;

  cy.on('fail', (err) => {
    if (err.message === passed) {
      throw err;
    } else if (message) {
      expect(err.message).to.include(message, failed);
    }
    return false;
  });

  fn.call(this);
  cy.then(() => assert(false, passed));
});