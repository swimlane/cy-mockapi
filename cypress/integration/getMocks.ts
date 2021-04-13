describe('getMocks', () => {
  it('gets files in simple format', () => {
    cy.task('getMocks', {
      mocksFolder: 'mocks/b',
      cache: false
    }, { log: false })
    .then(mocks => {
      expect(mocks).to.have.length(4);
      expect(mocks[0]).to.deep.equal({
        matcher: {
          method: "DELETE",
          url: "/api/test"
        },
        handler: {
          fixture: "mocks/b/test/delete.json",
        },
        alias: "DELETE:test",
      });
    });
  });

  it('gets files in aditional text', () => {
    cy.task('getMocks', {
      mocksFolder: 'mocks/a/alt',
      cache: false
    }, { log: false })
    .then(mocks => {
      expect(mocks).to.have.length(2);
      expect(mocks[0]).to.deep.equal({
        matcher: {
          method: "GET",
          url: "/api/"
        },
        handler: {
          fixture: "mocks/a/alt/get-alternative.json",
        },
        alias: "GET::alternative",
        alt: 'alternative'
      });
    });
  });

  it('gets files with prefix', () => {
    cy.task('getMocks', {
      mocksFolder: 'mocks/a/query',
      cache: false
    }, { log: false })
    .then(mocks => {
      expect(mocks).to.have.length(5);
      expect(mocks[0]).to.deep.equal({
        matcher: {
          method: "DELETE",
          url: "/api/string?q=*",
        },
        handler: {
          fixture: "mocks/a/query/string/--q=__.delete.json",
        },
        alias: "DELETE:string?q=*"
      });
    });
  });

  it('catch-all', () => {
    cy.task('getMocks', {
      mocksFolder: 'mocks/a/catch',
      cache: false
    }, { log: false })
    .then(mocks => {
      expect(mocks).to.have.length(4);
      expect(mocks[0]).to.deep.equal({ 
        matcher: {
          method: "DELETE",
          url: "/api/*",
        },
        handler: {
          fixture: "mocks/a/catch/__/delete.json",
        },
        alias: "DELETE:*"
      });
    });
  });
});