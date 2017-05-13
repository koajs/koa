
'use strict';

const assert = require('assert');
const request = require('../helpers/context').request;

describe('req.header', () => {
  it('should return the request header object', () => {
    const req = request();
    assert.deepEqual(req.header, req.req.headers);
  });
});
