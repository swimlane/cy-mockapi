const request = (obj) =>
  new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open(obj.method || 'GET', obj.url);
    if (obj.headers) {
      Object.keys(obj.headers).forEach((key) => {
        xhr.setRequestHeader(key, obj.headers[key]);
      });
    }
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => resolve(xhr.statusText);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        let response = xhr.response;
        try {
          response = JSON.stringify(JSON.parse(xhr.response), null, 2);
        } catch (err) {
          /// nop
        }
      }
    };

    xhr.send(obj.body);
  });

Cypress.Commands.overwrite('request', (_, obj) => {
  if (typeof obj === 'string') obj = { url: obj };
  return cy.window().then((win) => {
    win.request = request;
    return win.request(obj);
  });
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
