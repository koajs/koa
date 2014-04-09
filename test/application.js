
var request = require('supertest');
var assert = require('assert');
var http = require('http');
var koa = require('..');
var fs = require('fs');

describe('app', function(){
  it('should handle socket errors', function(done){
    var app = koa();

    app.use(function *(next){
      // triggers this.socket.writable == false
      this.socket.emit('error', new Error('boom'));
    });

    app.on('error', function(err){
      err.message.should.equal('boom');
      done();
    });

    request(app.listen())
    .get('/')
    .end(function(){});
  })

  it('should not .writeHead when !socket.writable', function(done){
    var app = koa();

    app.use(function *(next){
      // set .writable to false
      this.socket.writable = false;
      this.status = 204;
      // throw if .writeHead or .end is called
      this.res.writeHead =
      this.res.end = function(){
        throw new Error('response sent');
      };
    })

    // hackish, but the response should occur in a single ticket
    setImmediate(done);

    request(app.listen())
    .get('/')
    .end(function(){});
  })
})

describe('app.toJSON()', function(){
  it('should work', function(){
    var app = koa();
    var obj = app.toJSON();

    obj.should.eql({
      outputErrors: false,
      subdomainOffset: 2,
      poweredBy: true,
      env: 'test'
    });
  })
})

describe('app.inspect()', function(){
  it('should work', function(){
    var app = koa();
    var util = require('util');
    var str = util.inspect(app);
  })
})

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

  it('should error when a non-generator function is passed', function(done){
    var app = koa();

    try {
      app.use(function(){});
    } catch (err) {
      err.message.should.equal('app.use() requires a generator function');
      done();
    }
  })
})

