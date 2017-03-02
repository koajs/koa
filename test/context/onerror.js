
'use strict';

const request = require('../helpers/request');
const Koa = require('../..');
const context = require('../helpers/context');

describe('ctx.onerror(err)', () => {
  it('should respond', async () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.body = 'something else';

      ctx.throw(418, 'boom');
    });

    const res = await request(app, '/');
    expect(res.status).toBe(418);
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(res.headers.get('content-length')).toBe('4');
  });

  it('should unset all headers', async () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.set('Vary', 'Accept-Encoding');
      ctx.set('X-CSRF-Token', 'asdf');
      ctx.body = 'response';

      ctx.throw(418, 'boom');
    });

    const res = await request(app, '/');
    expect(res.status).toBe(418);
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(res.headers.get('content-length')).toBe('4');
    expect(res.headers.has('vary')).toBe(false);
    expect(res.headers.has('x-csrf-token')).toBe(false);
  });

  it('should set headers specified in the error', async () => {
    const app = new Koa();
    app.onerror = () => {};

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

    const res = await request(app, '/');
    expect(res.status).toBe(418);
    expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    expect(res.headers.get('x-new-header')).toBe('Value');
    expect(res.headers.has('vary')).toBe(false);
    expect(res.headers.has('x-csrf-token')).toBe(false);
  });

  it('should ignore error after headerSent', done => {
    const app = new Koa();

    app.on('error', err => {
      err.message.should.equal('mock error');
      err.headerSent.should.equal(true);
      done();
    });

    app.use(async ctx => {
      ctx.status = 200;
      ctx.set('X-Foo', 'Bar');
      ctx.flushHeaders();
      await Promise.reject(new Error('mock error'));
      ctx.body = 'response';
    });

    request(app.listen())
    .get('/')
    .expect('X-Foo', 'Bar')
    .expect(200, () => {});
  });

  describe('when invalid err.status', () => {
    describe('not number', () => {
      it('should respond 500', async () => {
        const app = new Koa();
        app.onerror = () => {};

        app.use((ctx, next) => {
          ctx.body = 'something else';
          const err = new Error('some error');
          err.status = 'notnumber';
          throw err;
        });

        const res = await request(app, '/');
        expect(res.status).toBe(500);
        expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
        expect(await res.text()).toBe('Internal Server Error');
      });
    });

    describe('not http status code', () => {
      it('should respond 500', async () => {
        const app = new Koa();
        app.onerror = () => {};

        app.use((ctx, next) => {
          ctx.body = 'something else';
          const err = new Error('some error');
          err.status = 9999;
          throw err;
        });

        const res = await request(app, '/');
        expect(res.status).toBe(500);
        expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
        expect(await res.text()).toBe('Internal Server Error');
      });
    });
  });

  describe('when non-error thrown', () => {
    it('should response non-error thrown message', async () => {
      const app = new Koa();
      app.onerror = () => {};

      app.use((ctx, next) => {
        throw 'string error'; // eslint-disable-line no-throw-literal
      });

      const res = await request(app, '/');
      expect(res.status).toBe(500);
      expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
      expect(await res.text()).toBe('Internal Server Error');
    });

    it('should use res.getHeaderNames() accessor when available', () => {
      let removed = 0;
      const ctx = context();

      ctx.app.emit = () => {};
      ctx.res = {
        getHeaderNames: () => ['content-type', 'content-length'],
        removeHeader: () => removed++,
        end: () => {},
        emit: () => {}
      };

      ctx.onerror(new Error('error'));

      expect(removed).toBe(2);
    });
  });
});

