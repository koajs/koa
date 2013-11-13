
var context = require('../context');

describe('ctx.attachment([filename])', function(){
  describe('when given a filename', function(){
    it('should set the filename param', function(){
      var ctx = context();
      ctx.attachment('path/to/tobi.png');
      var str = 'attachment; filename="tobi.png"';
      ctx.response.header['content-disposition'].should.equal(str);
    })
  })

  describe('when omitting filename', function(){
    it('should not set filename param', function(){
      var ctx = context();
      ctx.attachment();
      ctx.response.header['content-disposition'].should.equal('attachment');
    })
  })
})