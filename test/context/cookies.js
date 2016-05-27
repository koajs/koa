
'use strict';

const AssertRequest = require('assert-request');
const Koa = require('../..');

describe('ctx.cookies.set()', () => {
  it('should set an unsigned cookie', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.cookies.set('name', 'jon');
      ctx.status = 204;
    });

    const request = AssertRequest(app);

    return request('/')
      .status(204)
      .header('Set-Cookie', /^name=/);
  });

  describe('with .signed', () => {
    describe('when no .keys are set', () => {
      it('should error', () => {
        const app = new Koa();

        app.use((ctx, next) => {
          try {
            ctx.cookies.set('foo', 'bar', { signed: true });
          } catch (err) {
            ctx.body = err.message;
          }
        });

        const request = AssertRequest(app);

        return request('/')
          .body('.keys required for signed cookies');
      });
    });

    it('should send a signed cookie', () => {
      const app = new Koa();

      app.keys = ['a', 'b'];

      app.use((ctx, next) => {
        ctx.cookies.set('name', 'jon', { signed: true });
        ctx.status = 204;
      });

      const request = AssertRequest(app);

      return request('/')
        .status(204)
        .header('Set-Cookie', /^name=/, true)
        .header('Set-Cookie', /^name\.sig=/, true);
    });
  });

  describe('with secure', () => {
    it('should get secure from request', () => {
      const app = new Koa();

      app.proxy = true;
      app.keys = ['a', 'b'];

      app.use(ctx => {
        ctx.cookies.set('name', 'jon', { signed: true });
        ctx.status = 204;
      });

      const request = AssertRequest(app);

      return request('/', {
        headers: { 'x-forwarded-proto': 'https' }
      })
        .status(204)
        .header('Set-Cookie', /^name=/, true)
        .header('Set-Cookie', /^name\.sig=/, true)
        .header('Set-Cookie', /secure/, false);
    });
  });
});
