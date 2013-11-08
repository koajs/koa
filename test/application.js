
var request = require('supertest');
var assert = require('assert');
var http = require('http');
var koa = require('..');
var fs = require('fs');

describe('app.use(fn)', function(){
  it('should compose middleware', function(done){
    var app = koa();
    var calls = [];

    app.use(function *(next){
      calls.push(1);
      yield next;
      calls.push(6);
    });

    app.use(function *(next){
      calls.push(2);
      yield next;
      calls.push(5);
    });

    app.use(function *(next){
      calls.push(3);
      yield next;
      calls.push(4);
    });

    var server = app.listen();

    request(server)
    .get('/')
    .end(function(err){
      if (err) return done(err);
      calls.should.eql([1,2,3,4,5,6]);
      done();
    });
  })
})

describe('app.respond', function(){
  describe('when HEAD is used', function(){
    it('should not respond with the body', function(done){
      var app = koa();

      app.use(function *(){
        this.body = 'Hello';
      });

      var server = app.listen();

      request(server)
      .head('/')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        res.should.have.header('Content-Length', '5');
        assert(0 == res.text.length);
        done();
      });
    })
  })

  describe('when no middleware are present', function(){
    it('should 404', function(done){
      var app = koa();

      var server = app.listen();

      request(server)
      .get('/')
      .expect(404, done);
    })
  })

  describe('when .body is missing', function(){
    it('should respond with the associated status message', function(done){
      var app = koa();

      app.use(function *(){
        this.status = 400;
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect(400)
      .expect('Bad Request', done);
    })
  })

  describe('when .body is a string', function(){
    it('should respond', function(done){
      var app = koa();

      app.use(function *(){
        this.body = 'Hello';
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect('Hello', done);
    })
  })

  describe('when .body is a Buffer', function(){
    it('should respond', function(done){
      var app = koa();

      app.use(function *(){
        this.body = new Buffer('Hello');
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect('Hello', done);
    })
  })

  describe('when .body is a Stream', function(){
    it('should respond', function(done){
      var app = koa();

      app.use(function *(){
        this.body = fs.createReadStream('package.json');
        this.set('Content-Type', 'application/json');
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect('Content-Type', 'application/json')
      .end(function(err, res){
        if (err) return done(err);
        var pkg = require('../package');
        res.body.should.eql(pkg);
        done();
      });
    })

    it('should handle errors', function(done){
      var app = koa();

      app.use(function *(){
        this.set('Content-Type', 'application/json');
        this.body = fs.createReadStream('does not exist');
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(404)
      .end(done);
    })
  })

  describe('when .body is an Object', function(){
    it('should respond with json', function(done){
      var app = koa();

      app.use(function *(){
        this.body = { hello: 'world' };
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect('Content-Type', 'application/json')
      .expect('{\n  "hello": "world"\n}', done);
    })

    describe('when app.jsonSpaces is altered', function(){
      it('should reflect in the formatting', function(done){
        var app = koa();

        app.jsonSpaces = 0;

        app.use(function *(){
          this.body = { hello: 'world' };
        });

        var server = app.listen();

        request(server)
        .get('/')
        .expect('Content-Type', 'application/json')
        .expect('{"hello":"world"}', done);
      })
    })
  })

  describe('when an error occurs', function(){
    it('should emit "error" on the app', function(done){
      var app = koa();

      app.use(function *(){
        throw new Error('boom');
      });

      app.on('error', function(err){
        err.message.should.equal('boom');
        done();
      });

      request(app.listen())
      .get('/')
      .end(function(){});
    })

    describe('with an .expose property', function(){
      it('should expose the message', function(done){
        var app = koa();

        app.use(function *(){
          var err = new Error('sorry!');
          err.status = 403;
          err.expose = true;
          throw err;
        });

        request(app.listen())
        .get('/')
        .expect(403, 'sorry!')
        .end(done);
      })
    })

    describe('with a .status property', function(){
      it('should respond with .status', function(done){
        var app = koa();

        app.use(function *(){
          var err = new Error('s3 explodes');
          err.status = 403;
          throw err;
        });

        request(app.listen())
        .get('/')
        .expect(403, 'Forbidden')
        .end(done);
      })
    })

    it('should respond with 500', function(done){
      var app = koa();

      app.use(function *(){
        throw new Error('boom!');
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect(500, 'Internal Server Error')
      .end(done);
    })

    it('should be catchable', function(done){
      var app = koa();

      app.use(function *(next){
        try {
          yield next;
          this.body = 'Hello';
        } catch (err) {
          error = err;
          this.body = 'Got error';
        }
      });

      app.use(function *(next){
        throw new Error('boom!');
        this.body = 'Oh no';
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect(200, 'Got error')
      .end(done);
    })
  })
})
