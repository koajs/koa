
'use strict';

const AssertRequest = require('assert-request');
const statuses = require('statuses');
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

      const request = AssertRequest(app);

      return request('/')
        .okay()
        .body('lol');
    });
  });

  describe('when this.type === null', () => {
    it('should not send Content-Type header', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = '';
        ctx.type = null;
      });

      const request = AssertRequest(app);

      return request('/')
        .okay()
        .header('Content-Type', null);
    });
  });

  describe('when HEAD is used', () => {
    it('should not respond with the body', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'Hello';
      });

      const request = AssertRequest(app);

      return request.head('/')
        .okay()
        .type('text/plain; charset=utf-8')
        .header('Content-Length', 5)
        .body('');
    });

    it('should keep json headers', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { hello: 'world' };
      });

      const request = AssertRequest(app);

      return request.head('/')
        .okay()
        .type('application/json; charset=utf-8')
        .header('Content-Length', '17')
        .body('');
    });

    it('should keep string headers', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'hello world';
      });

      const request = AssertRequest(app);

      return request.head('/')
        .okay()
        .type('text/plain; charset=utf-8')
        .header('Content-Length', '11')
        .body('');
    });

    it('should keep buffer headers', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = new Buffer('hello world');
      });

      const request = AssertRequest(app);

      return request.head('/')
        .okay()
        .type('application/octet-stream')
        .header('Content-Length', '11')
        .body('');
    });

    it('should respond with a 404 if no body was set', () => {
      const app = new Koa();

      app.use(ctx => {

      });

      const request = AssertRequest(app);

      return request.head('/')
        .status(404);
    });

    it('should respond with a 200 if body = ""', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = '';
      });

      const request = AssertRequest(app);

      return request.head('/')
        .okay();
    });

    it('should not overwrite the content-type', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.type = 'application/javascript';
      });

      const request = AssertRequest(app);

      return request.head('/')
        .type('application/javascript')
        .okay();
    });
  });

  describe('when no middleware are present', () => {
    it('should 404', () => {
      const app = new Koa();

      const request = AssertRequest(app);

      return request('/')
        .status(404);
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

      const request = AssertRequest(app);

      return request('/')
        .okay()
        .assert(() => !errorCaught);
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

      const request = AssertRequest(app);

      return request('/')
        .status(200)
        .body('HelloGoodbye');
    });
  });

  describe('when .body is missing', () => {
    describe('with status=400', () => {
      it('should respond with the associated status message', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 400;
        });

        const request = AssertRequest(app);

        return request('/')
          .status(400)
          .header('Content-Length', 11)
          .body('Bad Request');
      });
    });

    describe('with status=204', () => {
      it('should respond without a body', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 204;
        });

        const request = AssertRequest(app);

        return request('/')
          .status(204)
          .body('')
          .header('Content-Type', null);
      });
    });

    describe('with status=205', () => {
      it('should respond without a body', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 205;
        });

        const request = AssertRequest(app);

        return request('/')
          .status(205)
          .body('')
          .header('Content-Type', null);
      });
    });

    describe('with status=304', () => {
      it('should respond without a body', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 304;
        });

        const request = AssertRequest(app);

        return request('/')
          .status(304)
          .body('')
          .header('Content-Type', null);
      });
    });

    describe('with custom status=700', () => {
      it('should respond with the associated status message', () => {
        const app = new Koa();
        statuses['700'] = 'custom status';

        app.use(ctx => {
          ctx.status = 700;
        });

        const request = AssertRequest(app);

        return request('/')
          .status(700)
          .body('custom status')
          .assert(res => res.statusMessage === 'custom status');
      });
    });

    describe('with custom statusMessage=ok', () => {
      it('should respond with the custom status message', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.status = 200;
          ctx.message = 'ok';
        });

        const request = AssertRequest(app);

        return request('/')
          .okay()
          .body('ok')
          .assert(res => res.statusMessage === 'ok');
      });
    });

    describe('with custom status without message', () => {
      it('should respond with the status code number', () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.res.statusCode = 701;
        });

        const request = AssertRequest(app);

        return request('/')
          .status(701)
          .body('701');
      });
    });
  });

  describe('when .body is a null', () => {
    it('should respond 204 by default', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = null;
      });

      const request = AssertRequest(app);

      return request('/')
        .status(204)
        .body('')
        .header('Content-Type', null);
    });

    it('should respond 204 with status=200', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.body = null;
      });

      const request = AssertRequest(app);

      return request('/')
        .status(204)
        .body('')
        .header('Content-Type', null);
    });

    it('should respond 205 with status=205', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 205;
        ctx.body = null;
      });

      const request = AssertRequest(app);

      return request('/')
        .status(205)
        .body('')
        .header('Content-Type', null);
    });

    it('should respond 304 with status=304', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 304;
        ctx.body = null;
      });

      const request = AssertRequest(app);

      return request('/')
        .status(304)
        .body('')
        .header('Content-Type', null);
    });
  });

  describe('when .body is a string', () => {
    it('should respond', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'Hello';
      });

      const request = AssertRequest(app);

      return request('/')
        .body('Hello');
    });
  });

  describe('when .body is a Buffer', () => {
    it('should respond', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = new Buffer('Hello');
      });

      const request = AssertRequest(app);

      return request('/')
        .body('Hello');
    });
  });

  describe('when .body is a Stream', () => {
    it('should respond', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const request = AssertRequest(app);

      return request('/')
        .type('application/json; charset=utf-8')
        .header('Content-Length', null)
        .body(body => body !== JSON.stringify(require('../../package')));
    });

    it('should strip content-length when overwriting', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = 'hello';
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const request = AssertRequest(app);

      return request('/')
        .type('application/json; charset=utf-8')
        .header('Content-Length', null)
        .body(body => body !== JSON.stringify(require('../../package')));
    });

    it('should keep content-length if not overwritten', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.length = fs.readFileSync('package.json').length;
        ctx.body = fs.createReadStream('package.json');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
      });

      const request = AssertRequest(app);

      return request('/')
        .type('application/json; charset=utf-8')
        .header('Content-Length')
        .json(require('../../package'));
    });

    it('should keep content-length if overwritten with the same stream',
      () => {
        const app = new Koa();

        app.use(ctx => {
          ctx.length = fs.readFileSync('package.json').length;
          const stream = fs.createReadStream('package.json');
          ctx.body = stream;
          ctx.body = stream;
          ctx.set('Content-Type', 'application/json; charset=utf-8');
        });

        const request = AssertRequest(app);

        return request('/')
          .type('application/json; charset=utf-8')
          .header('Content-Length')
          .json(require('../../package'));
      });

    it('should handle errors', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        ctx.body = fs.createReadStream('does not exist');
      });

      const request = AssertRequest(app);

      return request('/')
        .type('text/plain; charset=utf-8')
        .status(404);
    });

    it('should handle errors when no content status', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 204;
        ctx.body = fs.createReadStream('does not exist');
      });

      const request = AssertRequest(app);

      return request('/')
        .status(204);
    });

    it('should handle all intermediate stream body errors', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = fs.createReadStream('does not exist');
        ctx.body = fs.createReadStream('does not exist');
        ctx.body = fs.createReadStream('does not exist');
      });

      const request = AssertRequest(app);

      return request('/')
        .status(404);
    });
  });

  describe('when .body is an Object', () => {
    it('should respond with json', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.body = { hello: 'world' };
      });

      const request = AssertRequest(app);

      return request('/')
        .type('application/json; charset=utf-8')
        .json({ hello: 'world' });
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

      const request = AssertRequest(app);

      request('/').catch(err => err);
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

        const request = AssertRequest(app);

        return request('/')
          .status(403)
          .body('sorry!');
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

        const request = AssertRequest(app);

        return request('/')
          .status(403)
          .body('Forbidden');
      });
    });

    it('should respond with 500', () => {
      const app = new Koa();

      app.use(ctx => {
        throw new Error('boom!');
      });

      const request = AssertRequest(app);

      return request('/')
        .status(500)
        .body('Internal Server Error');
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

      const request = AssertRequest(app);

      return request('/')
        .okay()
        .body('Got error');
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

      const request = AssertRequest(app);

      return request('/')
        .okay()
        .body('hello');
    });

    it('should 204', () => {
      const app = new Koa();

      app.use(ctx => {
        ctx.status = 200;
        ctx.body = 'hello';
        ctx.set('content-type', 'text/plain; charset=utf8');
        ctx.status = 204;
      });

      const request = AssertRequest(app);

      return request('/')
        .status(204)
        .header('Content-Type', null);
    });
  });
});
