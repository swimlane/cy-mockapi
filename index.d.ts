/* eslint-disable @typescript-eslint/no-unused-vars */

/// <reference types="cypress" />

interface Options {
  mocksFolder: string;
  apiPath: string;
  cache: boolean;
}
declare namespace Cypress {
  interface Chainable {
    mockApi(options: Options): Chainable<Element>
    logExtraApiCalls(apiPath: string): Chainable<Element>
    failExtraApiCalls(apiPath: string): Chainable<Element>
  }
}