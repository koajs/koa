'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const Koa = require('../..')
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

  for (const host of [undefined, '']) {
    const name = host === undefined ? 'a missing' : 'an empty'
    const headers = host === undefined ? {} : { host }

    it(`should return no subdomains with ${name} host and constructor offset zero`, () => {
      const app = new Koa({ subdomainOffset: 0 })
      const req = request({ headers }, undefined, app)
      assert.deepStrictEqual(req.subdomains, [])
    })

    it(`should return no subdomains with ${name} host and dynamic offset zero`, () => {
      const req = request({ headers })
      req.app.subdomainOffset = 0
      assert.deepStrictEqual(req.subdomains, [])
    })
  }

  it('should retain a single-label hostname with constructor offset zero', () => {
    const app = new Koa({ subdomainOffset: 0 })
    const req = request({ headers: { host: 'localhost' } }, undefined, app)
    assert.deepStrictEqual(req.subdomains, ['localhost'])
  })

  it('should check if the host is an ip address, even with a port', () => {
    const req = request()
    req.header.host = '127.0.0.1:3000'
    assert.deepStrictEqual(req.subdomains, [])
  })

  const ipv6Hosts = ['[::1]', '[::1]:3000', '[::ffff:127.0.0.1]:3000']
  ipv6Hosts.forEach(host => {
    it(`should return no subdomains for IPv6 host ${host}`, () => {
      const req = request({ url: 'http://example.com/foo' })
      req.app.subdomainOffset = 0
      req.header.host = host
      assert.deepStrictEqual(req.subdomains, [])

      req.app.proxy = true
      req.header['x-forwarded-host'] = `${host}, example.com`
      assert.deepStrictEqual(req.subdomains, [])
    })
  })
})
