
'use strict';

const response = require('../helpers/context').response;

describe('res.etag=', () => {
  it('should not modify an etag with quotes', () => {
    const res = response();
    res.etag = '"asdf"';
    res.header.etag.should.equal('"asdf"');
  });

  it('should not modify a weak etag', () => {
    const res = response();
    res.etag = 'W/"asdf"';
    res.header.etag.should.equal('W/"asdf"');
  });

  it('should add quotes around an etag if necessary', () => {
    const res = response();
    res.etag = 'asdf';
    res.header.etag.should.equal('"asdf"');
  });
});

describe('res.etag', () => {
  it('should return etag', () => {
    const res = response();
    res.etag = '"asdf"';
    res.etag.should.equal('"asdf"');
  });
});
