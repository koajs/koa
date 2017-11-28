'use strict';

const assert = require('assert');
const Koa = require('../..');
const http = require('http');

describe('app.start', () => {
  describe('when server starts successfully', () => {
    it('should eventually return a listening http server', async () => {
      const app = new Koa();

      const server = await app.start();

      assert.equal(server instanceof http.Server, true);
      assert.equal(server.listening, true);

      await new Promise((resolve, reject) => {
        server.close(err => {
          if (err) return reject(err);
          resolve();
        });
      });
    });
  });

  describe('when port is already in use', () => {
    const app1 = new Koa();
    let server;
    beforeEach(async () => server = await app1.start());
    afterEach(done => server.close(done));

    it('should eventually throw an error', async () => {
      const app2 = new Koa();

      let err;
      try {
        await app2.start(server.address().port);
      } catch (e) {
        err = e;
      }
      assert(err);
    });
  });
});
