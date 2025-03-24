'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const Stream = require('stream')
const context = require('../../test-helpers/context')

describe('ctx.origin', () => {
  it('should return the origin of url', () => {
    const socket = new Stream.Duplex()
    const req = {
      url: '/users/1?next=/dashboard',
      headers: {
        host: 'localhost',
        origin: 'http://example.com'
      },
      socket,
      __proto__: Stream.Readable.prototype
    }
    const ctx = context(req)
    assert.strictEqual(ctx.origin, 'http://example.com')

    // change it also work
    ctx.url = '/foo/users/1?next=/dashboard'
    assert.strictEqual(ctx.origin, 'http://example.com')
  })
})
