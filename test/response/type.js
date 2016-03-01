
'use strict';

var context = require('../context');
var assert = require('assert');

describe('ctx.type=', function(){
  describe('with a mime', function(){
    it('should set the Content-Type', function(){
      var ctx = context();
      ctx.type = 'text/plain';
      ctx.type.should.equal('text/plain');
      ctx.response.header['content-type'].should.equal('text/plain; charset=utf-8');
    })
  })

  describe('with an extension', function(){
    it('should lookup the mime', function(){
      var ctx = context();
      ctx.type = 'json';
      ctx.type.should.equal('application/json');
      ctx.response.header['content-type'].should.equal('application/json; charset=utf-8');
    })
  })

  describe('without a charset', function(){
    it('should default the charset', function(){
      var ctx = context();
      ctx.type = 'text/html';
      ctx.type.should.equal('text/html');
      ctx.response.header['content-type'].should.equal('text/html; charset=utf-8');
    })
  })

  describe('with a charset', function(){
    it('should not default the charset', function(){
      var ctx = context();
      ctx.type = 'text/html; charset=foo';
      ctx.type.should.equal('text/html');
      ctx.response.header['content-type'].should.equal('text/html; charset=foo');
    })
  })

  describe('with an unknown extension', function(){
    it('should not set a content-type', function(){
      var ctx = context();
      ctx.type = 'asdf';
      assert(!ctx.type);
      assert(!ctx.response.header['content-type']);
    });
  });
});

describe('ctx.type', function(){
  describe('with no Content-Type', function(){
    it('should return ""', function(){
      var ctx = context();
      // this is lame
      assert('' === ctx.type);
    })
  })

  describe('with a Content-Type', function(){
    it('should return the mime', function(){
      var ctx = context();
      ctx.type = 'json';
      ctx.type.should.equal('application/json');
    })
  })
})
