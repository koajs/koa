
'use strict';

const response = require('../helpers/context').response;

describe('res.writable', () => {
  it('should return the request is writable', () => {
    const res = response();
    res.writable.should.be.ok;
  });

  describe('when res.socket not present', () => {
    it('should return the request is not writable', () => {
      const res = response();
      res.res.socket = null;
      res.writable.should.not.be.ok;
    });
  });
});
