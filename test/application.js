
'use strict';

const stderr = require('test-console').stderr;
const request = require('supertest');
const statuses = require('statuses');
const assert = require('assert');
const http = require('http');
const koa = require('..');
const fs = require('fs');
const AssertionError = assert.AssertionError;

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
