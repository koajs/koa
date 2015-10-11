
'use strict';

var context = require('../context');
var should = require('should');
var assert = require('assert');

describe('response.is(type)', function(){
  it('should ignore params', function(){
    var res = context().response;
    res.type = 'text/html; charset=utf-8';

    res.is('text/*').should.equal('text/html');
  })

  describe('when no type is set', function(){
    it('should return false', function(){
      var res = context().response;

      assert(false === res.is());
      assert(false === res.is('html'));
    })
  })

  describe('when given no types', function(){
    it('should return the type', function(){
      var res = context().response;
      res.type = 'text/html; charset=utf-8';

      res.is().should.equal('text/html');
    })
  })

  describe('given one type', function(){
    it('should return the type or false', function(){
      var res = context().response;
      res.type = 'image/png';

      res.is('png').should.equal('png');
      res.is('.png').should.equal('.png');
      res.is('image/png').should.equal('image/png');
      res.is('image/*').should.equal('image/png');
      res.is('*/png').should.equal('image/png');

      res.is('jpeg').should.be.false;
      res.is('.jpeg').should.be.false;
      res.is('image/jpeg').should.be.false;
      res.is('text/*').should.be.false;
      res.is('*/jpeg').should.be.false;
    })
  })

  describe('given multiple types', function(){
    it('should return the first match or false', function(){
      var res = context().response;
      res.type = 'image/png';

      res.is('png').should.equal('png');
      res.is('.png').should.equal('.png');
      res.is('text/*', 'image/*').should.equal('image/png');
      res.is('image/*', 'text/*').should.equal('image/png');
      res.is('image/*', 'image/png').should.equal('image/png');
      res.is('image/png', 'image/*').should.equal('image/png');

      res.is(['text/*', 'image/*']).should.equal('image/png');
      res.is(['image/*', 'text/*']).should.equal('image/png');
      res.is(['image/*', 'image/png']).should.equal('image/png');
      res.is(['image/png', 'image/*']).should.equal('image/png');

      res.is('jpeg').should.be.false;
      res.is('.jpeg').should.be.false;
      res.is('text/*', 'application/*').should.be.false;
      res.is('text/html', 'text/plain', 'application/json; charset=utf-8').should.be.false;
    })
  })

  describe('when Content-Type: application/x-www-form-urlencoded', function(){
    it('should match "urlencoded"', function(){
      var res = context().response;
      res.type = 'application/x-www-form-urlencoded';

      res.is('urlencoded').should.equal('urlencoded');
      res.is('json', 'urlencoded').should.equal('urlencoded');
      res.is('urlencoded', 'json').should.equal('urlencoded');
    })
  })
})
