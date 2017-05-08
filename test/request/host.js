
'use strict';

const request = require('../helpers/context').request;
const assert = require('assert');

describe('req.host', () => {
  it('should return host with port', () => {
    const req = request();
    req.header.host = 'foo.com:3000';
    assert.equal(req.host, 'foo.com:3000');
  });

  describe('with no host present', () => {
    it('should return ""', () => {
      const req = request();
      assert.equal(req.host, '');
    });
  });

  describe('when X-Forwarded-Host is present', () => {
    describe('and proxy is not trusted', () => {
      it('should be ignored', () => {
        const req = request();
        req.header['x-forwarded-host'] = 'bar.com';
        req.header.host = 'foo.com';
        assert.equal(req.host, 'foo.com');
      });
    });

    describe('and proxy is trusted', () => {
      it('should be used', () => {
        const req = request();
        req.app.proxy = true;
        req.header['x-forwarded-host'] = 'bar.com, baz.com';
        req.header.host = 'foo.com';
        assert.equal(req.host, 'bar.com');
      });
    });
  });
});
