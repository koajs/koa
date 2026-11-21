'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const context = require('../../test-helpers/context')

describe('ctx.back([alt])', () => {
  it('should redirect to Referrer', () => {
    const ctx = context({ url: '/', headers: { host: 'example.com' } })
    ctx.req.headers.referrer = '/login'
    ctx.back()
    assert.equal(ctx.response.header.location, '/login')
  })

  it('should redirect to the same origin referrer', () => {
    const ctx = context()
    ctx.req.headers.host = 'example.com'
    ctx.req.headers.referrer = 'https://example.com/login'
    ctx.back()
    assert.equal(ctx.response.header.location, 'https://example.com/login')
  })

  it('should redirect to same origin referrer when host is uppercase', () => {
    const ctx = context({ url: '/', headers: { host: 'EXAMPLE.COM' } })
    ctx.req.headers.referrer = 'https://example.com/login'
    ctx.back('/fallback')
    assert.equal(ctx.response.header.location, 'https://example.com/login')
  })

  it('should redirect to same origin referrer when host includes default port', () => {
    const ctx = context({ url: '/', headers: { host: 'example.com:80' } })
    ctx.req.headers.referrer = 'http://example.com/login'
    ctx.back('/fallback')
    assert.equal(ctx.response.header.location, 'http://example.com/login')
  })

  it('should not redirect to referrer when ports differ', () => {
    const ctx = context({ url: '/', headers: { host: 'example.com:8080' } })
    ctx.req.headers.referrer = 'http://example.com/login'
    ctx.back('/fallback')
    assert.equal(ctx.response.header.location, '/fallback')
  })

  it('should not redirect to referrer when schemes differ and host specifies referrer default port', () => {
    const ctx = context({ url: '/', headers: { host: 'example.com:443' } })
    ctx.req.headers.referrer = 'https://example.com/login'
    ctx.back('/fallback')
    assert.equal(ctx.response.header.location, '/fallback')
  })

  it('should not redirect to opaque or unsafe referrer schemes', () => {
    const ctx = context({ url: '/', headers: { host: 'example.com' } })
    ctx.req.headers.referrer = 'javascript:alert(1)'
    ctx.back('/fallback')
    assert.equal(ctx.response.header.location, '/fallback')
  })

  it('should redirect to root if the same origin referrer is not present', () => {
    const ctx = context()
    ctx.req.headers.host = 'example.com'
    ctx.req.headers.referrer = 'https://other.com/login'
    ctx.back()
    assert.equal(ctx.response.header.location, '/')
  })

  it('should redirect to Referer to a relative path', () => {
    const ctx = context({ url: '/', headers: { host: 'example.com' } })
    ctx.req.headers.referer = '/login'
    ctx.back()
    assert.equal(ctx.response.header.location, '/login')
  })

  it('should redirect to Referer to a same origin url', () => {
    const ctx = context({ url: '/', headers: { host: 'example.com', referer: 'https://example.com/login' } })
    ctx.back()
    assert.equal(ctx.response.header.location, 'https://example.com/login')
  })

  it('should default to alt', () => {
    const ctx = context()
    ctx.back('/index.html')
    assert.equal(ctx.response.header.location, '/index.html')
  })

  it('should default redirect to /', () => {
    const ctx = context()
    ctx.back()
    assert.equal(ctx.response.header.location, '/')
  })

  it('should fix Trailing Double-Slash security issue', () => {
    const ctx = context({ url: '/', headers: { host: 'example.com' } })
    ctx.req.headers.referrer = '//evil.com/login/'
    ctx.back()
    assert.equal(ctx.response.header.location, '/')

    ctx.back('/home')
    assert.equal(ctx.response.header.location, '/home')
  })
})
