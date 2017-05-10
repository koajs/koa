
'use strict';

const request = require('supertest');
const statuses = require('statuses');
const assert = require('assert');
const Koa = require('../..');
const fs = require('fs');

describe('app.respond', () => {
  describe('when ctx.respond === false', () => {
    it('should function (ctx)', () => {
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

      return request(server)
        .get('/')
        .expect(200)
        .expect('lol');
    });
  });

  describe('when this.type === null', () => {
    it('should not send Content-Type header', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = '';
        ctx.type = null;
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(200)
        .then(res => {
          res.should.not.have.header('content-type');
        });
    });
  });

  describe('when HEAD is used', () => {
    it('should not respond with the body', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'Hello';
      });

      const server = app.listen();

      return request(server)
        .head('/')
        .expect(200)
        .then(res => {
          res.should.have.header('Content-Type', 'text/plain; charset=utf-8');
          res.should.have.header('Content-Length', '5');
          assert(!res.text);
        });
    });

    it('should keep json headers', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { hello: 'world' };
      });

      const server = app.listen();

      return request(server)
        .head('/')
        .expect(200)
        .then(res => {
          res.should.have.header('Content-Type', 'application/json; charset=utf-8');
          res.should.have.header('Content-Length', '17');
          assert(!res.text);
        });
    });

    it('should keep string headers', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'hello world';
      });

      const server = app.listen();

      return request(server)
        .head('/')
        .expect(200)
        .then(res => {
          res.should.have.header('Content-Type', 'text/plain; charset=utf-8');
          res.should.have.header('Content-Length', '11');
          assert(!res.text);
        });
    });

    it('should keep buffer headers', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = Buffer.from('hello world');
      });

      const server = app.listen();

      return request(server)
        .head('/')
        .expect(200)
        .then(res => {
          res.should.have.header('Content-Type', 'application/octet-stream');
          res.should.have.header('Content-Length', '11');
          assert(!res.text);
        });
    });

    it('should respond with a 404 if no body was set', () => {
      const app = new Koa();

      app.use(ctx => {

      });

      const server = app.listen();

      return request(server)
        .head('/')
        .expect(404);
    });

    it('should respond with a 200 if body = ""', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = '';
      });

      const server = app.listen();

      return request(server)
        .head('/')
        .expect(200);
    });

    it('should not overwrite the content-type', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.type = 'application/javascript';
      });

      const server = app.listen();

      return request(server)
        .head('/')
        .expect('content-type', /application\/javascript/)
        .expect(200);
    });
  });

  describe('when no middleware are present', () => {
    it('should 404', () => {
      const app = new Koa();

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(404);
    });
  });

  describe('when res has already been written to', () => {
    it('should not cause an app error', () => {
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

      return request(server)
        .get('/')
        .expect(200)
        .then(res => {
          console.log(errorCaught);
        });
    });

    it('should send the right body', () => {
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

      return request(server)
        .get('/')
        .expect(200)
        .expect('HelloGoodbye');
    });
  });

  describe('when .body is missing', () => {
    describe('with status=400', () => {
      it('should respond with the associated status message', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 400;
        });

        const server = app.listen();

        return request(server)
          .get('/')
          .expect(400)
          .expect('Content-Length', '11')
          .expect('Bad Request');
      });
    });

    describe('with status=204', () => {
      it('should respond without a body', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 204;
        });

        const server = app.listen();

        return request(server)
          .get('/')
          .expect(204)
          .expect('')
          .then(res => {
            res.header.should.not.have.property('content-type');
          });
      });
    });

    describe('with status=205', () => {
      it('should respond without a body', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 205;
        });

        const server = app.listen();

        return request(server)
          .get('/')
          .expect(205)
          .expect('')
          .then(res => {
            res.header.should.not.have.property('content-type');
          });
      });
    });

    describe('with status=304', () => {
      it('should respond without a body', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 304;
        });

        const server = app.listen();

        return request(server)
          .get('/')
          .expect(304)
          .expect('')
          .then(res => {
            res.header.should.not.have.property('content-type');
          });
      });
    });

    describe('with custom status=700', () => {
      it('should respond with the associated status message', () => {
        const app = new Koa();
        statuses['700'] = 'custom status';

        app.use(ctx => {
          ctx.status = 700;
        });

        const server = app.listen();

        return request(server)
          .get('/')
          .expect(700)
          .expect('custom status')
          .then(res => {
            res.res.statusMessage.should.equal('custom status');
          });
      });
    });

    describe('with custom statusMessage=ok', () => {
      it('should respond with the custom status message', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 200;
          ctx.message = 'ok';
        });

        const server = app.listen();

        return request(server)
          .get('/')
          .expect(200)
          .expect('ok')
          .then(res => {
            res.res.statusMessage.should.equal('ok');
          });
      });
    });

    describe('with custom status without message', () => {
      it('should respond with the status code number', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.res.statusCode = 701;
        });

        const server = app.listen();

        return request(server)
          .get('/')
          .expect(701)
          .expect('701');
      });
    });
  });

  describe('when .body is a null', () => {
    it('should respond 204 by default', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = null;
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(204)
        .expect('')
        .then(res => {
          res.header.should.not.have.property('content-type');
        });
    });

    it('should respond 204 with status=200', () => {
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
        .then(res => {
          res.header.should.not.have.property('content-type');
        });
    });

    it('should respond 205 with status=205', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 205;
        ctx.body = null;
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(205)
        .expect('')
        .then(res => {
          res.header.should.not.have.property('content-type');
        });
    });

    it('should respond 304 with status=304', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 304;
        ctx.body = null;
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(304)
        .expect('')
        .then(res => {
          res.header.should.not.have.property('content-type');
        });
    });
  });

  describe('when .body is a string', () => {
    it('should respond', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'Hello';
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect('Hello');
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
    it('should respond', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .then(res => {
          const pkg = require('../../package');
          res.should.not.have.header('Content-Length');
          res.body.should.eql(pkg);
        });
    });

    it('should strip content-length when overwriting', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'hello';
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .then(res => {
          const pkg = require('../../package');
          res.should.not.have.header('Content-Length');
          res.body.should.eql(pkg);
        });
    });

    it('should keep content-length if not overwritten', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.length = fs.readFileSync('package.json').length;
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .then(res => {
          const pkg = require('../../package');
          res.should.have.header('Content-Length');
          res.body.should.eql(pkg);
        });
    });

    it('should keep content-length if overwritten with the same stream', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.length = fs.readFileSync('package.json').length;
        const stream = fs.createReadStream('package.json');
        ctx.body = stream;
        ctx.body = stream;
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .then(res => {
          const pkg = require('../../package');
          res.should.have.header('Content-Length');
          res.body.should.eql(pkg);
        });
    });

    it('should handle errors', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        ctx.body = fs.createReadStream('does not exist');
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(404);
    });

    it('should handle errors when no content status', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 204;
        ctx.body = fs.createReadStream('does not exist');
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(204);
    });

    it('should handle all intermediate stream body errors', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = fs.createReadStream('does not exist');
        ctx.body = fs.createReadStream('does not exist');
        ctx.body = fs.createReadStream('does not exist');
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(404);
    });
  });

  describe('when .body is an Object', () => {
    it('should respond with json', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { hello: 'world' };
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect('{"hello":"world"}');
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
      it('should expose the message', () => {
        const app = new Koa();

        app.use(ctx => {
          const err = new Error('sorry!');
          err.status = 403;
          err.expose = true;
          throw err;
        });

        return request(app.listen())
          .get('/')
          .expect(403, 'sorry!');
      });
    });

    describe('with a .status property', () => {
      it('should respond with .status', () => {
        const app = new Koa();

        app.use(ctx => {
          const err = new Error('s3 explodes');
          err.status = 403;
          throw err;
        });

        return request(app.listen())
          .get('/')
          .expect(403, 'Forbidden');
      });
    });

    it('should respond with 500', () => {
      const app = new Koa();

      app.use(ctx => {
        throw new Error('boom!');
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(500, 'Internal Server Error');
    });

    it('should be catchable', () => {
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

      return request(server)
        .get('/')
        .expect(200, 'Got error');
    });
  });

  describe('when status and body property', () => {
    it('should 200', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 304;
        ctx.body = 'hello';
        ctx.status = 200;
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(200)
        .expect('hello');
    });

    it('should 204', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.body = 'hello';
        ctx.set('content-type', 'text/plain; charset=utf8');
        ctx.status = 204;
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(204)
        .then(res => {
          res.should.not.have.header('content-type');
        });
    });
  });
});
