
'use strict';

const assert = require('assert');
const response = require('../helpers/context').response;

describe('res.headers', () => {
  it('should return the response header object', () => {
    const res = response();
    res.set('X-Foo', 'bar');
    assert.deepEqual(res.headers, { 'x-foo': 'bar' });
  });

  it('should set multiple header fields', () => {
    const res = response();

    res.headers = {
      foo: '1',
      bar: '2'
    };

    assert.equal(res.headers.foo, '1');
    assert.equal(res.headers.bar, '2');
  });

  describe('when res._headers not present', () => {
    it('should return empty object', () => {
      const res = response();
      res.res._headers = null;
      assert.deepEqual(res.headers, {});
    });
  });
});
