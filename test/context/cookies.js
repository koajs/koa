
'use strict';

const request = require('supertest');
const Koa = require('../..');

describe('ctx.cookies.set()', () => {
  it('should set an unsigned cookie', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.cookies.set('name', 'jon');
      ctx.status = 204;
    });

    const server = app.listen();

    request(server)
      .get('/')
      .expect(204)
      .end((err, res) => {
        if (err) return done(err);

        res.headers['set-cookie'].some(cookie => /^name=/.test(cookie)).should.be.ok;

        done();
      });
  });

  describe('with .signed', () => {
    describe('when no .keys are set', () => {
      it('should error', done => {
        const app = new Koa();

        app.use((ctx, next) => {
          try {
            ctx.cookies.set('foo', 'bar', { signed: true });
          } catch (err) {
            ctx.body = err.message;
          }
        });

        request(app.listen())
          .get('/')
          .expect('.keys required for signed cookies', done);
      });
    });

    it('should send a signed cookie', done => {
      const app = new Koa();

      app.keys = ['a', 'b'];

      app.use((ctx, next) => {
        ctx.cookies.set('name', 'jon', { signed: true });
        ctx.status = 204;
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(204)
        .end((err, res) => {
          if (err) return done(err);

          const cookies = res.headers['set-cookie'];

          cookies.some(cookie => /^name=/.test(cookie)).should.be.ok;

          cookies.some(cookie => /^name\.sig=/.test(cookie)).should.be.ok;

          done();
        });
    });
  });

  describe('with secure', () => {
    it('should get secure from request', done => {
      const app = new Koa();

      app.proxy = true;
      app.keys = ['a', 'b'];

      app.use(ctx => {
        ctx.cookies.set('name', 'jon', { signed: true });
        ctx.status = 204;
      });

      const server = app.listen();

      request(server)
      .get('/')
      .set('x-forwarded-proto', 'https') // mock secure
      .expect(204)
      .end((err, res) => {
        if (err) return done(err);

        const cookies = res.headers['set-cookie'];
        cookies.some(cookie => /^name=/.test(cookie)).should.be.ok;

        cookies.some(cookie => /^name\.sig=/.test(cookie)).should.be.ok;

        cookies.every(cookie => /secure/.test(cookie)).should.be.ok;

        done();
      });
    });
  });
});
