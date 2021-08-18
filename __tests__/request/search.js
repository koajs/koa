
'use strict'

const assert = require('assert')
const context = require('../../test-helpers/context')

describe('ctx.search=', () => {
  it('should replace the search', () => {
    const ctx = context({ url: '/store/shoes' })
    ctx.search = '?page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.search, '?page=2&color=blue')
  })

  it('should update ctx.querystring and ctx.query', () => {
    const ctx = context({ url: '/store/shoes' })
    ctx.search = '?page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.querystring, 'page=2&color=blue')
    assert.strictEqual(ctx.query.page, '2')
    assert.strictEqual(ctx.query.color, 'blue')
  })

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/store/shoes' })
    ctx.search = '?page=2&color=blue'
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.originalUrl, '/store/shoes')
    assert.strictEqual(ctx.request.originalUrl, '/store/shoes')
  })

  describe('when missing', () => {
    it('should return ""', () => {
      const ctx = context({ url: '/store/shoes' })
      assert.strictEqual(ctx.search, '')
    })
  })
})
