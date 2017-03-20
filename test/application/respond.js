
'use strict';

const request = require('supertest');
const statuses = require('statuses');
const assert = require('assert');
const Koa = require('../..');
const fs = require('fs');

describe('app.respond', () => {
  describe('when ctx.respond === false', () => {
    it('should function (ctx)', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'Hello';
        ctx.respond = false;

        const res = ctx.res;
        res.statusCode = 200;
        setImmediate(() => {
          res.setHeader('Content-Type', 'text/plain');
          res.end('lol');
        });
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(200)
        .expect('lol')
        .end(done);
    });
  });

  describe('when this.type === null', () => {
    it('should not send Content-Type header', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = '';
        ctx.type = null;
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          res.should.not.have.header('content-type');
          done();
        });
    });
  });

  describe('when HEAD is used', () => {
    it('should not respond with the body', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'Hello';
      });

      const server = app.listen();

      request(server)
        .head('/')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.header('Content-Type', 'text/plain; charset=utf-8');
          res.should.have.header('Content-Length', '5');
          assert(!res.text);
          done();
        });
    });

    it('should keep json headers', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { hello: 'world' };
      });

      const server = app.listen();

      request(server)
        .head('/')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.header('Content-Type', 'application/json; charset=utf-8');
          res.should.have.header('Content-Length', '17');
          assert(!res.text);
          done();
        });
    });

    it('should keep string headers', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'hello world';
      });

      const server = app.listen();

      request(server)
        .head('/')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.header('Content-Type', 'text/plain; charset=utf-8');
          res.should.have.header('Content-Length', '11');
          assert(!res.text);
          done();
        });
    });

    it('should keep buffer headers', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = Buffer.from('hello world');
      });

      const server = app.listen();

      request(server)
        .head('/')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          res.should.have.header('Content-Type', 'application/octet-stream');
          res.should.have.header('Content-Length', '11');
          assert(!res.text);
          done();
        });
    });

    it('should respond with a 404 if no body was set', done => {
      const app = new Koa();

      app.use(ctx => {

      });

      const server = app.listen();

      request(server)
        .head('/')
        .expect(404, done);
    });

    it('should respond with a 200 if body = ""', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = '';
      });

      const server = app.listen();

      request(server)
        .head('/')
        .expect(200, done);
    });

    it('should not overwrite the content-type', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.type = 'application/javascript';
      });

      const server = app.listen();

      request(server)
        .head('/')
        .expect('content-type', /application\/javascript/)
        .expect(200, done);
    });
  });

  describe('when no middleware are present', () => {
    it('should 404', done => {
      const app = new Koa();

      const server = app.listen();

      request(server)
        .get('/')
        .expect(404, done);
    });
  });

  describe('when res has already been written to', () => {
    it('should not cause an app error', done => {
      const app = new Koa();

      app.use((ctx, next) => {
        const res = ctx.res;
        ctx.status = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write('Hello');
        setTimeout(() => res.end('Goodbye'), 0);
      });

      let errorCaught = false;

      app.on('error', err => errorCaught = err);

      const server = app.listen();

      request(server)
        .get('/')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          if (errorCaught) return done(errorCaught);
          done();
        });
    });

    it('should send the right body', done => {
      const app = new Koa();

      app.use((ctx, next) => {
        const res = ctx.res;
        ctx.status = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write('Hello');
        return new Promise(resolve => {
          setTimeout(() => {
            res.end('Goodbye');
            resolve();
          }, 0);
        });
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(200)
        .expect('HelloGoodbye', done);
    });
  });

  describe('when .body is missing', () => {
    describe('with status=400', () => {
      it('should respond with the associated status message', done => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 400;
        });

        const server = app.listen();

        request(server)
          .get('/')
          .expect(400)
          .expect('Content-Length', '11')
          .expect('Bad Request', done);
      });
    });

    describe('with status=204', () => {
      it('should respond without a body', done => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 204;
        });

        const server = app.listen();

        request(server)
          .get('/')
          .expect(204)
          .expect('')
          .end((err, res) => {
            if (err) return done(err);

            res.header.should.not.have.property('content-type');
            done();
          });
      });
    });

    describe('with status=205', () => {
      it('should respond without a body', done => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 205;
        });

        const server = app.listen();

        request(server)
          .get('/')
          .expect(205)
          .expect('')
          .end((err, res) => {
            if (err) return done(err);

            res.header.should.not.have.property('content-type');
            done();
          });
      });
    });

    describe('with status=304', () => {
      it('should respond without a body', done => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 304;
        });

        const server = app.listen();

        request(server)
          .get('/')
          .expect(304)
          .expect('')
          .end((err, res) => {
            if (err) return done(err);

            res.header.should.not.have.property('content-type');
            done();
          });
      });
    });

    describe('with custom status=700', () => {
      it('should respond with the associated status message', done => {
        const app = new Koa();
        statuses['700'] = 'custom status';

        app.use(ctx => {
          ctx.status = 700;
        });

        const server = app.listen();

        request(server)
          .get('/')
          .expect(700)
          .expect('custom status')
          .end((err, res) => {
            if (err) return done(err);
            res.res.statusMessage.should.equal('custom status');
            done();
          });
      });
    });

    describe('with custom statusMessage=ok', () => {
      it('should respond with the custom status message', done => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 200;
          ctx.message = 'ok';
        });

        const server = app.listen();

        request(server)
          .get('/')
          .expect(200)
          .expect('ok')
          .end((err, res) => {
            if (err) return done(err);
            res.res.statusMessage.should.equal('ok');
            done();
          });
      });
    });

    describe('with custom status without message', () => {
      it('should respond with the status code number', done => {
        const app = new Koa();

        app.use(ctx => {
          ctx.res.statusCode = 701;
        });

        const server = app.listen();

        request(server)
          .get('/')
          .expect(701)
          .expect('701', done);
      });
    });
  });

  describe('when .body is a null', () => {
    it('should respond 204 by default', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = null;
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(204)
        .expect('')
        .end((err, res) => {
          if (err) return done(err);

          res.header.should.not.have.property('content-type');
          done();
        });
    });

    it('should respond 204 with status=200', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.body = null;
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(204)
        .expect('')
        .end((err, res) => {
          if (err) return done(err);

          res.header.should.not.have.property('content-type');
          done();
        });
    });

    it('should respond 205 with status=205', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 205;
        ctx.body = null;
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(205)
        .expect('')
        .end((err, res) => {
          if (err) return done(err);

          res.header.should.not.have.property('content-type');
          done();
        });
    });

    it('should respond 304 with status=304', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 304;
        ctx.body = null;
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(304)
        .expect('')
        .end((err, res) => {
          if (err) return done(err);

          res.header.should.not.have.property('content-type');
          done();
        });
    });
  });

  describe('when .body is a string', () => {
    it('should respond', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'Hello';
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect('Hello', done);
    });
  });

  describe('when .body is a Buffer', () => {
    it('should respond', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = Buffer.from('Hello');
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(200)
        .expect(Buffer.from('Hello'));
    });
  });

  describe('when .body is a Stream', () => {
    it('should respond', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end((err, res) => {
          if (err) return done(err);
          const pkg = require('../../package');
          res.should.not.have.header('Content-Length');
          res.body.should.eql(pkg);
          done();
        });
    });

    it('should strip content-length when overwriting', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'hello';
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end((err, res) => {
          if (err) return done(err);
          const pkg = require('../../package');
          res.should.not.have.header('Content-Length');
          res.body.should.eql(pkg);
          done();
        });
    });

    it('should keep content-length if not overwritten', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.length = fs.readFileSync('package.json').length;
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .end((err, res) => {
          if (err) return done(err);
          const pkg = require('../../package');
          res.should.have.header('Content-Length');
          res.body.should.eql(pkg);
          done();
        });
    });

    it('should keep content-length if overwritten with the same stream',
      done => {
        const app = new Koa();

        app.use(ctx => {
          ctx.length = fs.readFileSync('package.json').length;
          const stream = fs.createReadStream('package.json');
          ctx.body = stream;
          ctx.body = stream;
          ctx.set('Content-Type', 'application/json; charset=utf-8');
        });

        const server = app.listen();

        request(server)
          .get('/')
          .expect('Content-Type', 'application/json; charset=utf-8')
          .end((err, res) => {
            if (err) return done(err);
            const pkg = require('../../package');
            res.should.have.header('Content-Length');
            res.body.should.eql(pkg);
            done();
          });
      });

    it('should handle errors', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        ctx.body = fs.createReadStream('does not exist');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(404)
        .end(done);
    });

    it('should handle errors when no content status', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 204;
        ctx.body = fs.createReadStream('does not exist');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(204, done);
    });

    it('should handle all intermediate stream body errors', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = fs.createReadStream('does not exist');
        ctx.body = fs.createReadStream('does not exist');
        ctx.body = fs.createReadStream('does not exist');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(404, done);
    });
  });

  describe('when .body is an Object', () => {
    it('should respond with json', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { hello: 'world' };
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect('{"hello":"world"}', done);
    });
  });

  describe('when an error occurs', () => {
    it('should emit "error" on the app', done => {
      const app = new Koa();

      app.use(ctx => {
        throw new Error('boom');
      });

      app.on('error', err => {
        err.message.should.equal('boom');
        done();
      });

      request(app.listen())
        .get('/')
        .end(() => {});
    });

    describe('with an .expose property', () => {
      it('should expose the message', done => {
        const app = new Koa();

        app.use(ctx => {
          const err = new Error('sorry!');
          err.status = 403;
          err.expose = true;
          throw err;
        });

        request(app.listen())
          .get('/')
          .expect(403, 'sorry!')
          .end(done);
      });
    });

    describe('with a .status property', () => {
      it('should respond with .status', done => {
        const app = new Koa();

        app.use(ctx => {
          const err = new Error('s3 explodes');
          err.status = 403;
          throw err;
        });

        request(app.listen())
          .get('/')
          .expect(403, 'Forbidden')
          .end(done);
      });
    });

    it('should respond with 500', done => {
      const app = new Koa();

      app.use(ctx => {
        throw new Error('boom!');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(500, 'Internal Server Error')
        .end(done);
    });

    it('should be catchable', done => {
      const app = new Koa();

      app.use((ctx, next) => {
        return next().then(() => {
          ctx.body = 'Hello';
        }).catch(() => {
          ctx.body = 'Got error';
        });
      });

      app.use((ctx, next) => {
        throw new Error('boom!');
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(200, 'Got error')
        .end(done);
    });
  });

  describe('when status and body property', () => {
    it('should 200', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 304;
        ctx.body = 'hello';
        ctx.status = 200;
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(200)
        .expect('hello', done);
    });

    it('should 204', done => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.body = 'hello';
        ctx.set('content-type', 'text/plain; charset=utf8');
        ctx.status = 204;
      });

      const server = app.listen();

      request(server)
        .get('/')
        .expect(204)
        .end((err, res) => {
          res.should.not.have.header('content-type');
          done(err);
        });
    });
  });
});
