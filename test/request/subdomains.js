
'use strict';

const assert = require('assert');
const request = require('../helpers/context').request;

describe('req.subdomains', () => {
  it('should return subdomain array', () => {
    const req = request();
    req.header.host = 'tobi.ferrets.example.com';
    req.app.subdomainOffset = 2;
    assert.deepEqual(req.subdomains, ['ferrets', 'tobi']);

    req.app.subdomainOffset = 3;
    assert.deepEqual(req.subdomains, ['tobi']);
  });

  it('should work with no host present', () => {
    const req = request();
    assert.deepEqual(req.subdomains, []);
  });

  it('should check if the host is an ip address, even with a port', () => {
    const req = request();
    req.header.host = '127.0.0.1:3000';
    assert.deepEqual(req.subdomains, []);
  });
});
