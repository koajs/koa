'use strict';

const assert = require('assert');
const Koa = require('../..');
const http = require('http');
const EventEmitter = require('events');

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

  describe('when server emits an error', () => {
    const error = new Error('EADDRINUSE');

    const originalCreateServer = http.createServer;
    beforeEach(() => {
      const server = new EventEmitter();
      http.createServer = () => server;
      server.listen = () => {
        process.nextTick(() => server.emit('error', error));
      };
    });
    afterEach(() => {
      http.createServer = originalCreateServer;
    });

    it('should eventually throw an error', async () => {
      const app = new Koa();

      try {
        await app.start();
      } catch (e) {
        assert.strictEqual(e, error);
      }
    });
  });
});
