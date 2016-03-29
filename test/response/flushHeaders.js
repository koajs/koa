
'use strict';

const AssertRequest = require('assert-request');
const assert = require('assert');
const Koa = require('../..');

describe('ctx.flushHeaders()', () => {
  it('should set headersSent', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.body = 'Body';
      ctx.status = 200;
      ctx.flushHeaders();
      assert(ctx.res.headersSent);
    });

    const request = AssertRequest(app);

    return request('/')
      .status(200)
      .body('Body');
  });

  it('should allow a response afterwards', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.status = 200;
      ctx.res.setHeader('Content-Type', 'text/plain');
      ctx.flushHeaders();
      ctx.body = 'Body';
    });

    const request = AssertRequest(app);

    return request('/')
      .status(200)
      .header('Content-Type', 'text/plain')
      .body('Body');
  });

  it('should send the correct status code', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.status = 401;
      ctx.res.setHeader('Content-Type', 'text/plain');
      ctx.flushHeaders();
      ctx.body = 'Body';
    });

    const request = AssertRequest(app);

    return request('/')
      .status(401)
      .header('Content-Type', 'text/plain')
      .body('Body');
  });

  it('should fail to set the headers after flushHeaders', () => {
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

    const request = AssertRequest(app);

    return request('/')
      .status(401)
      .header('Content-Type', 'text/plain')
      .header('X-Shouldnt-Work', null);
  });
});
