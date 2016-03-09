
'use strict';

var request = require('supertest');
var assert = require('assert');
var koa = require('../..');

describe('ctx.state', function() {
  it('should provide a ctx.state namespace', function(done) {
    var app = koa();

    app.use(function *() {
      assert.deepEqual(this.state, {});
    });

    var server = app.listen();

    request(server)
    .get('/')
    .expect(404)
    .end(done);
  })

  it('should inherit app.context.state object', function(done) {
    var app = koa();

    app.context.state = { foo: 'bar' };

    app.use(function *() {
      assert.equal(this.state.foo, 'bar');
    });

    var server = app.listen();

    request(server)
    .get('/')
    .expect(404)
    .end(done);

  })

  it('should not inherit app.context.state when the latter is not object', function(done) {
    var app = koa();

    app.context.state = 1;

    app.use(function *() {
      assert.notEqual(this.state, 1);
    });

    var server = app.listen();

    request(server)
    .get('/')
    .expect(404)
    .end(done);

  })
})
