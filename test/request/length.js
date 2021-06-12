
'use strict';

const request = require('../helpers/context').request;
const assert = require('assert');

describe('ctx.length', () => {
  it('should return length in content-length', () => {
    const req = request();
    req.header['content-length'] = '10';
    assert.equal(req.length, 10);
  });

  it('should return undefined with no content-length present', () => {
    const req = request();
    assert.equal(req.length, undefined);
  });
});
