
var context = require('../context');
var request = require('supertest');
var koa = require('../..');

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

  describe('when given a no-ascii filename', function(){
    it('should set the encodeURI filename param', function(){
      var ctx = context();
      ctx.attachment('path/to/include-no-ascii-char-中文名-ok.png');
      var str = 'attachment; filename=\"include-no-ascii-char-???-ok.png\"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.png';
      ctx.response.header['content-disposition'].should.equal(str);
    })

    it('should work with http client', function(done){
      var app = koa();

      app.use(function* (next){
        this.attachment('path/to/include-no-ascii-char-中文名-ok.json')
        this.body = {foo: 'bar'}
      })

      request(app.listen())
      .get('/')
      .expect('content-disposition', 'attachment; filename="include-no-ascii-char-???-ok.json"; filename*=UTF-8\'\'include-no-ascii-char-%E4%B8%AD%E6%96%87%E5%90%8D-ok.json')
      .expect({foo: 'bar'})
      .expect(200, done)
    })
  })
})
