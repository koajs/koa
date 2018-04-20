
'use strict';

var context = require('../context');
var should = require('should');

describe('ctx.remove(name)', function(){
  it('should remove a field', function(){
    var ctx = context();
    ctx.set('x-foo', 'bar');
    ctx.remove('x-foo');
    ctx.response.header.should.eql({});
  })

  describe('after header sent', function(){
    it('should ignore', function(){
      var ctx = context();
      ctx.set('foo', 'bar');
      ctx.res.headersSent = true;
      ctx.remove('foo', 'bar');
      ctx.response.header.foo.should.equal('bar');
    })
  })
})
