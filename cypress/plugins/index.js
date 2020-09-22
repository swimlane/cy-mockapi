/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  require('@swimlane/cy-mockapi').installPlugin(on, config);
}
