
'use strict'

const assert = require('assert')
const context = require('../../test-helpers/context')
const URLSearchParams = require('url').URLSearchParams

describe('ctx.searchParams', () => {
  it('should return the searchParams', () => {
    const ctx = context({ url: '/' })
    assert(ctx.searchParams instanceof URLSearchParams)
  })

  it('should return a parsed query params', () => {
    const ctx = context({ url: '/store/shoes?page=2&color=blue' })
    assert.strictEqual(ctx.searchParams.get('page'), '2')
    assert.strictEqual(ctx.searchParams.get('color'), 'blue')
  })

  it('should update when querystring change', () => {
    const ctx = context({ url: '/store/shoes?page=1' })
    assert.strictEqual(ctx.searchParams.get('page'), '1')

    ctx.querystring = 'page=2'
    assert.strictEqual(ctx.searchParams.get('page'), '2')
  })

  it('should update when query change', () => {
    const ctx = context({ url: '/store/shoes?page=1' })
    assert.strictEqual(ctx.searchParams.get('page'), '1')

    ctx.query = { page: 2 }
    assert.strictEqual(ctx.searchParams.get('page'), '2')
  })
})
