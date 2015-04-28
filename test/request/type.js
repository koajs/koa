
var request = require('../context').request;
var assert = require('assert');

describe('req.type', function(){
  it('should return type void of parameters', function(){
    var req = request();
    req.header['content-type'] = 'text/html; charset=utf-8';
    req.type.should.equal('text/html');
  })

  describe('with no host present', function(){
    var req = request();
    assert('' === req.type);
  })
})
