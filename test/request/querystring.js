
var context = require('../context');

describe('ctx.querystring=', function(){
  it('should replace the querystring', function(){
    var ctx = context({ url: '/store/shoes' });
    ctx.querystring = 'page=2&color=blue';
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.querystring.should.equal('page=2&color=blue');
  })
})