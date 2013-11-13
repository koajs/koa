
var context = require('../context');
var assert = require('assert');

describe('ctx.type=', function(){
  describe('with a mime', function(){
    it('should set the Content-Type', function(){
      var ctx = context();
      ctx.type = 'text/plain';
      ctx.response.header['content-type'].should.equal('text/plain');
    })
  })

  describe('with an extension', function(){
    it('should lookup the mime', function(){
      var ctx = context();
      ctx.type = 'json';
      ctx.response.header['content-type'].should.equal('application/json');
    })
  })
})

describe('ctx.type', function(){
  describe('with no Content-Type', function(){
    it('should return null', function(){
      var ctx = context();
      assert(null == ctx.type);
    })
  })

  describe('with a Content-Type', function(){
    it('should return the mime', function(){
      var ctx = context();
      ctx.req.headers['content-type'] = 'text/html; charset=utf8';
      ctx.type.should.equal('text/html');
    })
  })
})