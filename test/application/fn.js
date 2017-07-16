
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('app.fn = fn', () => {
  it('should not middleware', async () => {
    const app = new Koa();
    const calls = [];

    const mw1 = async ctx => calls.push('the');
    const mw2 = async ctx => calls.push('future');
    const mw3 = async ctx => calls.push('does');
    const mw4 = async ctx => calls.push('not');
    const mw5 = async ctx => calls.push('need');
    const mw6 = async ctx => calls.push('compose');

    app.fn = async ctx => {
      await mw1(ctx);
      await Promise.all([mw2(ctx), mw3(ctx), mw4(ctx), mw5(ctx)]);
      await mw6(ctx);
    };

    const server = app.listen();

    await request(server)
      .get('/')
      .expect(404);

    assert(['the', 'future', 'does', 'not', 'need', 'compose'].map(k => calls.includes(k)));
  });
});
