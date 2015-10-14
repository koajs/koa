
'use strict';

const request = require('supertest');
const Koa = require('../..');

describe('ctx.onerror(err)', function(){
  it('should respond', function(done){
    const app = new Koa();

    app.use(function(ctx, next){
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

  it('should unset all headers', function(done){
    const app = new Koa();

    app.use(function(ctx, next){
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
    .end(function(err, res){
      if (err) return done(err);

      res.headers.should.not.have.property('vary');
      res.headers.should.not.have.property('x-csrf-token');

      done();
    });
  });

  describe('when invalid err.status', function(){
    describe('not number', function(){
      it('should respond 500', function(done){
        const app = new Koa();

        app.use(function *(ctx, next){
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

    describe('not http status code', function(){
      it('should respond 500', function(done){
        const app = new Koa();

        app.use(function *(ctx, next){
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

  describe('when non-error thrown', function(){
    it('should response non-error thrown message', function(done){
      const app = new Koa();

      app.use(function(ctx, next){
        throw 'string error'; // eslint-disable-line no-throw-literal
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
