
'use strict';

const response = require('../helpers/context').response;

describe('res.etag=', () => {
  it('should not modify an etag with quotes', () => {
    const res = response();
    res.etag = '"asdf"';
    expect(res.header.etag).toBe('"asdf"');
  });

  it('should not modify a weak etag', () => {
    const res = response();
    res.etag = 'W/"asdf"';
    expect(res.header.etag).toBe('W/"asdf"');
  });

  it('should add quotes around an etag if necessary', () => {
    const res = response();
    res.etag = 'asdf';
    expect(res.header.etag).toBe('"asdf"');
  });
});

describe('res.etag', () => {
  it('should return etag', () => {
    const res = response();
    res.etag = '"asdf"';
    expect(res.etag).toBe('"asdf"');
  });
});
