
var context = require('../context');

describe('ctx.is(type)', function(){
  it('should ignore params', function(){
    var ctx = context();
    ctx.header['content-type'] = 'text/html; charset=utf-8';
    ctx.is('text/*').should.be.true;
  })

  describe('given a mime', function(){
    it('should check the type', function(){
      var ctx = context();
      ctx.header['content-type'] = 'image/png';

      ctx.is('image/png').should.be.true;
      ctx.is('image/*').should.be.true;
      ctx.is('*/png').should.be.true;

      ctx.is('image/jpeg').should.be.false;
      ctx.is('text/*').should.be.false;
      ctx.is('*/jpeg').should.be.false;
    })
  })

  describe('given an extension', function(){
    it('should check the type', function(){
      var ctx = context();
      ctx.header['content-type'] = 'image/png';

      ctx.is('png').should.be.true;
      ctx.is('.png').should.be.true;

      ctx.is('jpeg').should.be.false;
      ctx.is('.jpeg').should.be.false;
    })
  })
})