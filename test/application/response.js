'use strict';

const request = require('../helpers/request.js');
const Koa = require('../..');

describe('app.response', () => {
  const app1 = new Koa();
  app1.response.msg = 'hello';
  const app2 = new Koa();

  it('should merge properties', () => {
    app1.use((ctx, next) => {
      expect(ctx.response.msg).toBe('hello');
      ctx.status = 204;
    });

    return request(app1, '/').then(res => expect(res.status).toBe(204));
  });

  it('should not affect the original prototype', () => {
    app2.use((ctx, next) => {
      expect(ctx.response.msg).toBe(undefined);
      ctx.status = 204;
    });

    return request(app2, '/').then(res => expect(res.status).toBe(204));
  });
});
