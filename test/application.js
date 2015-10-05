
const stderr = require('test-console').stderr;
const request = require('supertest');
const statuses = require('statuses');
const assert = require('assert');
const http = require('http');
const koa = require('..');
const fs = require('fs');
const AssertionError = assert.AssertionError;

describe('app', function(){
  it('should handle socket errors', function(done){
    const app = koa();

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
    const app = koa();

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

    // hackish, but the response should occur in a single tick
    setImmediate(done);

    request(app.listen())
    .get('/')
    .end(function(){});
  })

  it('should set development env when NODE_ENV missing', function(){
    const NODE_ENV = process.env.NODE_ENV;
    process.env.NODE_ENV = '';
    const app = koa();
    process.env.NODE_ENV = NODE_ENV;
    assert.equal(app.env, 'development');
  })
})

describe('app.toJSON()', function(){
  it('should work', function(){
    const app = koa();
    const obj = app.toJSON();

    obj.should.eql({
      subdomainOffset: 2,
      env: 'test'
    });
  })
})

describe('app.inspect()', function(){
  it('should work', function(){
    const app = koa();
    const util = require('util');
    const str = util.inspect(app);
  })
})

describe('app.use(fn)', function(){
  it('should compose middleware', function(done){
    const app = koa();
    const calls = [];

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

    const server = app.listen();

    request(server)
    .get('/')
    .expect(404)
    .end(function(err){
      if (err) return done(err);
      calls.should.eql([1,2,3,4,5,6]);
      done();
    });
  })

  it('should error when a non-generator function is passed', function(){
    const app = koa();

    try {
      app.use(function(){});
    } catch (err) {
      err.message.should.equal('app.use() requires a generator function');
    }
  })

  it('should not error when a non-generator function is passed when .experimental=true', function(){
    const app = koa();
    app.experimental = true;
    app.use(function(){});
  })
})

describe('app.onerror(err)', function(){
  it('should throw an error if a non-error is given', function(done){
    const app = koa();

    try {
      app.onerror('foo');

      should.fail();
    } catch (err) {
      err.should.be.instanceOf(AssertionError);
      err.message.should.equal('non-error thrown: foo');
    }

    done();
  })

  it('should do nothing if status is 404', function(done){
    const app = koa();
    const err = new Error();

    err.status = 404;

    const output = stderr.inspectSync(function() {
      app.onerror(err);
    });

    output.should.eql([]);

    done();
  })

  it('should do nothing if env is test', function(done){
    const app = koa();
    const err = new Error();

    const output = stderr.inspectSync(function() {
      app.onerror(err);
    });

    output.should.eql([]);

    done();
  })

  it('should log the error to stderr', function(done){
    const app = koa();
    app.env = 'dev';

    const err = new Error();
    err.stack = 'Foo';

    const output = stderr.inspectSync(function() {
      app.onerror(err);
    });

    output.should.eql(["\n", "  Foo\n", "\n"]);

    done();
  })

  it('should use err.toString() instad of err.stack', function(done){
    const app = koa();
    app.env = 'dev';

    const err = new Error('mock stack null');
    err.stack = null;

    const output = stderr.inspectSync(function() {
      app.onerror(err);
    });

    output.should.eql(["\n", "  Error: mock stack null\n", "\n"]);

    done();
  })
})

