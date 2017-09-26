
'use strict';

const request = require('../helpers/context').request;
const assert = require('assert');

describe('req.URL', () => {
  describe('should not throw when', () => {
    it('host is void', () => {
      const req = request();
      assert.doesNotThrow(() => req.URL, TypeError);
    });

    it('header.host is invalid', () => {
      const req = request();
      req.header.host = 'invalid host';
      assert.doesNotThrow(() => req.URL, TypeError);
    });
  });

  it('should return empty object when invalid', () => {
    const req = request();
    req.header.host = 'invalid host';
    assert.deepStrictEqual(req.URL, Object.create(null));
  });
});
