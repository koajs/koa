'use strict';

const request = require('../helpers/request');
const eventToPromise = require('event-to-promise');
const Koa = require('../..');

describe('app', () => {
  it('should handle socket errors', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      // triggers ctx.socket.writable == false
      ctx.socket.emit('error', new Error('boom'));
    });

    app.onerror = () => {};

    return Promise.all([
      eventToPromise(app, 'error')
        .then(err => expect(err.message).toBe('boom')),
      request(app, '/').catch(() => {})
    ]);
  });

  // TODO #848
  it.skip('should not .writeHead when !socket.writable', done => {
    const app = new Koa();
    let failure = false;

    app.use((ctx, next) => {
      ctx.socket.writable = false;
      ctx.status = 204;

      ctx.res.writeHead =
      ctx.res.end = () => {
        failure = true;
      };
    });

    request({
      callback: (req, res) => {
        app.callback(req, res)
          .then(() => expect(failure).toBe(false))
          .then(done)
          .catch(done);
      }
    }, '/');
  });

  it('should set development env when NODE_ENV missing', () => {
    const NODE_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = '';
    const app = new Koa();
    process.env.NODE_ENV = NODE_ENV;
    expect(app.env).toBe('development');
  });
});
