
'use strict';

const request = require('../helpers/context').request;

describe('req.secure', () => {
  it('should return true when encrypted', () => {
    const req = request();
    req.req.socket = { encrypted: true };
    req.secure.should.be.true;
  });
});
