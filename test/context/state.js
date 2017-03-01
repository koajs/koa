'use strict';

const request = require('../helpers/request');
const Koa = require('../..');

describe('ctx.state', () => {
  it('should provide a ctx.state namespace', async () => {
    const app = new Koa();

    app.use(ctx => {
      expect(ctx.state).toEqual({});
    });

    const res = await request(app, '/');
    expect(res.status).toBe(404);
  });
});
