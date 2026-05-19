'use strict'

const { describe, it } = require('node:test')
const request = require('../../test-helpers/context').request
const assert = require('node:assert/strict')

describe('ctx.length', () => {
  it('should return length in content-length', () => {
    const req = request()
    req.header['content-length'] = '10'
    assert.strictEqual(req.length, 10)
  })

  it('should return undefined with no content-length present', () => {
    const req = request()
    assert.strictEqual(req.length, undefined)
  })

  it('should handle zero content-length', () => {
    const req = request()
    req.header['content-length'] = '0'
    assert.strictEqual(req.length, 0)
  })

  it('should handle Content-Length > 2GB (2147483648)', () => {
    const req = request()
    req.header['content-length'] = '2147483648' // 2GB + 1 byte
    assert.strictEqual(req.length, 2147483648)
  })

  it('should handle very large Content-Length (10GB)', () => {
    const req = request()
    req.header['content-length'] = '10000000000' // 10 billion bytes
    assert.strictEqual(req.length, 10000000000)
  })

  it('should handle floating-point-like strings (truncate decimal)', () => {
    const req = request()
    req.header['content-length'] = '10.5'
    assert.strictEqual(req.length, 10)
  })

  it('should return undefined for non-numeric strings', () => {
    const req = request()
    req.header['content-length'] = 'invalid'
    assert.strictEqual(req.length, undefined)
  })

  it('should return undefined for empty string', () => {
    const req = request()
    req.header['content-length'] = ''
    assert.strictEqual(req.length, undefined)
  })
})
