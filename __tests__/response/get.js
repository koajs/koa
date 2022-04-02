
'use strict'

const assert = require('assert')
const context = require('../../test-helpers/context')

describe('ctx.get(name)', () => {
  it('should get a field value, case insensitive', () => {
    const ctx = context()
    ctx.set('X-Foo', 'bar')
    assert.strictEqual(ctx.response.get('x-FOO'), 'bar')
  })

  it('should have the same behavior as ctx.res.getHeader on undefined and null values', () => {
    const ctx = context()
    ctx.res.setHeader('X-Foo', undefined)
    ctx.response.header['x-boo'] = null
    assert.strictEqual(ctx.response.get('x-FOO'), ctx.res.getHeader('X-FOO'))
    assert.strictEqual(ctx.response.get('x-bOO'), ctx.res.getHeader('X-BOO'))
  })

  it('should not convert header value type', () => {
    const ctx = context()
    ctx.res.setHeader('Foo-date', new Date())
    ctx.response.header['foo-map'] = new Map()
    ctx.res.setHeader('Foo-empty-string', '')
    ctx.res.setHeader('Foo-number', 0)
    ctx.res.setHeader('Foo-null', null)
    ctx.res.setHeader('Foo-undefined', undefined)
    assert.ok(ctx.response.get('foo-Date') instanceof Date)
    assert.ok(ctx.response.get('foo-Map') instanceof Map)
    assert.strictEqual(ctx.response.get('Foo-empty-String'), '')
    assert.strictEqual(ctx.response.get('Foo-Number'), 0)
    assert.ok(ctx.response.get('foo-NULL') === null)
    assert.ok(typeof ctx.response.get('FOO-undefined') === 'undefined')
  })
})
