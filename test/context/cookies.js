
'use strict';

const request = require('supertest');
const koa = require('../..');

describe('ctx.cookies.set()', function(){
  it('should set an unsigned cookie', function(done){
    const app = koa();

    app.use(function *(next){
      this.cookies.set('name', 'jon');
      this.status = 204;
    })

    const server = app.listen();

    request(server)
    .get('/')
    .expect(204)
    .end(function(err, res){
      if (err) return done(err);

      res.headers['set-cookie'].some(function(cookie){
        return /^name=/.test(cookie);
      }).should.be.ok;

      done();
    })
  })

  describe('with .signed', function(){
    describe('when no .keys are set', function(){
      it('should error', function(done){
        const app = koa();

        app.use(function *(next){
          try {
            this.cookies.set('foo', 'bar', { signed: true });
          } catch (err) {
            this.body = err.message;
          }
        });

        request(app.listen())
        .get('/')
        .expect('.keys required for signed cookies', done);
      })
    })

    it('should send a signed cookie', function(done){
      const app = koa();

      app.keys = ['a', 'b'];

      app.use(function *(next){
        this.cookies.set('name', 'jon', { signed: true });
        this.status = 204;
      })

      const server = app.listen();

      request(server)
      .get('/')
      .expect(204)
      .end(function(err, res){
        if (err) return done(err);

        const cookies = res.headers['set-cookie'];

        cookies.some(function(cookie){
          return /^name=/.test(cookie);
        }).should.be.ok;

        cookies.some(function(cookie){
          return /^name\.sig=/.test(cookie);
        }).should.be.ok;

        done();
      })
    })
  })
})
