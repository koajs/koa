
'use strict';

var assert = require('assert');
var request = require('supertest');
var koa = require('../..');
var context = require('../context');

describe('ctx.onerror(err)', function(){
  it('should respond', function(done){
    var app = koa();

    app.use(function *(next){
      this.body = 'something else';

      this.throw(418, 'boom');
    })

    var server = app.listen();

    request(server)
    .get('/')
    .expect(418)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('Content-Length', '4')
    .end(done);
  })

  it('should unset all headers', function(done){
    var app = koa();

    app.use(function *(next){
      this.set('Vary', 'Accept-Encoding');
      this.set('X-CSRF-Token', 'asdf');
      this.body = 'response';

      this.throw(418, 'boom');
    })

    var server = app.listen();

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
    })
  })

  it('should set headers specified in the error', function(done){
    var app = koa();

    app.use(function *(next){
      this.set('Vary', 'Accept-Encoding');
      this.set('X-CSRF-Token', 'asdf');
      this.body = 'response';

      throw Object.assign(new Error('boom'), {
        status: 418,
        expose: true,
        headers: {
          'X-New-Header': 'Value'
        }
      })
    })

    var server = app.listen();

    request(server)
    .get('/')
    .expect(418)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('X-New-Header', 'Value')
    .end(function(err, res){
      if (err) return done(err);

      res.headers.should.not.have.property('vary');
      res.headers.should.not.have.property('x-csrf-token');

      done();
    })
  })

  it('should ignore error after headerSent', function(done){
    var app = koa();

    app.on('error', function(err){
      err.message.should.equal('mock error');
      err.headerSent.should.equal(true);
      done();
    });

    app.use(function*() {
      this.status = 200;
      this.set('X-Foo', 'Bar');
      this.res.flushHeaders();
      yield Promise.reject(new Error('mock error'));
      this.body = 'response';
    });

    request(app.listen())
    .get('/')
    .expect('X-Foo', 'Bar')
    .expect(200, function() {});
  })

  describe('when invalid err.status', function(){
    describe('not number', function(){
      it('should respond 500', function(done){
        var app = koa();

        app.use(function *(next){
          this.body = 'something else';
          var err = new Error('some error');
          err.status = 'notnumber';
          throw err;
        })

        var server = app.listen();

        request(server)
        .get('/')
        .expect(500)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect('Internal Server Error', done);
      })
    })

    describe('not http status code', function(){
      it('should respond 500', function(done){
        var app = koa();

        app.use(function *(next){
          this.body = 'something else';
          var err = new Error('some error');
          err.status = 9999;
          throw err;
        })

        var server = app.listen();

        request(server)
        .get('/')
        .expect(500)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect('Internal Server Error', done);
      })
    })
  })

  describe('when non-error thrown', function(){
    it('should response non-error thrown message', function(done){
      var app = koa();

      app.use(function *(next){
        throw 'string error';
      })

      var server = app.listen();

      request(server)
      .get('/')
      .expect(500)
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect('Internal Server Error', done);
    })
  })

  it('should use res.getHeaderNames when available', function(){
    var removed = 0;
    var ctx = context();

    ctx.app.emit = function() {};
    ctx.res = {
      getHeaderNames: function() { return ['content-type', 'content-length'] },
      removeHeader: function() { removed++ },
      end: function() {},
      emit: function() {}
    };

    ctx.onerror(new Error('error'));

    assert.equal(removed, 2);
  })
})
