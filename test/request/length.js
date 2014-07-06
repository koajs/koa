
var assert = require('assert');
var request = require('../context').request;

describe('ctx.length', function(){
  it('should return length in content-length', function(){
    var req = request();
    req.header['content-length'] = '10';
    req.length.should.equal(10);
  })

  describe('with no content-length present', function(){
    var req = request();
    assert(null == req.length);
  })
})
