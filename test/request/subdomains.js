
'use strict';

const request = require('../helpers/context').request;

describe('req.subdomains', () => {
  it('should return subdomain array', () => {
    const req = request();
    req.header.host = 'tobi.ferrets.example.com';
    req.app.subdomainOffset = 2;
    req.subdomains.should.eql(['ferrets', 'tobi']);

    req.app.subdomainOffset = 3;
    req.subdomains.should.eql(['tobi']);
  });

  describe('with no host present', () => {
    const req = request();
    req.subdomains.should.eql([]);
  });
});
