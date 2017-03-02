'use strict';

const request = require('../helpers/request');
const Koa = require('../..');
const http = require('http');

describe('ctx.flushHeaders()', () => {
  it('should set headersSent', async () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.body = 'Body';
      ctx.status = 200;
      ctx.flushHeaders();
      expect(ctx.res.headersSent).toBe(true);
    });

    const res = await request(app, '/');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('Body');
  });

  it('should allow a response afterwards', async () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.status = 200;
      ctx.res.setHeader('Content-Type', 'text/plain');
      ctx.flushHeaders();
      ctx.body = 'Body';
    });

    const res = await request(app, '/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/plain');
    expect(await res.text()).toBe('Body');
  });

  it('should send the correct status code', async () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.status = 401;
      ctx.res.setHeader('Content-Type', 'text/plain');
      ctx.flushHeaders();
      ctx.body = 'Body';
    });

    const res = await request(app, '/');
    expect(res.status).toBe(401);
    expect(res.headers.get('content-type')).toBe('text/plain');
    expect(await res.text()).toBe('Body');
  });

  it('should fail to set the headers after flushHeaders', async () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.status = 401;
      ctx.res.setHeader('Content-Type', 'text/plain');
      ctx.flushHeaders();
      ctx.body = '';
      try {
        ctx.set('X-Shouldnt-Work', 'Value');
      } catch (err) {
        ctx.body += 'ctx.set fail ';
      }
      try {
        ctx.status = 200;
      } catch (err) {
        ctx.body += 'ctx.status fail ';
      }
      try {
        ctx.length = 10;
      } catch (err) {
        ctx.body += 'ctx.length fail';
      }
    });

    const res = await request(app, '/');
    expect(res.status).toBe(401);
    expect(res.headers.get('content-type')).toBe('text/plain');
    expect(res.headers.has('x-shouldnt-work')).toBe(false);
    expect(await res.text()).toBe('ctx.set fail ctx.status fail ctx.length fail');
  });

  it('should flush headers first and delay to send data', done => {
    const PassThrough = require('stream').PassThrough;
    const app = new Koa();

    app.use(ctx => {
      ctx.type = 'json';
      ctx.status = 200;
      ctx.headers['Link'] = '</css/mycss.css>; as=style; rel=preload, <https://img.craftflair.com>; rel=preconnect; crossorigin';
      const stream = ctx.body = new PassThrough();
      ctx.flushHeaders();

      setTimeout(() => {
        stream.end(JSON.stringify({ message: 'hello!' }));
      }, 10000);
    });

    app.listen(function(err){
      if (err) return done(err);

      const port = this.address().port;

      http.request({
        port
      })
      .on('response', res => {
        const onData = () => done(new Error('boom'));
        res.on('data', onData);

        // shouldn't receive any data for a while
        setTimeout(() => {
          res.removeListener('data', onData);
          done();
        }, 1000);
      })
      .on('error', done)
      .end();
    });
  });
});
