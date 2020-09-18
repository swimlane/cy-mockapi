import './commands';
import 'cypress-mockapi/commands';
import '@bahmutov/cy-api/support'

Cypress.on('fail', (error, runnable) => {
  if (runnable.shouldFailWith && error.message !== runnable.shouldFailWith) {
    return false;
  } else {
    throw error;
  }
});

it.fails = function fails(title, fn, message) {
  it(title, function() {
    this.test.shouldFailWith = message || title + ' expected to fail';
    fn.call(this);
    cy.then(() => {
      throw new Error(this.test.shouldFailWith);
    });
  });
}


