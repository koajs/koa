
'use strict';

const request = require('../helpers/context').request;
const assert = require('assert');
const util = require('util');

describe('req.inspect()', () => {
  describe('with no request.req present', () => {
    it('should return null', () => {
      const req = request();
      req.method = 'GET';
      delete req.req;
      assert(undefined === req.inspect());
      assert('undefined' === util.inspect(req));
    });
  });

  it('should return a json representation', () => {
    const req = request();
    req.method = 'GET';
    req.url = 'example.com';
    req.header.host = 'example.com';

    const expected = {
      method: 'GET',
      url: 'example.com',
      header: {
        host: 'example.com'
      }
    };

    assert.deepEqual(req.inspect(), expected);
    assert.deepEqual(util.inspect(req), util.inspect(expected));
  });
});
