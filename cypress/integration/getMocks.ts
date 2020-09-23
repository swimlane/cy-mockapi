describe('getMocks', () => {
  it('gets files in simple format', () => {
    cy.task('getMocks', {
      mocksFolder: 'mocks/b',
      cache: false
    }, { log: false })
    .then(mocks => {
      expect(mocks).to.have.length(4);
      expect(mocks[0]).to.deep.equal({ 
        alias: "DELETE:test",
        method: "DELETE",
        response: "fx:mocks/b/test/delete.json",
        url: "/api/test",
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
        alias: "GET::alternative",
        alt: 'alternative',
        method: "GET",
        response: "fx:mocks/a/alt/get-alternative.json",
        url: "/api/",
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
        alias: "DELETE:string?q=*",
        method: "DELETE",
        response: "fx:mocks/a/query/string/--q=__.delete.json",
        url: "/api/string?q=*",
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
        alias: "DELETE:*",
        method: "DELETE",
        response: "fx:mocks/a/catch/__/delete.json",
        url: "/api/*",
      });
    });
  });
});