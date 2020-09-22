/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    mockApi(options: any): Chainable<any>
    logExtraApiCalls(apiPath: string): Chainable<any>
    failExtraApiCalls(apiPath: string): Chainable<any>
  }
}