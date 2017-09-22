
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('app', () => {
  it('should handle socket errors', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      // triggers ctx.socket.writable == false
      ctx.socket.emit('error', new Error('boom'));
    });

    app.on('error', err => {
      assert.equal(err.message, 'boom');
      done();
    });

    request(app.callback())
      .get('/')
      .end(() => {});
  });

  it('should not .writeHead when !socket.writable', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      // set .writable to false
      ctx.socket.writable = false;
      ctx.status = 204;
      // throw if .writeHead or .end is called
      ctx.res.writeHead =
      ctx.res.end = () => {
        throw new Error('response sent');
      };
    });

    // hackish, but the response should occur in a single tick
    setImmediate(done);

    request(app.callback())
      .get('/')
      .end(() => {});
  });

  it('should set development env when NODE_ENV missing', () => {
    const NODE_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = '';
    const app = new Koa();
    process.env.NODE_ENV = NODE_ENV;
    assert.equal(app.env, 'development');
  });
});
