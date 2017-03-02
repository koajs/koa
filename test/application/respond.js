'use strict';

const request = require('../helpers/request');
const eventToPromise = require('event-to-promise');
const statuses = require('statuses');
const Koa = require('../..');
const fs = require('fs');

describe('app.respond', () => {
  describe('when ctx.respond === false', () => {
    it('should function (ctx)', async () => {
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

      const res = await request(server, '/');
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('lol');
    });
  });

  describe('when this.type === null', () => {
    it('should not send Content-Type header', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = '';
        ctx.type = null;
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(200);
      expect(res.headers.has('content-type')).toBe(false);
    });
  });

  describe('when HEAD is used', () => {
    it('should not respond with the body', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'Hello';
      });

      const server = app.listen();

      const res = await request(server, '/', { method: 'HEAD' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
      expect(res.headers.get('content-length')).toBe('5');
      expect(await res.text()).toBe('');
    });

    it('should keep json headers', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { hello: 'world' };
      });

      const server = app.listen();

      const res = await request(server, '/', { method: 'HEAD' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
      expect(res.headers.get('content-length')).toBe('17');
      expect(await res.text()).toBe('');
    });

    it('should keep string headers', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'hello world';
      });

      const server = app.listen();

      const res = await request(server, '/', { method: 'HEAD' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
      expect(res.headers.get('content-length')).toBe('11');
      expect(await res.text()).toBe('');
    });

    it('should keep buffer headers', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = new Buffer('hello world');
      });

      const server = app.listen();

      const res = await request(server, '/', { method: 'HEAD' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/octet-stream');
      expect(res.headers.get('content-length')).toBe('11');
      expect(await res.text()).toBe('');
    });

    it('should respond with a 404 if no body was set', async () => {
      const app = new Koa();

      app.use(ctx => {

      });

      const server = app.listen();

      const res = await request(server, '/', { method: 'HEAD' });
      expect(res.status).toBe(404);
    });

    it('should respond with a 200 if body = ""', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = '';
      });

      const server = app.listen();

      const res = await request(server, '/', { method: 'HEAD' });
      expect(res.status).toBe(200);
    });

    it('should not overwrite the content-type', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.type = 'application/javascript';
      });

      const server = app.listen();

      const res = await request(server, '/', { method: 'HEAD' });
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/javascript; charset=utf-8');
    });
  });

  describe('when no middleware are present', () => {
    it('should 404', async () => {
      const app = new Koa();

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(404);
    });
  });

  describe('when res has already been written to', () => {
    it('should not cause an app error', async () => {
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

      const res = await request(server, '/');
      expect(res.status).toBe(200);
      expect(errorCaught).toBe(false);
    });

    it('should send the right body', async () => {
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

      const res = await request(server, '/');
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('HelloGoodbye');
    });
  });

  describe('when .body is missing', () => {
    describe('with status=400', () => {
      it('should respond with the associated status message', async () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 400;
        });

        const server = app.listen();

        const res = await request(server, '/');
        expect(res.status).toBe(400);
        expect(res.headers.get('content-length')).toBe('11');
        expect(await res.text()).toBe('Bad Request');
      });
    });

    describe('with status=204', () => {
      it('should respond without a body', async () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 204;
        });

        const server = app.listen();

        const res = await request(server, '/');
        expect(res.status).toBe(204);
        expect(res.headers.has('content-length')).toBe(false);
        expect(await res.text()).toBe('');
      });
    });

    describe('with status=205', () => {
      it('should respond without a body', async () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 205;
        });

        const server = app.listen();

        const res = await request(server, '/');
        expect(res.status).toBe(205);
        expect(res.headers.has('content-length')).toBe(false);
        expect(await res.text()).toBe('');
      });
    });

    describe('with status=304', () => {
      it('should respond without a body', async () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 304;
        });

        const server = app.listen();

        const res = await request(server, '/');
        expect(res.status).toBe(304);
        expect(res.headers.has('content-length')).toBe(false);
        expect(await res.text()).toBe('');
      });
    });

    describe('with custom status=700', () => {
      it('should respond with the associated status message', async () => {
        const app = new Koa();
        statuses['700'] = 'custom status';

        app.use(ctx => {
          ctx.status = 700;
        });

        const server = app.listen();

        const res = await request(server, '/');
        expect(res.status).toBe(700);
        expect(res.statusText).toBe('custom status');
        expect(await res.text()).toBe('custom status');
      });
    });

    describe('with custom statusMessage=ok', () => {
      it('should respond with the custom status message', async () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 200;
          ctx.message = 'ok';
        });

        const server = app.listen();

        const res = await request(server, '/');
        expect(res.status).toBe(200);
        expect(res.statusText).toBe('ok');
        expect(await res.text()).toBe('ok');
      });
    });

    describe('with custom status without message', () => {
      it('should respond with the status code number', async () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.res.statusCode = 701;
        });

        const server = app.listen();

        const res = await request(server, '/');
        expect(res.status).toBe(701);
        expect(await res.text()).toBe('701');
      });
    });
  });

  describe('when .body is a null', () => {
    it('should respond 204 by default', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = null;
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(204);
      expect(res.headers.has('content-type')).toBe(false);
      expect(await res.text()).toBe('');
    });

    it('should respond 204 with status=200', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.body = null;
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(204);
      expect(res.headers.has('content-type')).toBe(false);
      expect(await res.text()).toBe('');
    });

    it('should respond 205 with status=205', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 205;
        ctx.body = null;
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(205);
      expect(res.headers.has('content-type')).toBe(false);
      expect(await res.text()).toBe('');
    });

    it('should respond 304 with status=304', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 304;
        ctx.body = null;
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(304);
      expect(res.headers.has('content-type')).toBe(false);
      expect(await res.text()).toBe('');
    });
  });

  describe('when .body is a string', () => {
    it('should respond', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'Hello';
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(await res.text()).toBe('Hello');
    });
  });

  describe('when .body is a Buffer', () => {
    it('should respond', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = new Buffer('Hello');
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(await res.text()).toBe('Hello');
    });
  });

  describe('when .body is a Stream', () => {
    function create404Stream(){
      const stream = fs.createReadStream('does not exist');
      const oldOn = stream.on;
      stream.on = function(eventName, callback){
        if (eventName === 'error') {
          oldOn.call(stream, 'error', err => {
            const newErr = new Error(err);
            newErr.stack = err.stack;
            newErr.code = err.code;
            newErr.message = err.message;
            callback(newErr);
          });
        } else {
          oldOn.apply(stream, arguments);
        }
      };
      return stream;
    }

    it('should respond', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.headers.has('content-length')).toBe(false);
      expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
      expect(await res.json()).toEqual(require('../../package'));
    });

    it('should strip content-length when overwriting', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'hello';
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.headers.has('content-length')).toBe(false);
      expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
      expect(await res.json()).toEqual(require('../../package'));
    });

    it('should keep content-length if not overwritten', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.length = fs.readFileSync('package.json').length;
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.headers.has('content-length')).toBe(true);
      expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
      expect(await res.json()).toEqual(require('../../package'));
    });

    it('should keep content-length if overwritten with the same stream',
      async () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.length = fs.readFileSync('package.json').length;
          const stream = fs.createReadStream('package.json');
          ctx.body = stream;
          ctx.body = stream;
          ctx.set('Content-Type', 'application/json; charset=utf-8');
        });

        const server = app.listen();

        const res = await request(server, '/');
        expect(res.headers.has('content-length')).toBe(true);
        expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
        expect(await res.json()).toEqual(require('../../package'));
      });

    it('should handle errors', async () => {
      const app = new Koa();
      app.onerror = () => {};

      app.use(ctx => {
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        ctx.body = create404Stream();
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(404);
      expect(res.headers.get('content-type')).toBe('text/plain; charset=utf-8');
    });

    it('should handle errors when no content status', async () => {
      const app = new Koa();
      app.onerror = () => {};

      app.use(ctx => {
        ctx.status = 204;
        ctx.body = create404Stream();
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(204);
    });

    it('should handle all intermediate stream body errors', async () => {
      const app = new Koa();
      app.onerror = () => {};

      app.use(ctx => {
        ctx.body = create404Stream();
        ctx.body = create404Stream();
        ctx.body = create404Stream();
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(404);
    });
  });

  describe('when .body is an Object', () => {
    it('should respond with json', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { hello: 'world' };
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.headers.get('content-type')).toBe('application/json; charset=utf-8');
      expect(await res.text()).toBe('{"hello":"world"}');
    });
  });

  describe('when an error occurs', () => {
    it('should emit "error" on the app', () => {
      const app = new Koa();
      app.onerror = () => {};

      app.use(ctx => {
        throw new Error('boom');
      });

      return Promise.all([
        eventToPromise(app, 'error')
          .then(err => expect(err.message).toBe('boom')),
        request(app, '/')
      ]);
    });

    describe('with an .expose property', () => {
      it('should expose the message', async () => {
        const app = new Koa();

        app.use(ctx => {
          const err = new Error('sorry!');
          err.status = 403;
          err.expose = true;
          throw err;
        });

        const res = await request(app, '/');
        expect(res.status).toBe(403);
        expect(await res.text()).toBe('sorry!');
      });
    });

    describe('with a .status property', () => {
      it('should respond with .status', async () => {
        const app = new Koa();
        app.onerror = () => {};

        app.use(ctx => {
          const err = new Error('s3 explodes');
          err.status = 403;
          throw err;
        });

        const res = await request(app, '/');
        expect(res.status).toBe(403);
        expect(await res.text()).toBe('Forbidden');
      });
    });

    it('should respond with 500', async () => {
      const app = new Koa();
      app.onerror = () => {};

      app.use(ctx => {
        throw new Error('boom!');
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(500);
      expect(await res.text()).toBe('Internal Server Error');
    });

    it('should be catchable', async () => {
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

      const res = await request(server, '/');
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('Got error');
    });
  });

  describe('when status and body property', () => {
    it('should 200', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 304;
        ctx.body = 'hello';
        ctx.status = 200;
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('hello');
    });

    it('should 204', async () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.body = 'hello';
        ctx.set('content-type', 'text/plain; charset=utf8');
        ctx.status = 204;
      });

      const server = app.listen();

      const res = await request(server, '/');
      expect(res.status).toBe(204);
      expect(res.headers.has('content-type')).toBe(false);
    });
  });
});