describe('app.respond', function(){
  describe('when this.respond === false', function(){
    it('should bypass app.respond', function(done){
      const app = koa();

      app.use(function *(){
        this.body = 'Hello';
        this.respond = false;

        const res = this.res;
        res.statusCode = 200;
        setImmediate(function(){
          res.setHeader('Content-Type', 'text/plain');
          res.end('lol');
        })
      })

      const server = app.listen();

      request(server)
      .get('/')
      .expect(200)
      .expect('lol')
      .end(done);
    })
  })

  describe('when HEAD is used', function(){
    it('should not respond with the body', function(done){
      const app = koa();

      app.use(function *(){
        this.body = 'Hello';
      });

      const server = app.listen();

      request(server)
      .head('/')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        res.should.have.header('Content-Type', 'text/plain; charset=utf-8');
        res.should.have.header('Content-Length', '5');
        assert(0 == res.text.length);
        done();
      });
    })

    it('should keep json headers', function(done){
      const app = koa();

      app.use(function *(){
        this.body = { hello: 'world' };
      });

      const server = app.listen();

      request(server)
      .head('/')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        res.should.have.header('Content-Type', 'application/json; charset=utf-8');
        res.should.have.header('Content-Length', '17');
        assert(0 == res.text.length);
        done();
      });
    })

    it('should keep string headers', function(done){
      const app = koa();

      app.use(function *(){
        this.body = 'hello world';
      });

      const server = app.listen();

      request(server)
      .head('/')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        res.should.have.header('Content-Type', 'text/plain; charset=utf-8');
        res.should.have.header('Content-Length', '11');
        assert(0 == res.text.length);
        done();
      });
    })

    it('should keep buffer headers', function(done){
      const app = koa();

      app.use(function *(){
        this.body = new Buffer('hello world');
      });

      const server = app.listen();

      request(server)
      .head('/')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        res.should.have.header('Content-Type', 'application/octet-stream');
        res.should.have.header('Content-Length', '11');
        assert(0 == res.text.length);
        done();
      });
    })

    it('should respond with a 404 if no body was set', function(done){
      const app = koa();

      app.use(function *(){

      })

      const server = app.listen();

      request(server)
      .head('/')
      .expect(404, done);
    })

    it('should respond with a 200 if body = ""', function(done){
      const app = koa();

      app.use(function *(){
        this.body = '';
      })

      const server = app.listen();

      request(server)
      .head('/')
      .expect(200, done);
    })

    it('should not overwrite the content-type', function(done){
      const app = koa();

      app.use(function *(){
        this.status = 200;
        this.type = 'application/javascript';
      })

      const server = app.listen();

      request(server)
      .head('/')
      .expect('content-type', /application\/javascript/)
      .expect(200, done);
    })
  })

  describe('when no middleware are present', function(){
    it('should 404', function(done){
      const app = koa();

      const server = app.listen();

      request(server)
      .get('/')
      .expect(404, done);
    })
  })

  describe('when res has already been written to', function(){
    it('should not cause an app error', function(done){
      const app = koa();

      app.use(function *(next){
        const res = this.res;
        this.status = 200;
        res.setHeader("Content-Type", "text/html")
        res.write('Hello');
        setTimeout(function(){
          res.end("Goodbye")
        }, 0);
      });

      const errorCaught = false;

      app.on('error', function(err){
        errorCaught = err;
      });

      const server = app.listen();

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
      const app = koa();

      app.use(function *(next){
        const res = this.res;
        this.status = 200;
        res.setHeader("Content-Type", "text/html")
        res.write('Hello');
        setTimeout(function(){
          res.end("Goodbye");
        }, 0);
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect(200)
      .expect('HelloGoodbye', done);
    })
  })

  describe('when .body is missing', function(){
    describe('with status=400', function(){
      it('should respond with the associated status message', function(done){
        const app = koa();

        app.use(function *(){
          this.status = 400;
        });

        const server = app.listen();

        request(server)
        .get('/')
        .expect(400)
        .expect('Content-Length', 11)
        .expect('Bad Request', done);
      })
    })

    describe('with status=204', function(){
      it('should respond without a body', function(done){
        const app = koa();

        app.use(function *(){
          this.status = 204;
        })

        const server = app.listen();

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
        const app = koa();

        app.use(function *(){
          this.status = 205;
        })

        const server = app.listen();

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
        const app = koa();

        app.use(function *(){
          this.status = 304;
        })

        const server = app.listen();

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

    describe('with custom status=700', function(){
      it('should respond with the associated status message', function (done){
        const app = koa();
        statuses['700'] = 'custom status';

        app.use(function *(){
          this.status = 700;
        })

        const server = app.listen();

        request(server)
        .get('/')
        .expect(700)
        .expect('custom status')
        .end(function(err, res){
          if (err) return done(err);
          res.res.statusMessage.should.equal('custom status');
          done();
        })
      })
    })

    describe('with custom statusMessage=ok', function(){
      it('should respond with the custom status message', function (done){
        const app = koa();

        app.use(function *(){
          this.status = 200;
          this.message = 'ok';
        })

        const server = app.listen();

        request(server)
        .get('/')
        .expect(200)
        .expect('ok')
        .end(function(err, res){
          if (err) return done(err);
          res.res.statusMessage.should.equal('ok');
          done();
        })
      })
    })

    describe('with custom status without message', function (){
      it('should respond with the status code number', function (done){
        const app = koa();

        app.use(function *(){
          this.res.statusCode = 701;
        })

        const server = app.listen();

        request(server)
        .get('/')
        .expect(701)
        .expect('701', done);
      })
    })
  })

  describe('when .body is a null', function(){
    it('should respond 204 by default', function(done){
      const app = koa();

      app.use(function *(){
        this.body = null;
      })

      const server = app.listen();

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
      const app = koa();

      app.use(function *(){
        this.status = 200;
        this.body = null;
      })

      const server = app.listen();

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
      const app = koa();

      app.use(function *(){
        this.status = 205;
        this.body = null;
      })

      const server = app.listen();

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

    it('should respond 304 with status=304', function(done){
      const app = koa();

      app.use(function *(){
        this.status = 304;
        this.body = null;
      })

      const server = app.listen();

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

  describe('when .body is a string', function(){
    it('should respond', function(done){
      const app = koa();

      app.use(function *(){
        this.body = 'Hello';
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect('Hello', done);
    })
  })

  describe('when .body is a Buffer', function(){
    it('should respond', function(done){
      const app = koa();

      app.use(function *(){
        this.body = new Buffer('Hello');
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect('Hello', done);
    })
  })

  describe('when .body is a Stream', function(){
    it('should respond', function(done){
      const app = koa();

      app.use(function *(){
        this.body = fs.createReadStream('package.json');
        this.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res){
        if (err) return done(err);
        const pkg = require('../package');
        res.should.not.have.header('Content-Length');
        res.body.should.eql(pkg);
        done();
      });
    })

    it('should strip content-length when overwriting', function(done){
      const app = koa();

      app.use(function *(){
        this.body = 'hello';
        this.body = fs.createReadStream('package.json');
        this.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res){
        if (err) return done(err);
        const pkg = require('../package');
        res.should.not.have.header('Content-Length');
        res.body.should.eql(pkg);
        done();
      })
    })

    it('should keep content-length if not overwritten', function(done){
      const app = koa();

      app.use(function *(){
        this.length = fs.readFileSync('package.json').length;
        this.body = fs.createReadStream('package.json');
        this.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res){
        if (err) return done(err);
        const pkg = require('../package');
        res.should.have.header('Content-Length');
        res.body.should.eql(pkg);
        done();
      })
    })

    it('should keep content-length if overwritten with the same stream', function(done){
      const app = koa();

      app.use(function *(){
        this.length = fs.readFileSync('package.json').length;
        const stream = fs.createReadStream('package.json');
        this.body = stream;
        this.body = stream;
        this.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res){
        if (err) return done(err);
        const pkg = require('../package');
        res.should.have.header('Content-Length');
        res.body.should.eql(pkg);
        done();
      })
    })

    it('should handle errors', function(done){
      const app = koa();

      app.use(function *(){
        this.set('Content-Type', 'application/json; charset=utf-8');
        this.body = fs.createReadStream('does not exist');
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect('Content-Type', 'text/plain; charset=utf-8')
      .expect(404)
      .end(done);
    })

    it('should handle errors when no content status', function(done){
      const app = koa();

      app.use(function *(){
        this.status = 204;
        this.body = fs.createReadStream('does not exist');
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect(204, done);
    })


    it('should handle all intermediate stream body errors', function(done){
      const app = koa();

      app.use(function *(){
        this.body = fs.createReadStream('does not exist');
        this.body = fs.createReadStream('does not exist');
        this.body = fs.createReadStream('does not exist');
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect(404, done);
    })
  })

  describe('when .body is an Object', function(){
    it('should respond with json', function(done){
      const app = koa();

      app.use(function *(){
        this.body = { hello: 'world' };
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect('Content-Type', 'application/json; charset=utf-8')
      .expect('{"hello":"world"}', done);
    })
  })

  describe('when an error occurs', function(){
    it('should emit "error" on the app', function(done){
      const app = koa();

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
        const app = koa();

        app.use(function *(){
          const err = new Error('sorry!');
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
        const app = koa();

        app.use(function *(){
          const err = new Error('s3 explodes');
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
      const app = koa();

      app.use(function *(){
        throw new Error('boom!');
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect(500, 'Internal Server Error')
      .end(done);
    })

    it('should be catchable', function(done){
      const app = koa();

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

      const server = app.listen();

      request(server)
      .get('/')
      .expect(200, 'Got error')
      .end(done);
    })
  })

  describe('when status and body property', function(){
    it('should 200', function(done){
      const app = koa();

      app.use(function *(){
        this.status = 304;
        this.body = 'hello';
        this.status = 200;
      });

      const server = app.listen();

      request(server)
      .get('/')
      .expect(200)
      .expect('hello', done);
    })

    it('should 204', function(done) {
      const app = koa();

      app.use(function *(){
        this.status = 200;
        this.body = 'hello';
        this.set('content-type', 'text/plain; charset=utf8');
        this.status = 204;
      });

      const server = app.listen();

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
  const app1 = koa();
  app1.context.msg = 'hello';
  const app2 = koa();

  it('should merge properties', function(done){
    app1.use(function *(next){
      assert.equal(this.msg, 'hello')
      this.status = 204
    });

    request(app1.listen())
    .get('/')
    .expect(204, done);
  })

  it('should not affect the original prototype', function(done){
    app2.use(function *(next){
      assert.equal(this.msg, undefined)
      this.status = 204;
    });

    request(app2.listen())
    .get('/')
    .expect(204, done);
  })
})

describe('app.request', function(){
  const app1 = koa();
  app1.request.message = 'hello';
  const app2 = koa();

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
  const app1 = koa();
  app1.response.msg = 'hello';
  const app2 = koa();

  it('should merge properties', function(done){
    app1.use(function *(next){
      assert.equal(this.response.msg, 'hello')
      this.status = 204
    });

    request(app1.listen())
    .get('/')
    .expect(204, done);
  })

  it('should not affect the original prototype', function(done){
    app2.use(function *(next){
      assert.equal(this.response.msg, undefined)
      this.status = 204;
    });

    request(app2.listen())
    .get('/')
    .expect(204, done);
  })
})
