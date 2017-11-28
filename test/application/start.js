'use strict';

const assert = require('assert');
const Koa = require('../..');
const http = require('http');

describe('app.start', () => {
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
