
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

  it('should not .writeHead when !socket.writable', () => {
    const app = new Koa();
    let failure = false;
    let ran = false;

    app.use((ctx, next) => {
      ctx.socket.writable = false;
      ctx.status = 204;

      ctx.res.writeHead =
      ctx.res.end = () => {
        failure = true;
      };
      ran = true;
    });

    let donePromise = new Promise((resolve, reject) => {
      const oldCallback = app.callback;
      app.callback = function(){
        const generatedCallback = oldCallback.apply(this, arguments);
        return function(){
          const promise = generatedCallback.apply(this, arguments);
          resolve(promise);
          return promise;
        };
      };
    });
    return Promise.race([
      request(app, '/'),
      donePromise.then(() => {
        expect(ran).toBe(true);
        expect(failure).toBe(false);
      })
    ]);
  });

  it('should set development env when NODE_ENV missing', () => {
    const NODE_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = '';
    const app = new Koa();
    process.env.NODE_ENV = NODE_ENV;
    expect(app.env).toBe('development');
  });
});
