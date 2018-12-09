
'use strict';

const request = require('supertest');
const Koa = require('../../lib/application');

describe('app.prioRequestsProcessing = true', () => {
  const app = new Koa();
  app.prioRequestsProcessing = true;

  it('should process request', () => {
    app.use((ctx, next) => {
      ctx.status = 200;
    });

    return request(app.listen())
      .get('/')
      .expect(200);
  });
});
