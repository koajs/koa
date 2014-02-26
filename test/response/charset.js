
var context = require('../context');
var assert = require('assert');

describe('ctx.charset=', function(){
  describe('with no charset present', function(){
    it('should set it', function(){
      var ctx = context();
      ctx.type = 'text/plain';
      ctx.charset = 'utf8';
      ctx.response.get('Content-Type').should.equal('text/plain; charset=utf8');
    })
  })

  describe('with a charset', function(){
    it('should set it', function(){
      var ctx = context();
      ctx.type = 'text/plain; charset=hey';
      ctx.charset = 'utf8';
      ctx.response.get('Content-Type').should.equal('text/plain; charset=utf8');
    })
  })

  describe('before ctx.=type', function(){
    it('should set it', function (){
      var ctx = context();
      ctx.charset = 'hey';
      ctx.type = 'text/html';
      ctx.response.get('Content-Type').should.equal('text/html; charset=hey');
    })
    it('should set by type', function (){
      var ctx = context();
      ctx.charset = 'hey';
      ctx.type='text/html; charset=utf8';
      ctx.response.get('Content-Type').should.equal('text/html; charset=utf8');
    })
  })
})

describe('ctx.charset', function(){
  describe('with no charset present', function(){
    it('should return null', function(){
      var ctx = context();
      ctx.type = 'text/plain';
      assert(null == ctx.charset);
    })
  })

  describe('with a charset', function(){
    it('should return the charset', function(){
      var ctx = context();
      ctx.type = 'text';
      ctx.charset.should.equal('utf-8');
    })
  })
})
