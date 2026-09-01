'use strict'

const { describe, it } = require('node:test')
const context = require('../../test-helpers/context')
const request = context.request
const assert = require('node:assert/strict')

describe('req.URL', () => {
  it('should not throw when host is void', () => {
    // Accessing the URL should not throw.
    request().URL // eslint-disable-line no-unused-expressions
  })

  it('should not throw when header.host is invalid', () => {
    const req = request()
    req.header.host = 'invalid host'
    // Accessing the URL should not throw.
    req.URL // eslint-disable-line no-unused-expressions
  })

  it('should return empty object when invalid', () => {
    const req = request()
    req.header.host = 'invalid host'
    assert.deepStrictEqual(req.URL, Object.create(null))
  })

  describe('absolute-form request target', () => {
    it('should parse http absolute-form like href', () => {
      const ctx = context({
        url: 'http://example.com/foo?q=1',
        headers: { host: '127.0.0.1' }
      })
      assert.strictEqual(ctx.href, 'http://example.com/foo?q=1')
      assert.strictEqual(ctx.URL.href, 'http://example.com/foo?q=1')
      assert.strictEqual(ctx.URL.pathname, '/foo')
      assert.strictEqual(ctx.URL.search, '?q=1')
    })

    it('should parse https absolute-form', () => {
      const ctx = context({
        url: 'https://example.com/foo?q=1',
        headers: { host: '127.0.0.1' }
      })
      assert.strictEqual(ctx.URL.href, 'https://example.com/foo?q=1')
      assert.strictEqual(ctx.URL.protocol, 'https:')
    })

    it('should parse uppercase HTTP:// absolute-form', () => {
      const ctx = context({
        url: 'HTTP://example.com/foo',
        headers: { host: '127.0.0.1' }
      })
      assert.strictEqual(ctx.href, 'HTTP://example.com/foo')
      assert.strictEqual(ctx.URL.href, 'http://example.com/foo')
      assert.strictEqual(ctx.URL.pathname, '/foo')
    })

    it('should parse absolute-form with port', () => {
      const ctx = context({
        url: 'http://example.com:8080/foo?q=1',
        headers: { host: '127.0.0.1' }
      })
      assert.strictEqual(ctx.URL.href, 'http://example.com:8080/foo?q=1')
      assert.strictEqual(ctx.URL.host, 'example.com:8080')
    })

    it('should parse absolute-form when Host matches the URL host', () => {
      const ctx = context({
        url: 'http://example.com/foo?q=1',
        headers: { host: 'example.com' }
      })
      assert.strictEqual(ctx.URL.href, 'http://example.com/foo?q=1')
      assert.strictEqual(ctx.URL.pathname, '/foo')
    })

    it('should parse absolute-form when Host is empty', () => {
      const ctx = context({
        url: 'http://example.com/foo',
        headers: { host: '' }
      })
      assert.strictEqual(ctx.URL.href, 'http://example.com/foo')
    })

    it('should still follow originalUrl after path rewrite', () => {
      const ctx = context({
        url: 'http://example.com/foo?q=1',
        headers: { host: '127.0.0.1' }
      })
      ctx.path = '/bar'
      assert.strictEqual(ctx.url, 'http://example.com/bar?q=1')
      assert.strictEqual(ctx.href, 'http://example.com/foo?q=1')
      assert.strictEqual(ctx.URL.pathname, '/foo')
    })
  })
})
