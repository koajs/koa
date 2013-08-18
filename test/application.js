
var request = require('supertest');
var assert = require('assert');
var http = require('http');
var koa = require('..');
var fs = require('fs');

describe('app.use(fn)', function(){
  it('should compose middleware', function(done){
    var app = koa();
    var calls = [];

    app.use(function(next){
      return function *(){
        calls.push(1);
        yield next;
        calls.push(6);
      }
    });

    app.use(function(next){
      return function *(){
        calls.push(2);
        yield next;
        calls.push(5);
      }
    });

    app.use(function(next){
      return function *(){
        calls.push(3);
        yield next;
        calls.push(4);
      }
    });

    var server = http.createServer(app.callback());

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

      app.use(function(next){
        return function *(){
          this.body = 'Hello';
        }
      });

      var server = http.createServer(app.callback());

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

      var server = http.createServer(app.callback());

      request(server)
      .get('/')
      .expect(404, done);
    })
  })

  describe('when .body is missing', function(){
    it('should respond with the associated status message', function(done){
      var app = koa();

      app.use(function(next){
        return function *(){
          this.status = 400;
          this.body = null;
        }
      });

      var server = http.createServer(app.callback());

      request(server)
      .get('/')
      .expect(400)
      .expect('Bad Request', done);
    })
  })

  describe('when .body is a string', function(){
    it('should respond', function(done){
      var app = koa();

      app.use(function(next){
        return function *(){
          this.body = 'Hello';
        }
      });

      var server = http.createServer(app.callback());

      request(server)
      .get('/')
      .expect('Hello', done);
    })
  })

  describe('when .body is a Buffer', function(){
    it('should respond', function(done){
      var app = koa();

      app.use(function(next){
        return function *(){
          this.body = new Buffer('Hello');
        }
      });

      var server = http.createServer(app.callback());

      request(server)
      .get('/')
      .expect('Hello', done);
    })
  })

  describe('when .body is a Stream', function(){
    it('should respond', function(done){
      var app = koa();

      app.use(function(next){
        return function *(){
          this.body = fs.createReadStream('package.json');
          this.set('Content-Type', 'application/json');
        }
      });

      var server = http.createServer(app.callback());

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
  })

  describe('when .body is an Object', function(){
    it('should respond with json', function(done){
      var app = koa();

      app.use(function(next){
        return function *(){
          this.body = { hello: 'world' };
        }
      });

      var server = http.createServer(app.callback());

      request(server)
      .get('/')
      .expect('Content-Type', 'application/json')
      .expect('{\n  "hello": "world"\n}', done);
    })

    describe('when app.jsonSpaces is altered', function(){
      it('should reflect in the formatting', function(done){
        var app = koa();

        app.jsonSpaces = 0;

        app.use(function(next){
          return function *(){
            this.body = { hello: 'world' };
          }
        });

        var server = http.createServer(app.callback());

        request(server)
        .get('/')
        .expect('Content-Type', 'application/json')
        .expect('{"hello":"world"}', done);
      })
    })
  })

  describe('when an error occurs', function(){
    it('should respond with 500', function(done){
      var app = koa();

      app.use(function(next){
        return function *(){
          throw new Error('boom!');
        }
      });

      var server = http.createServer(app.callback());

      request(server)
      .get('/')
      .expect(500, 'Internal Server Error')
      .end(done);
    })

    it('should be catchable', function(done){
      var app = koa();

      app.use(function(next){
        return function *(){
          try {
            yield next;
            this.body = 'Hello';
          } catch (err) {
            error = err;
            this.body = 'Got error';
          }
        }
      });

      app.use(function(next){
        return function *(){
          throw new Error('boom!');
          this.body = 'Oh no';
        }
      });

      var server = http.createServer(app.callback());

      request(server)
      .get('/')
      .expect(200, 'Got error')
      .end(done);
    })
  })
})

describe('app.context', function(){
  it('should merge regular object properties', function(done){
    var app = koa();
    app.context({
      a: 1,
      b: 2
    });

    app.use(function(next){
      return function *(){
        this.a.should.equal(1);
        this.b.should.equal(2);
        this.status = 204;
      }
    });

    var server = http.createServer(app.callback());

    request(server)
    .get('/')
    .expect(204)
    .end(done);
  })

  it('should merge accessor properties', function(done){
    var app = koa();
    app.context({
      get something() {
        return this._something || 'hi';
      },
      set something(value) {
        this._something = value;
      }
    });

    app.use(function(next){
      return function *(){
        this.something.should.equal('hi');
        this.something = 'hello';
        this.something.should.equal('hello');
        this.status = 204;
      }
    });

    var server = http.createServer(app.callback());

    request(server)
    .get('/')
    .expect(204)
    .end(done);
  })

  it('should merge multiple objects', function(done){
    var app = koa();
    app.context({
      a: 1
    });
    app.context({
      b: 2
    });

    app.use(function(next){
      return function *(){
        this.a.should.equal(1);
        this.b.should.equal(2);
        this.status = 204;
      }
    });

    var server = http.createServer(app.callback());

    request(server)
    .get('/')
    .expect(204)
    .end(done);
  })

  it('should not butcher the original prototype', function(done){
    var app1 = koa();
    var app2 = koa();

    app1.context({
      a: 1
    });

    app2.use(function(next){
      return function *(){
        assert.equal(this.a, undefined);
        this.status = 204;
      }
    });

    var server = http.createServer(app2.callback());

    request(server)
    .get('/')
    .expect(204)
    .end(done);
  })
})