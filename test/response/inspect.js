
'use strict';

const response = require('../helpers/context').response;
const assert = require('assert');

describe('res.inspect()', () => {
  describe('with no response.res present', () => {
    it('should return null', () => {
      const res = response();
      res.body = 'hello';
      delete res.res;
      assert.equal(res.inspect(), null);
    });
  });

  it('should return a json representation', () => {
    const res = response();
    res.body = 'hello';

    assert.deepEqual({
      body: 'hello',
      status: 200,
      message: 'OK',
      header: {
        'content-length': '5',
        'content-type': 'text/plain; charset=utf-8'
      }
    }, res.inspect());
  });
});
