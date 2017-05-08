
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');
const http = require('http');

describe('ctx.flushHeaders()', () => {
  it('should set headersSent', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.body = 'Body';
      ctx.status = 200;
      ctx.flushHeaders();
      assert.equal(ctx.res.headersSent, true);
    });

    const server = app.listen();

    return request(server)
      .get('/')
      .expect(200)
      .expect('Body');
  });

  it('should allow a response afterwards', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.status = 200;
      ctx.res.setHeader('Content-Type', 'text/plain');
      ctx.flushHeaders();
      ctx.body = 'Body';
    });

    const server = app.listen();
    return request(server)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/plain')
      .expect('Body');
  });

  it('should send the correct status code', () => {
    const app = new Koa();

    app.use((ctx, next) => {
      ctx.status = 401;
      ctx.res.setHeader('Content-Type', 'text/plain');
      ctx.flushHeaders();
      ctx.body = 'Body';
    });

    const server = app.listen();
    return request(server)
      .get('/')
      .expect(401)
      .expect('Content-Type', 'text/plain')
      .expect('Body');
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

    const server = app.listen();
    const res = await request(server)
      .get('/')
      .expect(401)
      .expect('Content-Type', 'text/plain')
      .expect('ctx.set fail ctx.status fail ctx.length fail');

    assert.equal(res.headers['x-shouldnt-work'], undefined, 'header set after flushHeaders');
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
