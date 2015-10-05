
const request = require('../context').request;
const assert = require('assert');

describe('req.type', function(){
  it('should return type void of parameters', function(){
    const req = request();
    req.header['content-type'] = 'text/html; charset=utf-8';
    req.type.should.equal('text/html');
  })

  describe('with no host present', function(){
    const req = request();
    assert('' === req.type);
  })
})
