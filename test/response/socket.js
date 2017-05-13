
'use strict';

const assert = require('assert');
const response = require('../helpers/context').response;
const Stream = require('stream');

describe('res.socket', () => {
  it('should return the request socket object', () => {
    const res = response();
    assert.equal(res.socket instanceof Stream, true);
  });
});
