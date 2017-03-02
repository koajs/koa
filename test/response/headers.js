
'use strict';

const response = require('../helpers/context').response;

describe('res.headers', () => {
  it('should return the response header object', () => {
    const res = response();
    res.set('X-Foo', 'bar');
    expect(res.headers).toEqual({ 'x-foo': 'bar' });
  });

  describe('when res._headers not present', () => {
    it('should return empty object', () => {
      const res = response();
      res.res._headers = null;
      expect(res.headers).toEqual({});
    });
  });
});
