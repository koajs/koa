
'use strict';

const request = require('../helpers/context').request;
const assert = require('assert');

describe('ctx.length', () => {
  it('should return length in content-length', () => {
    const req = request();
    req.header['content-length'] = '10';
    req.length.should.equal(10);
  });

  describe('with no content-length present', () => {
    const req = request();
    assert(null == req.length);
  });
});
