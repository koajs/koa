
'use strict';

const request = require('../helpers/context').request;
const assert = require('assert');

describe('req.inspect()', () => {
  describe('with no request.req present', () => {
    it('should return null', () => {
      const req = request();
      req.method = 'GET';
      delete req.req;
      assert(null == req.inspect());
    });
  });

  it('should return a json representation', () => {
    const req = request();
    req.method = 'GET';
    req.url = 'example.com';
    req.header.host = 'example.com';

    assert.deepEqual({
      method: 'GET',
      url: 'example.com',
      header: {
        host: 'example.com'
      }
    }, req.inspect());
  });
});
