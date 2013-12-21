
var context = require('../context');
var assert = require('assert');

describe('ctx.throw(msg)', function(){
  it('should set .status to 500', function(done){
    var ctx = context();

    try {
      ctx.throw('boom');
    } catch (err) {
      assert(500 == err.status);
      done();
    }
  })
})

describe('ctx.throw(msg, status)', function(){
  it('should throw an error', function(done){
    var ctx = context();

    try {
      ctx.throw('name required', 400);
    } catch (err) {
      assert('name required' == err.message);
      assert(400 == err.status);
      done();
    }
  })
})

describe('ctx.throw(status, msg)', function(){
  it('should throw an error', function(done){
    var ctx = context();

    try {
      ctx.throw(400, 'name required');
    } catch (err) {
      assert('name required' == err.message);
      assert(400 == err.status);
      done();
    }
  })
})

describe('ctx.throw(status)', function(){
  it('should throw an error', function(done){
    var ctx = context();

    try {
      ctx.throw(400);
    } catch (err) {
      assert('Bad Request' == err.message);
      assert(400 == err.status);
      done();
    }
  })
})