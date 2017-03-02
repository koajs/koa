
'use strict';

const request = require('../helpers/context').request;

describe('req.inspect()', () => {
  describe('with no request.req present', () => {
    it('should return null', () => {
      const req = request();
      req.method = 'GET';
      delete req.req;
      expect(req.inspect()).toBe(undefined);
    });
  });

  it('should return a json representation', () => {
    const req = request();
    req.method = 'GET';
    req.url = 'example.com';
    req.header.host = 'example.com';

    expect(req.inspect()).toEqual({
      method: 'GET',
      url: 'example.com',
      header: {
        host: 'example.com'
      }
    });
  });
});
