
'use strict';

const request = require('../helpers/request');
const Koa = require('../..');

describe('ctx.cookies.set()', () => {
  it('should set an unsigned cookie', async () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.cookies.set('name', 'jon');
      ctx.status = 204;
    });

    const res = await request(app, '/');
    expect(res.status).toBe(204);
    expect(res.headers.get('set-cookie')).toEqual(expect.stringMatching(/^name=/));
  });

  describe('with .signed', () => {
    describe('when no .keys are set', () => {
      it('should error', async () => {
        const app = new Koa();

        app.use((ctx, next) => {
          try {
            ctx.cookies.set('foo', 'bar', { signed: true });
          } catch (err) {
            ctx.body = err.message;
          }
        });

        const text = await (await request(app, '/')).text();
        expect(text).toBe('.keys required for signed cookies');
      });
    });

    it('should send a signed cookie', async () => {
      const app = new Koa();

      app.keys = ['a', 'b'];

      app.use((ctx, next) => {
        ctx.cookies.set('name', 'jon', { signed: true });
        ctx.status = 204;
      });

      const res = await request(app, '/');
      expect(res.status).toBe(204);
      expect(res.headers.get('set-cookie')).toEqual(expect.stringMatching(/^name=.*,name\.sig=/));
    });
  });

  describe('with secure', () => {
    it('should get secure from request', async () => {
      const app = new Koa();

      app.proxy = true;
      app.keys = ['a', 'b'];

      app.use(ctx => {
        ctx.cookies.set('name', 'jon', { signed: true });
        ctx.status = 204;
      });

      const res = await request(app, '/', {
        headers: { 'x-forwarded-proto': 'https' }
      });
      expect(res.status).toBe(204);
      expect(res.headers.get('set-cookie')).toEqual(expect.stringMatching(/^name=.*,name\.sig=/));
    });
  });
});
