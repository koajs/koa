
'use strict';

const request = require('../helpers/context').request;

describe('req.header', () => {
  it('should return the request header object', () => {
    const req = request();
    req.header.should.equal(req.req.headers);
  });
});
