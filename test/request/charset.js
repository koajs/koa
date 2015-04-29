
var request = require('../context').request;
var assert = require('assert');

describe('req.charset', function(){
  describe('with no content-type present', function(){
    it('should return ""', function(){
      var req = request();
      assert('' === req.charset);
    })
  })

  describe('with charset present', function(){
    it('should return ""', function(){
      var req = request();
      req.header['content-type'] = 'text/plain';
      assert('' === req.charset);
    })
  })

  describe('with a charset', function(){
    it('should return the charset', function(){
      var req = request();
      req.header['content-type'] = 'text/plain; charset=utf-8';
      req.charset.should.equal('utf-8');
    })
  })
})
