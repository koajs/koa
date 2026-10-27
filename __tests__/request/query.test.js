'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const context = require('../../test-helpers/context')

describe('ctx.query', () => {
  it('should preserve prototype keys through parsing, caching and rewriting', () => {
    const ctx = context({ url: '/?__proto__=a&%5F%5Fproto%5F%5F=b&x=1' })
    const query = ctx.query
    const name = '__proto__'
    assert.strictEqual(Object.getPrototypeOf(query), Object.prototype)
    assert.strictEqual(Object.hasOwn(query, name), true)
    assert.deepStrictEqual(query[name], ['a', 'b'])
    assert.strictEqual(ctx.query, query)
    ctx.query = query
    assert.strictEqual(Object.getPrototypeOf(ctx.query), Object.prototype)
    assert.deepStrictEqual(ctx.query[name], ['a', 'b'])
    assert.strictEqual(ctx.query.x, '1')
  })

  describe('when missing', () => {
    it('should return an empty object', () => {
      const ctx = context({ url: '/' })
      assert(!Object.keys(ctx.query).length)
    })

    it('should return the same object each time it\'s accessed', () => {
      const ctx = context({ url: '/' })
      ctx.query.a = '2'
      assert.strictEqual(ctx.query.a, '2')
    })
  })

  it('should return a parsed query string', () => {
    const ctx = context({ url: '/?page=2' })
    assert.strictEqual(ctx.query.page, '2')
  })
})

describe('ctx.query cache', () => {
  const keys = ['__proto__', 'constructor', 'toString', 'hasOwnProperty', '%5F%5Fproto%5F%5F']

  keys.forEach(key => {
    it(`should parse and cache a bare ${key} query`, () => {
      const url = `/?${key}`
      const ctx = context({ url })
      const query = ctx.query
      const name = decodeURIComponent(key)
      assert.notStrictEqual(query, Object.prototype)
      assert.strictEqual(Object.getPrototypeOf(query), Object.prototype)
      assert.strictEqual(Object.hasOwn(query, name), true)
      assert.strictEqual(query[name], '')
      assert.strictEqual(ctx.query, query)
      query.extra = 'local'
      const other = context({ url })
      assert.strictEqual(other.query.extra, undefined)
    })
  })

  it('should retain separate cached queries after query string changes', () => {
    const ctx = context({ url: '/?__proto__' })
    const first = ctx.query
    assert.notStrictEqual(first, Object.prototype)
    ctx.querystring = 'constructor'
    assert.strictEqual(Object.hasOwn(ctx.query, 'constructor'), true)
    assert.notStrictEqual(ctx.query, first)
    ctx.querystring = '__proto__'
    assert.strictEqual(ctx.query, first)
  })
})

describe('ctx.query=', () => {
  it('should stringify and replace the query string and search', () => {
    const ctx = context({ url: '/store/shoes' })
    ctx.query = { page: 2, color: 'blue' }
    assert.strictEqual(ctx.url, '/store/shoes?page=2&color=blue')
    assert.strictEqual(ctx.querystring, 'page=2&color=blue')
    assert.strictEqual(ctx.search, '?page=2&color=blue')
  })

  it('should change .url but not .originalUrl', () => {
    const ctx = context({ url: '/store/shoes' })
    ctx.query = { page: 2 }
    assert.strictEqual(ctx.url, '/store/shoes?page=2')
    assert.strictEqual(ctx.originalUrl, '/store/shoes')
    assert.strictEqual(ctx.request.originalUrl, '/store/shoes')
  })
})
