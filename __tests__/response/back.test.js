'use strict'

import { describe, it } from 'node:test'
import assert from 'assert'
import context from '../../test-helpers/context.js'

describe('ctx.back([alt])', () => {
  it('should redirect to Referrer', () => {
    const ctx = context()
    ctx.req.headers.referrer = '/login'
    ctx.back()
    assert.equal(ctx.response.header.location, '/login')
  })

  it('should redirect to Referer', () => {
    const ctx = context()
    ctx.req.headers.referer = '/login'
    ctx.back()
    assert.equal(ctx.response.header.location, '/login')
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
})
