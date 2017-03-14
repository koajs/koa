
'use strict';

const assert = require('assert');
const request = require('supertest');
const Koa = require('../..');
const context = require('../helpers/context');

describe('ctx.onerror(err)', () => {
  it('should respond', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.body = 'something else';

      ctx.throw(418, 'boom');
    });

    const server = app.listen();

    request(server)
      .get('/')
      .expect(418)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Content-Length', '4')
      .end(done);
  });

  it('should unset all headers', done => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.set('Vary', 'Accept-Encoding');
      ctx.set('X-CSRF-Token', 'asdf');
      ctx.body = 'response';

      ctx.throw(418, 'boom');
    });

    const server = app.listen();

    request(server)
      .get('/')
      .expect(418)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Content-Length', '4')
      .end((err, res) => {
        if (err) return done(err);

        res.headers.should.not.have.property('vary');
        res.headers.should.not.have.property('x-csrf-token');

        done();
      });
  });

  it('should set headers specified in the error', done => {
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

    const server = app.listen();

    request(server)
    .get('/')
    .expect(418)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('X-New-Header', 'Value')
    .end((err, res) => {
      if (err) return done(err);

      res.headers.should.not.have.property('vary');
      res.headers.should.not.have.property('x-csrf-token');

      done();
    });
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
      it('should respond 500', done => {
        const app = new Koa();

        app.use((ctx, next) => {
          ctx.body = 'something else';
          const err = new Error('some error');
          err.status = 'notnumber';
          throw err;
        });

        const server = app.listen();

        request(server)
          .get('/')
          .expect(500)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('Internal Server Error', done);
      });
    });

    describe('not http status code', () => {
      it('should respond 500', done => {
        const app = new Koa();

        app.use((ctx, next) => {
          ctx.body = 'something else';
          const err = new Error('some error');
          err.status = 9999;
          throw err;
        });

        const server = app.listen();

        request(server)
          .get('/')
          .expect(500)
          .expect('Content-Type', 'text/plain; charset=utf-8')
          .expect('Internal Server Error', done);
      });
    });
  });

  describe('when non-error thrown', () => {
    it('should response non-error thrown message', done => {
      const app = new Koa();

      app.use((ctx, next) => {
        throw 'string error'; // eslint-disable-line no-throw-literal
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(500)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect('Internal Server Error', done);
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

      assert.equal(removed, 2);
    });
  });
});
