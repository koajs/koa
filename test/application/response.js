
'use strict';

const request = require('supertest');
const assert = require('assert');
const Koa = require('../..');

describe('app.response', function(){
  const app1 = new Koa();
  app1.response.msg = 'hello';
  const app2 = new Koa();

  it('should merge properties', function(done){
    app1.use(function (ctx, next){
      assert.equal(ctx.response.msg, 'hello');
      ctx.status = 204;
    });

    request(app1.listen())
    .get('/')
    .expect(204, done);
  });

  it('should not affect the original prototype', function(done){
    app2.use(function (ctx, next){
      assert.equal(ctx.response.msg, undefined);
      ctx.status = 204;
    });

    request(app2.listen())
    .get('/')
    .expect(204, done);
  });
});
