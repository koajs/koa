
'use strict';

const stderr = require('test-console').stderr;
const request = require('supertest');
const statuses = require('statuses');
const assert = require('assert');
const http = require('http');
const koa = require('..');
const fs = require('fs');
const AssertionError = assert.AssertionError;

describe('app.context', function(){
  const app1 = koa();
  app1.context.msg = 'hello';
  const app2 = koa();

  it('should merge properties', function(done){
    app1.use(function *(next){
      assert.equal(this.msg, 'hello')
      this.status = 204
    });

    request(app1.listen())
    .get('/')
    .expect(204, done);
  })

  it('should not affect the original prototype', function(done){
    app2.use(function *(next){
      assert.equal(this.msg, undefined)
      this.status = 204;
    });

    request(app2.listen())
    .get('/')
    .expect(204, done);
  })
})

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

describe('app.response', function(){
  const app1 = koa();
  app1.response.msg = 'hello';
  const app2 = koa();

  it('should merge properties', function(done){
    app1.use(function *(next){
      assert.equal(this.response.msg, 'hello')
      this.status = 204
    });

    request(app1.listen())
    .get('/')
    .expect(204, done);
  })

  it('should not affect the original prototype', function(done){
    app2.use(function *(next){
      assert.equal(this.response.msg, undefined)
      this.status = 204;
    });

    request(app2.listen())
    .get('/')
    .expect(204, done);
  })
})
