
'use strict'

const assert = require('assert')
const context = require('../../test-helpers/context')
const parseurl = require('parseurl')

describe('ctx.path', () => {
  it('should return the pathname', () => {
    const ctx = context()
    ctx.url = '/login?next=/dashboard'
    assert.strictEqual(ctx.path, '/login')
  })
})

describe('ctx.path=', () => {
  it('should set the pathname', () => {
    const ctx = context()
    ctx.url = '/login?next=/dashboard'

    ctx.path = '/logout'
    assert.strictEqual(ctx.path, '/logout')
    assert.strictEqual(ctx.url, '/logout?next=/dashboard')
  })

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/login' })
    ctx.path = '/logout'
    assert.strictEqual(ctx.url, '/logout')
    assert.strictEqual(ctx.originalUrl, '/login')
    assert.strictEqual(ctx.request.originalUrl, '/login')
  })

  it('should not affect parseurl', () => {
    const ctx = context({ url: '/login?foo=bar' })
    ctx.path = '/login'
    const url = parseurl(ctx.req)
    assert.strictEqual(url.path, '/login?foo=bar')
  })
})
