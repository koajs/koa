
var context = require('../context');

describe('ctx.search=', function(){
  it('should replace the search', function(){
    var ctx = context({ url: '/store/shoes' });
    ctx.search = '?page=2&color=blue';
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.search.should.equal('?page=2&color=blue');
  })

  it('should update ctx.querystring and ctx.query', function(){
    var ctx = context({ url: '/store/shoes' });
    ctx.search = '?page=2&color=blue';
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.querystring.should.equal('page=2&color=blue');
    ctx.query.should.eql({
      page: '2',
      color: 'blue'
    });
  })

  it('should change .url but not .originalUrl', function(){
    var ctx = context({ url: '/store/shoes' });
    ctx.search = '?page=2&color=blue';
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.originalUrl.should.equal('/store/shoes');
    ctx.request.originalUrl.should.equal('/store/shoes');
  })

  describe('when missing', function(){
    it('should return ""', function(){
      var ctx = context({ url: '/store/shoes' });
      ctx.search.should.equal('');
    })
  })
})