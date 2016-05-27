
'use strict';

const AssertRequest = require('assert-request');
const Koa = require('../..');

describe('ctx.onerror(err)', () => {
  it('should respond', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.body = 'something else';

      ctx.throw(418, 'boom');
    });

    const request = AssertRequest(app);

    return request('/')
      .status(418)
      .header('Content-Type', 'text/plain; charset=utf-8')
      .header('Content-Length', '4');
  });

  it('should unset all headers', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.set('Vary', 'Accept-Encoding');
      ctx.set('X-CSRF-Token', 'asdf');
      ctx.body = 'response';

      ctx.throw(418, 'boom');
    });

    const request = AssertRequest(app);

    return request('/')
      .status(418)
      .header('Content-Type', 'text/plain; charset=utf-8')
      .header('Content-Length', '4')
      .header('Vary', null)
      .header('X-CSRF-Token', null);
  });

  it('should set headers specified in the error', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.set('Vary', 'Accept-Encoding');
      ctx.set('X-CSRF-Token', 'asdf');
      ctx.body = 'response';

      throw Object.assign(new Error('boom'), {
        status: 418,
        expose: true,
        headers: {
          'X-New-Header': 'Value'
        }
      });
    });

    const request = AssertRequest(app);

    return request('/')
      .status(418)
      .header('Content-Type', 'text/plain; charset=utf-8')
      .header('X-New-Header', 'Value')
      .header('Vary', null)
      .header('X-CSRF-Token', null);
  });

  describe('when invalid err.status', () => {
    describe('not number', () => {
      it('should respond 500', () => {
        const app = new Koa();

        app.use((ctx, next) => {
          ctx.body = 'something else';
          const err = new Error('some error');
          err.status = 'notnumber';
          throw err;
        });

        const request = AssertRequest(app);

        return request('/')
          .status(500)
          .header('Content-Type', 'text/plain; charset=utf-8')
          .body('Internal Server Error');
      });
    });

    describe('not http status code', () => {
      it('should respond 500', () => {
        const app = new Koa();

        app.use((ctx, next) => {
          ctx.body = 'something else';
          const err = new Error('some error');
          err.status = 9999;
          throw err;
        });

        const request = AssertRequest(app);

        return request('/')
          .status(500)
          .header('Content-Type', 'text/plain; charset=utf-8')
          .body('Internal Server Error');
      });
    });
  });

  describe('when non-error thrown', () => {
    it('should response non-error thrown message', () => {
      const app = new Koa();

      app.use((ctx, next) => {
        throw 'string error'; // eslint-disable-line no-throw-literal
      });

      const request = AssertRequest(app);

      return request('/')
        .status(500)
        .header('Content-Type', 'text/plain; charset=utf-8')
        .body('Internal Server Error');
    });
  });
});
