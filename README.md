# @swimlane/cy-mockapi

Easily mock your REST API in [Cypress](https://www.cypress.io/) by putting responses in the fixtures directory tree.

## Installation and Setup

```sh
npm install --save-dev @swimlane/cy-mockapi
```

Import and setup the plugin in `cypress/plugins/index.js`:

```js
import { installPlugin } from '@swimlane/cy-mockapi/plugin'

module.exports = (on, config) => {
  installPlugin(on, config);
}
```

Import the Cypress commands in `cypress/support/index.js`

```js
import '@swimlane/cy-mockapi/commands';
```

## Usage

Add one or more folders in `cypress/fixtures` to act as the mock API.  Within this folder add files with the naming scheme:

```
{API PATH}/{METHOD}.{EXT}
```

For example:

```
cypress/fixtures/mocks
                  └── user
                      ├── get.json
                      ├── post.json
                      └── messages
                          ├── get.json
                          ├── delete.json
                          └── put.json
```

In your test files:

```js
describe('Some Feature', () => {
  beforeEach(() => {
    cy.server();

    cy.mockApi({
      apiPath: '/api/',
      mocksFolder: './mocks/',
      cache: true
    });
  });

  it('should do the thing', () => {
    // Your test code
  });
})
```

In this example, `@swimlane/cy-mockapi` will read the `cypress/fixtures/mocks` folder and stub responses to the API requests; functionally equivalent to:

```js
cy.route('GET', '/api/user', 'fixture:mocks/user/get.json').as('GET:user');
cy.route('POST', '/api/user', 'fixture:mocks/user/post.json').as('POST:user');
cy.route('GET', '/api/user/messages', 'fixture:mocks/user/messages/get.json').as('GET:user/messages');
cy.route('DELETE', '/api/user/messages', 'fixture:mocks/user/messages/delete.json').as('DELETE:user/messages');
cy.route('PUT', '/api/user/messages', 'fixture:mocks/user/messages/put.json').as('PUT:user/messages');
```

## Commands

### `cy.mockApi`

Reads and (optionally) caches the `mocksFolder` tree and sets up stubs.  Note that this does not read the fixtures themselves; instead it sets up the stubbing (internally using `cy.route`).  `cy.mockApi` may be called multiple times to mock different sets of fixtures or combine sets of fixtures.

#### Options

- `apiPath` - The API root path to mock.
- `mocksFolder` - The fixtures folder to use.
- `cache` - Boolean to use caching (caching is per unique `mocksFolder`)

### `cy.logExtraApiCalls`

Call `cy.logExtraApiCalls(apiPath)` after `cy.mockApi` to log requests and responses that are not stubbed by `cy.mockApi`.  This is useful for capturing responses while building out your mock files.

### `cy.failExtraApiCalls`

Call `cy.failExtraApiCalls(apiPath)` after `cy.mockApi` to log and fail on requests that are not stubbed by `cy.mockApi`.

## Fixture files

Fixture files (located within `mocksFolder`) in general should be named `{method}.{ext}` (for now only `json` and `txt` are supported).  The API path will be generated from the path as described in the example above.

### Wildcard slugs

To match against a route with a wildcard create a directory named or containing `__` (double underscore) in place of the wildcard (`*`).  For example, to mock the response of a GET request to `/api/user/*/profile`, create the fixture `user/__/profile/get.json`.

### Query string parameters

To match against Query string parameters create a directory or file containing `--` (double hyphen) in place of the `?`.  For example, to mock the response of a GET request to `/api/user?id=1`, create fixture `user--id=1/get.json` or `user/--id=1.get.json`.

### `options` files

For additional flexibility create `options.json` files within the `apiPath`.  These files are read by `cy.mockApi` and passed to `cy.route`.  For example, the following file:

```json
[
  {
    "url": "user?userid=*",
    "response": "delete-user.json",
    "method": "DELETE",
    "alias": "deleteUser",
  }
]
```

will setup file following route and stubbing:

```js
cy.route({
  url: '/api/user?userid=*',
  response: 'fx:mocks/delete-user.json',
  method: 'DELETE',
}).as('deleteUser');
```

See the [Cypress Documentation](https://docs.cypress.io/api/commands/route.html#Arguments) for more details on the options available.

## Acknowledgements

Inspired in part by https://github.com/namshi/mockserver.

## Credits

`cy-mockapi` is a [Swimlane](http://swimlane.com/) open-source project; we believe in giving back to the open-source community by sharing some of the projects we build for our application. Swimlane is an automated cyber security operations and incident response platform that enables cyber security teams to leverage threat intelligence, speed up incident response and automate security operations.