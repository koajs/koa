
'use strict';

const request = require('supertest');
const statuses = require('statuses');
const assert = require('assert');
const Koa = require('../..');
const fs = require('fs');

describe('app.respond', () => {
  beforeEach(() => {
    global.console = jest.genMockFromModule('console');
  });

  afterEach(() => {
    global.console = require('console');
  });

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

    it('should ignore set header after header sent', () => {
      const app = new Koa();
      app.use(ctx => {
        ctx.body = 'Hello';
        ctx.respond = false;

        const res = ctx.res;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('lol');
        ctx.set('foo', 'bar');
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(200)
        .expect('lol')
        .expect(res => {
          assert(!res.headers.foo);
        });
    });

    it('should ignore set status after header sent', () => {
      const app = new Koa();
      app.use(ctx => {
        ctx.body = 'Hello';
        ctx.respond = false;

        const res = ctx.res;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end('lol');
        ctx.status = 201;
      });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(200)
        .expect('lol');
    });
  });

  describe('when this.type === null', () => {
    it('should not send Content-Type header', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = '';
        ctx.type = null;
      });

      const server = app.listen();

      const res = await request(server)
        .get('/')
        .expect(200);

      assert.equal(res.headers.hasOwnProperty('Content-Type'), false);
    });
  });

  describe('when HEAD is used', () => {
    it('should not respond with the body', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'Hello';
      });

      const server = app.listen();

      const res = await request(server)
        .head('/')
        .expect(200);

      assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
      assert.equal(res.headers['content-length'], '5');
      assert(!res.text);
    });

    it('should keep json headers', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { hello: 'world' };
      });

      const server = app.listen();

      const res = await request(server)
        .head('/')
        .expect(200);

      assert.equal(res.headers['content-type'], 'application/json; charset=utf-8');
      assert.equal(res.headers['content-length'], '17');
      assert(!res.text);
    });

    it('should keep string headers', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'hello world';
      });

      const server = app.listen();

      const res = await request(server)
        .head('/')
        .expect(200);

      assert.equal(res.headers['content-type'], 'text/plain; charset=utf-8');
      assert.equal(res.headers['content-length'], '11');
      assert(!res.text);
    });

    it('should keep buffer headers', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = Buffer.from('hello world');
      });

      const server = app.listen();

      const res = await request(server)
        .head('/')
        .expect(200);

      assert.equal(res.headers['content-type'], 'application/octet-stream');
      assert.equal(res.headers['content-length'], '11');
      assert(!res.text);
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

      app.on('error', err => { throw err; });

      const server = app.listen();

      return request(server)
        .get('/')
        .expect(200);
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
      it('should respond without a body', async() => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 204;
        });

        const server = app.listen();

        const res = await request(server)
          .get('/')
          .expect(204)
          .expect('');

        assert.equal(res.headers.hasOwnProperty('content-type'), false);
      });
    });

    describe('with status=205', () => {
      it('should respond without a body', async() => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 205;
        });

        const server = app.listen();

        const res = await request(server)
          .get('/')
          .expect(205)
          .expect('');

        assert.equal(res.headers.hasOwnProperty('content-type'), false);
      });
    });

    describe('with status=304', () => {
      it('should respond without a body', async() => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 304;
        });

        const server = app.listen();

        const res = await request(server)
          .get('/')
          .expect(304)
          .expect('');

        assert.equal(res.headers.hasOwnProperty('content-type'), false);
      });
    });

    describe('with custom status=700', () => {
      it('should respond with the associated status message', async() => {
        const app = new Koa();
        statuses['700'] = 'custom status';

        app.use(ctx => {
          ctx.status = 700;
        });

        const server = app.listen();

        const res = await request(server)
          .get('/')
          .expect(700)
          .expect('custom status');

        assert.equal(res.res.statusMessage, 'custom status');
      });
    });

    describe('with custom statusMessage=ok', () => {
      it('should respond with the custom status message', async() => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 200;
          ctx.message = 'ok';
        });

        const server = app.listen();

        const res = await request(server)
          .get('/')
          .expect(200)
          .expect('ok');

        assert.equal(res.res.statusMessage, 'ok');
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
    it('should respond 204 by default', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = null;
      });

      const server = app.listen();

      const res = await request(server)
        .get('/')
        .expect(204)
        .expect('');

      assert.equal(res.headers.hasOwnProperty('content-type'), false);
    });

    it('should respond 204 with status=200', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.body = null;
      });

      const server = app.listen();

      const res = await request(server)
        .get('/')
        .expect(204)
        .expect('');

      assert.equal(res.headers.hasOwnProperty('content-type'), false);
    });

    it('should respond 205 with status=205', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 205;
        ctx.body = null;
      });

      const server = app.listen();

      const res = await request(server)
        .get('/')
        .expect(205)
        .expect('');

      assert.equal(res.headers.hasOwnProperty('content-type'), false);
    });

    it('should respond 304 with status=304', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 304;
        ctx.body = null;
      });

      const server = app.listen();

      const res = await request(server)
        .get('/')
        .expect(304)
        .expect('');

      assert.equal(res.headers.hasOwnProperty('content-type'), false);
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
    it('should respond', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      const res = await request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8');

      const pkg = require('../../package');
      assert.equal(res.headers.hasOwnProperty('content-length'), false);
      assert.deepEqual(res.body, pkg);
    });

    it('should strip content-length when overwriting', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'hello';
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      const res = await request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8');

      const pkg = require('../../package');
      assert.equal(res.headers.hasOwnProperty('content-length'), false);
      assert.deepEqual(res.body, pkg);
    });

    it('should keep content-length if not overwritten', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.length = fs.readFileSync('package.json').length;
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      const res = await request(server)
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8');

      const pkg = require('../../package');
      assert.equal(res.headers.hasOwnProperty('content-length'), true);
      assert.deepEqual(res.body, pkg);
    });

    it('should keep content-length if overwritten with the same stream',
      async() => {
        const app = new Koa();

        app.use(ctx => {
          ctx.length = fs.readFileSync('package.json').length;
          const stream = fs.createReadStream('package.json');
          ctx.body = stream;
          ctx.body = stream;
          ctx.set('Content-Type', 'application/json; charset=utf-8');
        });

        const server = app.listen();

        const res = await request(server)
          .get('/')
          .expect('Content-Type', 'application/json; charset=utf-8');

        const pkg = require('../../package');
        assert.equal(res.headers.hasOwnProperty('content-length'), true);
        assert.deepEqual(res.body, pkg);
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
        .expect(404)
        .end(done);
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
        assert.equal(err.message, 'boom');
        done();
      });

      request(app.callback())
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

        return request(app.callback())
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

        return request(app.callback())
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

    it('should 204', async() => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.body = 'hello';
        ctx.set('content-type', 'text/plain; charset=utf8');
        ctx.status = 204;
      });

      const server = app.listen();

      const res = await request(server)
        .get('/')
        .expect(204);

      assert.equal(res.headers.hasOwnProperty('content-type'), false);
    });
  });
});
