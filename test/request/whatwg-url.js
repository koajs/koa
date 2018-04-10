
'use strict';

const request = require('../helpers/context').request;
const assert = require('assert');

describe('req.URL', () => {
  describe('should not throw when', () => {
    it('host is void', () => {
      // Accessing the URL should not throw.
      request().URL;
    });

    it('header.host is invalid', () => {
      const req = request();
      req.header.host = 'invalid host';
      // Accessing the URL should not throw.
      req.URL;
    });
  });

  it('should return empty object when invalid', () => {
    const req = request();
    req.header.host = 'invalid host';
    assert.deepStrictEqual(req.URL, Object.create(null));
  });
});
