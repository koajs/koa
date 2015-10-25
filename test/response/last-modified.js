
'use strict';

const response = require('../helpers/context').response;

describe('res.lastModified', () => {
  it('should set the header as a UTCString', () => {
    const res = response();
    const date = new Date();
    res.lastModified = date;
    res.header['last-modified'].should.equal(date.toUTCString());
  });

  it('should work with date strings', () => {
    const res = response();
    const date = new Date();
    res.lastModified = date.toString();
    res.header['last-modified'].should.equal(date.toUTCString());
  });

  it('should get the header as a Date', () => {
    // Note: Date() removes milliseconds, but it's practically important.
    const res = response();
    const date = new Date();
    res.lastModified = date;
    (res.lastModified.getTime() / 1000).should.equal(Math.floor(date.getTime() / 1000));
  });

  describe('when lastModified not set', () => {
    it('should get undefined', () => {
      const res = response();
      (res.lastModified === undefined).should.be.ok;
    });
  });
});
