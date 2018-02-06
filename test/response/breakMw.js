'use strict';

const request = require('supertest');
const Koa = require('../..');
const compose = require('koa-compose');
const assert = require('assert');

describe('response.brewkMw', () => {
  it('should success', () => {
    const app = new Koa();
    app.use(compose([
      async (ctx, next) => {
        await next();
        ctx.set('x-field', 'failed');
      },
      ctx => {
        ctx.status = 200;
        ctx.body = 'Hello';
        ctx.set('x-field', 'world');
        ctx.breakMw();
      }]));

    const server = app.listen();
    return request(server)
      .get('/')
      .expect(200)
      .expect(response => {
        const res = response.res;
        assert(res.headers['x-field'] === 'world');
        assert(res.text === 'Hello');
      });
  });
});
