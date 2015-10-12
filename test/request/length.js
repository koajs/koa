
'use strict';

const request = require('../helpers/context').request;
const assert = require('assert');

describe('ctx.length', function(){
  it('should return length in content-length', function(){
    const req = request();
    req.header['content-length'] = '10';
    req.length.should.equal(10);
  });

  describe('with no content-length present', function(){
    const req = request();
    assert(null == req.length);
  });
});
