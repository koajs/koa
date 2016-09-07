
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

  it('should work with no host present', () => {
    const req = request();
    req.subdomains.should.eql([]);
  });

  it('should check if the host is an ip address, even with a port', () => {
    const req = request();
    req.header.host = '127.0.0.1:3000';
    req.subdomains.should.eql([]);
  });
});
