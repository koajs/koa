
'use strict';

var context = require('../context');
var parseurl = require('parseurl');

describe('ctx.querystring', function(){
  it('should return the querystring', function(){
    var ctx = context({ url: '/store/shoes?page=2&color=blue' });
    ctx.querystring.should.equal('page=2&color=blue');
  });

  describe('when ctx.req not present', function(){
    it('should return an empty string', function(){
      var ctx = context();
      ctx.request.req = null;
      ctx.querystring.should.equal('');
    });
  });
});

describe('ctx.querystring=', function(){
  it('should replace the querystring', function(){
    var ctx = context({ url: '/store/shoes' });
    ctx.querystring = 'page=2&color=blue';
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.querystring.should.equal('page=2&color=blue');
  });

  it('should update ctx.search and ctx.query', function(){
    var ctx = context({ url: '/store/shoes' });
    ctx.querystring = 'page=2&color=blue';
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.search.should.equal('?page=2&color=blue');
    ctx.query.should.eql({
      page: '2',
      color: 'blue'
    });
  });

  it('should change .url but not .originalUrl', function(){
    var ctx = context({ url: '/store/shoes' });
    ctx.querystring = 'page=2&color=blue';
    ctx.url.should.equal('/store/shoes?page=2&color=blue');
    ctx.originalUrl.should.equal('/store/shoes');
    ctx.request.originalUrl.should.equal('/store/shoes');
  });

  it('should not affect parseurl', function(){
    const ctx = context({ url: '/login?foo=bar' });
    ctx.querystring = 'foo=bar';
    const url = parseurl(ctx.req);
    url.path.should.equal('/login?foo=bar');
  });
});
