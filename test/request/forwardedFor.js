
'use strict';

const assert = require('assert');
const request = require('../helpers/context').request;

describe('req.forwardedFor', () => {
  describe('when X-Forwarded-For is present', () => {
    describe('and proxy is not trusted', () => {
      it('should be ignored', () => {
        const req = request();
        req.app.proxy = false;
        req.header['x-forwarded-for'] = '127.0.0.1,127.0.0.2';
        req.forwardedFor.should.eql([]);
      });
    });

    describe('and proxy is trusted', () => {
      it('should be used', () => {
        const req = request();
        req.app.proxy = true;
        req.header['x-forwarded-for'] = '127.0.0.1,127.0.0.2';
        req.forwardedFor.should.eql(['127.0.0.1', '127.0.0.2']);
      });
    });
  });

  it('should also be usable with deprecated .ips', () => {
    let deprecated = false;
    process.on('deprecation', message => deprecated = true);
    const req = request();
    req.app.proxy = true;
    req.header['x-forwarded-for'] = '127.0.0.1,127.0.0.2';
    req.ips.should.eql(['127.0.0.1', '127.0.0.2']);
    assert(deprecated);
  });
});
