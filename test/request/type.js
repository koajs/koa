
'use strict';

const request = require('../helpers/context').request;
const assert = require('assert');

describe('req.type', () => {
  it('should return type void of parameters', () => {
    const req = request();
    req.header['content-type'] = 'text/html; charset=utf-8';
    req.type.should.equal('text/html');
  });

  it('with no host present', () => {
    const req = request();
    assert('' === req.type);
  });
});
