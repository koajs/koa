
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

  it('should inherit app.state object', function(done) {
    var app = koa();

    app.state.foo = 'bar';

    app.use(function *() {
      assert.equal(this.state.foo, 'bar');
    });

    var server = app.listen();

    request(server)
    .get('/')
    .expect(404)
    .end(done);

  })
})
