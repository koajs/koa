
var context = require('../context');
var assert = require('assert');

describe('ctx.error(msg)', function(){
  it('should set .status to 500', function(done){
    var ctx = context();

    try {
      ctx.error('boom');
    } catch (err) {
      assert(500 == err.status);
      done();
    }
  })
})

describe('ctx.error(msg, status)', function(){
  it('should throw an error', function(done){
    var ctx = context();

    try {
      ctx.error('name required', 400);
    } catch (err) {
      assert('name required' == err.message);
      assert(400 == err.status);
      done();
    }
  })
})

describe('ctx.error(status)', function(){
  it('should throw an error', function(done){
    var ctx = context();

    try {
      ctx.error(400);
    } catch (err) {
      assert('Bad Request' == err.message);
      assert(400 == err.status);
      done();
    }
  })
})