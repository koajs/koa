
'use strict';

var context = require('../context');
var should = require('should');

describe('ctx.vary(field)', function(){
  describe('when Vary is not set', function(){
    it('should set it', function(){
      var ctx = context();
      ctx.vary('Accept');
      ctx.response.header.vary.should.equal('Accept');
    })
  })

  describe('when Vary is set', function(){
    it('should append', function(){
      var ctx = context();
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      ctx.response.header.vary.should.equal('Accept, Accept-Encoding');
    })
  })

  describe('when Vary already contains the value', function(){
    it('should not append', function(){
      var ctx = context();
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      ctx.vary('Accept');
      ctx.vary('Accept-Encoding');
      ctx.response.header.vary.should.equal('Accept, Accept-Encoding');
    })
  })

  describe('after header sent', function(){
    it('should ignore', function(){
      var ctx = context(null, { headersSent: true });
      ctx.vary('Accept');
      should.not.exist(ctx.response.header.vary);
    })
  })
})
