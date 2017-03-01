'use strict';

const request = require('../helpers/context').request;

describe('req.header', () => {
  it('should return the request header object', () => {
    const req = request();
    expect(req.header).toBe(req.req.headers);
  });
});
