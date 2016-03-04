
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('ctx.flushHeaders()', () => {
  it('should set headersSent', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.body = 'Body';
      ctx.status = 200;
      ctx.flushHeaders();
      assert(ctx.res.headersSent);
    });

    const server = app.listen();

    request(server)
      .get('/')
      .expect(200)
      .expect('Body', done);
  });

  it('should allow a response afterwards', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.status = 200;
      ctx.res.setHeader('Content-Type', 'text/plain');
      ctx.flushHeaders();
      ctx.body = 'Body';
    });

    const server = app.listen();
    request(server)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/plain')
      .expect('Body', done);
  });

  it('should send the correct status code', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.status = 401;
      ctx.res.setHeader('Content-Type', 'text/plain');
      ctx.flushHeaders();
      ctx.body = 'Body';
    });

    const server = app.listen();
    request(server)
      .get('/')
      .expect(401)
      .expect('Content-Type', 'text/plain')
      .expect('Body', done);
  });

  it('should fail to set the headers after flushHeaders', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.status = 401;
      ctx.res.setHeader('Content-Type', 'text/plain');
      ctx.flushHeaders();
      ctx.body = '';
      try {
        ctx.set('X-Shouldnt-Work', 'Value');
      } catch (err) {
        ctx.body += 'ctx.set fail ';
      }
      try {
        ctx.status = 200;
      } catch (err) {
        ctx.body += 'ctx.status fail ';
      }
      try {
        ctx.length = 10;
      } catch (err) {
        ctx.body += 'ctx.length fail';
      }
    });

    const server = app.listen();
    request(server)
      .get('/')
      .expect(401)
      .expect('Content-Type', 'text/plain')
      .expect('ctx.set fail ctx.status fail ctx.length fail', (err, res) => {
        assert(res.headers['x-shouldnt-work'] === undefined, 'header set after flushHeaders');
        done(err);
      });
  });
});
