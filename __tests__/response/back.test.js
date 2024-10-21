'use strict'

const { describe, it } = require('node:test')
const assert = require('assert')
const context = require('../../test-helpers/context')

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
