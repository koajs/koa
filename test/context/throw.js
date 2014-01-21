
var context = require('../context');
var assert = require('assert');

describe('ctx.throw(msg)', function(){
  it('should set .status to 500', function(done){
    var ctx = context();

    try {
      ctx.throw('boom');
    } catch (err) {
      assert(500 == err.status);
      assert(false === err.expose);
      done();
    }
  })
})

describe('ctx.throw(err)', function(){
  it('should set .status to 500', function(done){
    var ctx = context();
    var err = new Error('test');

    try {
      ctx.throw(err);
    } catch (err) {
      assert(500 == err.status);
      assert('test' == err.message);
      done();
    }
  })
})

describe('ctx.throw(err, status)', function(){
  it('should throw the error and set .status', function(done){
    var ctx = context();
    var error = new Error('test');

    try {
      ctx.throw(error, 422);
    } catch (err) {
      assert(422 == err.status);
      assert('test' == err.message);
      done();
    }
  })
})

describe('ctx.throw(status, err)', function(){
  it('should throw the error and set .status', function(done){
    var ctx = context();
    var error = new Error('test');

    try {
      ctx.throw(422, error);
    } catch (err) {
      assert(422 == err.status);
      assert('test' == err.message);
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
