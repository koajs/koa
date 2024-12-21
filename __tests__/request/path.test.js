'use strict'

import { describe, it } from 'node:test'
import assert from 'assert'
import context from '../../test-helpers/context.js'
import parseurl from 'parseurl'

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
