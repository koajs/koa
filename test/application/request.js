
'use strict';

const request = require('supertest');
const assert = require('assert');
const koa = require('../..');

describe('app.request', function(){
  const app1 = koa();
  app1.request.message = 'hello';
  const app2 = koa();

  it('should merge properties', function(done){
    app1.use(function *(next){
      assert.equal(this.request.message, 'hello')
      this.status = 204
    });

    request(app1.listen())
    .get('/')
    .expect(204, done);
  })

  it('should not affect the original prototype', function(done){
    app2.use(function *(next){
      assert.equal(this.request.message, undefined)
      this.status = 204;
    });

    request(app2.listen())
    .get('/')
    .expect(204, done);
  })
})
