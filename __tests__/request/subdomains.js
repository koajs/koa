
'use strict'

const assert = require('assert')
const request = require('../../test-helpers/context').request

describe('req.subdomains', () => {
  it('should return subdomain array', () => {
    const req = request()
    req.header.host = 'tobi.ferrets.example.com'
    req.app.subdomainOffset = 2
    assert.deepStrictEqual(req.subdomains, ['ferrets', 'tobi'])

    req.app.subdomainOffset = 3
    assert.deepStrictEqual(req.subdomains, ['tobi'])
  })

  it('should work with no host present', () => {
    const req = request()
    assert.deepStrictEqual(req.subdomains, [])
  })

  it('should check if the host is an ip address, even with a port', () => {
    const req = request()
    req.header.host = '127.0.0.1:3000'
    assert.deepStrictEqual(req.subdomains, [])
  })
})
