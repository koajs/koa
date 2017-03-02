
'use strict';

const request = require('../helpers/context').request;

describe('req.headers', () => {
  it('should return the request header object', () => {
    const req = request();
    expect(req.headers).toBe(req.req.headers);
  });
});
