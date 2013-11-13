
var response = require('../response');
var assert = require('assert');

describe('res.length', function(){
  describe('when Content-Length is defined', function(){
    it('should return a number', function(){
      var res = response();
      res.header['content-length'] = '120';
      res.length.should.equal(120);
    })
  })
})

describe('res.length', function(){
  describe('when Content-Length is defined', function(){
    it('should return a number', function(){
      var res = response();
      res.set('Content-Length', '1024');
      res.length.should.equal(1024);
    })
  })

  describe('when Content-Length is not defined', function(){
    describe('and a .body is set', function(){
      it('should return a number', function(){
        var res = response();

        res.body = 'foo';
        res.length.should.equal(3);

        res.body = new Buffer('foo');
        res.length.should.equal(3);
      })
    })

    describe('and .body is not', function(){
      it('should return undefined', function(){
        var res = response();
        assert(null == res.length);
      })
    })
  })
})