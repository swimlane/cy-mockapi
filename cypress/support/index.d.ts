/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    fails(fn: Function, error: string): Chainable<any>
  }
}