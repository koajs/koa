'use strict';

const request = require('../helpers/context').request;

describe('ctx.length', () => {
  it('should return length in content-length', () => {
    const req = request();
    req.header['content-length'] = '10';
    expect(req.length).toBe(10);
  });

  describe('with no content-length present', () => {
    const req = request();
    expect(req.length).toBe(undefined);
  });
});
