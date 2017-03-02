'use strict';

const response = require('../helpers/context').response;

describe('res.inspect()', () => {
  describe('with no response.res present', () => {
    it('should return undefined', () => {
      const res = response();
      res.body = 'hello';
      delete res.res;
      expect(res.inspect()).toBe(undefined);
    });
  });

  it('should return a json representation', () => {
    const res = response();
    res.body = 'hello';

    expect(res.inspect()).toEqual({
      body: 'hello',
      status: 200,
      message: 'OK',
      header: {
        'content-length': '5',
        'content-type': 'text/plain; charset=utf-8'
      }
    });
  });
});
