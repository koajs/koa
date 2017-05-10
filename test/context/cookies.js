
'use strict';

const request = require('supertest');
const Koa = require('../..');

describe('ctx.cookies.set()', () => {
  it('should set an unsigned cookie', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.cookies.set('name', 'jon');
      ctx.status = 204;
    });

    const server = app.listen();

    return request(server)
      .get('/')
      .expect(204)
      .then(res => {
        res.headers['set-cookie'].some(cookie => /^name=/.test(cookie)).should.be.ok;
      });
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

        return request(app.listen())
          .get('/')
          .expect('.keys required for signed cookies');
      });
    });

    it('should send a signed cookie', () => {
      const app = new Koa();

      app.keys = ['a', 'b'];

      app.use((ctx, next) => {
        ctx.cookies.set('name', 'jon', { signed: true });
        ctx.status = 204;
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(204)
        .then(res => {
          const cookies = res.headers['set-cookie'];

          cookies.some(cookie => /^name=/.test(cookie)).should.be.ok;

          cookies.some(cookie => /^name\.sig=/.test(cookie)).should.be.ok;
        });
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

      const server = app.listen();

      return request(server)
        .get('/')
        .set('x-forwarded-proto', 'https') // mock secure
        .expect(204)
        .then(res => {
          const cookies = res.headers['set-cookie'];
          cookies.some(cookie => /^name=/.test(cookie)).should.be.ok;

          cookies.some(cookie => /^name\.sig=/.test(cookie)).should.be.ok;

          cookies.every(cookie => /secure/.test(cookie)).should.be.ok;
        });
    });
  });
});