describe('app.respond', function(){
  describe('when this.respond === false', function(){
    it('should bypass app.respond', function(done){
      var app = koa();

      app.use(function *(){
        this.body = 'Hello';
        this.respond = false;

        var res = this.res;
        setImmediate(function(){
          res.setHeader('Content-Type', 'text/plain');
          res.end('lol');
        })
      })

      var server = app.listen();

      request(server)
      .get('/')
      .expect(200)
      .expect('lol')
      .end(done);
    })
  })

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

    it('should respond with a 404 if no body was set', function(done){
      var app = koa();

      app.use(function *(){

      })

      var server = app.listen();

      request(server)
      .head('/')
      .expect(404, done);
    })

    it('should respond with a 200 if body = ""', function(done){
      var app = koa();

      app.use(function *(){
        this.body = '';
      })

      var server = app.listen();

      request(server)
      .head('/')
      .expect(200, done);
    })

    it('should not overwrite the content-type', function(done){
      var app = koa();

      app.use(function *(){
        this.status = 200;
        this.type = 'application/javascript';
      })

      var server = app.listen();

      request(server)
      .head('/')
      .expect('content-type', 'application/javascript')
      .expect(200, done);
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

  describe('when res has already been written to', function(){

    it('should not cause an app error', function(done){
      var app = koa();

      app.use(function *(next){
        var res = this.res;
        res.setHeader("Content-Type", "text/html")
        res.status = 200;
        res.write('Hello');
        setTimeout(function(){
          res.end("Goodbye")
        }, 0);
      });

      var errorCaught = false;

      app.on('error', function(err){
        errorCaught = err;
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        if (errorCaught) return done(errorCaught);
        done();
      });
    })

    it('should send the right body', function(done){
      var app = koa();

      app.use(function *(next){
        var res = this.res;
        res.setHeader("Content-Type", "text/html")
        res.status = 200;
        res.write('Hello');
        setTimeout(function(){
          res.end("Goodbye")
        }, 0);
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect(200)
      .expect('HelloGoodbye', done);
    })
  })

  describe('when .body is missing', function(){
    describe('with status=400', function(){
      it('should respond with the associated status message', function(done){
        var app = koa();

        app.use(function *(){
          this.status = 400;
        });

        var server = app.listen();

        request(server)
        .get('/')
        .expect(400)
        .expect('content-length', '11')
        .expect('Bad Request', done);
      })
    })

    describe('with status=204', function(){
      it('should respond without a body', function(done){
        var app = koa();

        app.use(function *(){
          this.status = 204;
        })

        var server = app.listen();

        request(server)
        .get('/')
        .expect(204)
        .expect('')
        .end(function(err, res){
          if (err) return done(err);

          res.header.should.not.have.property('content-type');
          done();
        })
      })
    })

    describe('with status=205', function(){
      it('should respond without a body', function(done){
        var app = koa();

        app.use(function *(){
          this.status = 205;
        })

        var server = app.listen();

        request(server)
        .get('/')
        .expect(205)
        .expect('')
        .end(function(err, res){
          if (err) return done(err);

          res.header.should.not.have.property('content-type');
          done();
        })
      })
    })

    describe('with status=304', function(){
      it('should respond without a body', function(done){
        var app = koa();

        app.use(function *(){
          this.status = 304;
        })

        var server = app.listen();

        request(server)
        .get('/')
        .expect(304)
        .expect('')
        .end(function(err, res){
          if (err) return done(err);

          res.header.should.not.have.property('content-type');
          done();
        })
      })
    })
  })

  describe('when .body is a null', function(){
    it('should respond 204 by default', function(done){
      var app = koa();

      app.use(function *(){
        this.body = null;
      })

      var server = app.listen();

      request(server)
      .get('/')
      .expect(204)
      .expect('')
      .end(function(err, res){
        if (err) return done(err);

        res.header.should.not.have.property('content-type');
        done();
      })
    })

    it('should respond 204 with status=200', function(done){
      var app = koa();

      app.use(function *(){
        this.status=200;
        this.body = null;
      })

      var server = app.listen();

      request(server)
      .get('/')
      .expect(204)
      .expect('')
      .end(function(err, res){
        if (err) return done(err);

        res.header.should.not.have.property('content-type');
        done();
      })
    })

    it('should respond 205 with status=205', function(done){
      var app = koa();

      app.use(function *(){
        this.status=205;
        this.body = null;
      })

      var server = app.listen();

      request(server)
      .get('/')
      .expect(205)
      .expect('')
      .end(function(err, res){
        if (err) return done(err);

        res.header.should.not.have.property('content-type');
        done();
      })
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

    it('should handle errors when no content status', function(done){
      var app = koa();

      app.use(function *(){
        this.status = 204;
        this.body = fs.createReadStream('does not exist');
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect(204, done);
    })

    it('should handle all intermediate stream body errors', function(done){
      var app = koa();

      app.use(function *(){
        this.body = fs.createReadStream('does not exist');
        this.body = fs.createReadStream('does not exist');
        this.body = fs.createReadStream('does not exist');
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect(404, done);
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
      .expect('{"hello":"world"}', done);
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

  describe('when status and body property', function(){
    it('should 200', function(done){
      var app = koa();

      app.use(function *(){
        this.status = 304;
        this.body = 'hello';
        this.status = 200;
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect(200)
      .expect('hello', done);
    })

    it('should 204', function(done) {
      var app = koa();

      app.use(function *(){
        this.status = 200;
        this.body = 'hello';
        this.set('content-type', 'text/plain; charset=utf8');
        this.status = 204;
      });

      var server = app.listen();

      request(server)
      .get('/')
      .expect(204)
      .end(function (err, res) {
        res.should.not.have.header('content-type');
        done(err);
      });
    });
  })
})

describe('app.context', function(){
  var app1 = koa();
  app1.context.message = 'hello';
  var app2 = koa();

  it('should merge properties', function(done){
    app1.use(function *(next){
      assert.equal(this.message, 'hello')
      this.status = 204
    });

    request(app1.listen())
    .get('/')
    .expect(204, done);
  })

  it('should not affect the original prototype', function(done){
    app2.use(function *(next){
      assert.equal(this.message, undefined)
      this.status = 204;
    });

    request(app2.listen())
    .get('/')
    .expect(204, done);
  })
})

describe('app.request', function(){
  var app1 = koa();
  app1.request.message = 'hello';
  var app2 = koa();

  it('should merge properties', function(done){
    app1.use(function *(next){
      assert.equal(this.request.message, 'hello')
      this.status = 204
    });

    request(app1.listen())
    .get('/')
    .expect(204, done);
  })

  it('should not affect the original prototype', function(done){
    app2.use(function *(next){
      assert.equal(this.request.message, undefined)
      this.status = 204;
    });

    request(app2.listen())
    .get('/')
    .expect(204, done);
  })
})

describe('app.response', function(){
  var app1 = koa();
  app1.response.message = 'hello';
  var app2 = koa();

  it('should merge properties', function(done){
    app1.use(function *(next){
      assert.equal(this.response.message, 'hello')
      this.status = 204
    });

    request(app1.listen())
    .get('/')
    .expect(204, done);
  })

  it('should not affect the original prototype', function(done){
    app2.use(function *(next){
      assert.equal(this.response.message, undefined)
      this.status = 204;
    });

    request(app2.listen())
    .get('/')
    .expect(204, done);
  })
})
