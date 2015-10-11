
'use strict';

var context = require('../context');
var should = require('should');
var assert = require('assert');

describe('ctx.is(type)', function(){
  it('should ignore params', function(){
    var ctx = context();
    ctx.header['content-type'] = 'text/html; charset=utf-8';
    ctx.header['transfer-encoding'] = 'chunked';

    ctx.is('text/*').should.equal('text/html');
  })

  describe('when no body is given', function(){
    it('should return null', function(){
      var ctx = context();

      assert(null == ctx.is());
      assert(null == ctx.is('image/*'));
      assert(null == ctx.is('image/*', 'text/*'));
    })
  })

  describe('when no content type is given', function(){
    it('should return false', function(){
      var ctx = context();
      ctx.header['transfer-encoding'] = 'chunked';

      ctx.is().should.be.false;
      ctx.is('image/*').should.be.false;
      ctx.is('text/*', 'image/*').should.be.false;
    })
  })

  describe('give no types', function(){
    it('should return the mime type', function(){
      var ctx = context();
      ctx.header['content-type'] = 'image/png';
      ctx.header['transfer-encoding'] = 'chunked';

      ctx.is().should.equal('image/png');
    })
  })

  describe('given one type', function(){
    it('should return the type or false', function(){
      var ctx = context();
      ctx.header['content-type'] = 'image/png';
      ctx.header['transfer-encoding'] = 'chunked';

      ctx.is('png').should.equal('png');
      ctx.is('.png').should.equal('.png');
      ctx.is('image/png').should.equal('image/png');
      ctx.is('image/*').should.equal('image/png');
      ctx.is('*/png').should.equal('image/png');

      ctx.is('jpeg').should.be.false;
      ctx.is('.jpeg').should.be.false;
      ctx.is('image/jpeg').should.be.false;
      ctx.is('text/*').should.be.false;
      ctx.is('*/jpeg').should.be.false;
    })
  })

  describe('given multiple types', function(){
    it('should return the first match or false', function(){
      var ctx = context();
      ctx.header['content-type'] = 'image/png';
      ctx.header['transfer-encoding'] = 'chunked';

      ctx.is('png').should.equal('png');
      ctx.is('.png').should.equal('.png');
      ctx.is('text/*', 'image/*').should.equal('image/png');
      ctx.is('image/*', 'text/*').should.equal('image/png');
      ctx.is('image/*', 'image/png').should.equal('image/png');
      ctx.is('image/png', 'image/*').should.equal('image/png');

      ctx.is(['text/*', 'image/*']).should.equal('image/png');
      ctx.is(['image/*', 'text/*']).should.equal('image/png');
      ctx.is(['image/*', 'image/png']).should.equal('image/png');
      ctx.is(['image/png', 'image/*']).should.equal('image/png');

      ctx.is('jpeg').should.be.false;
      ctx.is('.jpeg').should.be.false;
      ctx.is('text/*', 'application/*').should.be.false;
      ctx.is('text/html', 'text/plain', 'application/json; charset=utf-8').should.be.false;
    })
  })

  describe('when Content-Type: application/x-www-form-urlencoded', function(){
    it('should match "urlencoded"', function(){
      var ctx = context();
      ctx.header['content-type'] = 'application/x-www-form-urlencoded';
      ctx.header['transfer-encoding'] = 'chunked';

      ctx.is('urlencoded').should.equal('urlencoded');
      ctx.is('json', 'urlencoded').should.equal('urlencoded');
      ctx.is('urlencoded', 'json').should.equal('urlencoded');
    })
  })
})
