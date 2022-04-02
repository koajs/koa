
'use strict'

const assert = require('assert')
const context = require('../../test-helpers/context')

describe('ctx.set(name, val)', () => {
  it('should set a field value', () => {
    const ctx = context()
    ctx.set('x-foo', 'bar')
    assert.strictEqual(ctx.response.header['x-foo'], 'bar')
  })

  it('should coerce number to string', () => {
    const ctx = context()
    ctx.set('x-foo', 5)
    assert.strictEqual(ctx.response.header['x-foo'], '5')
  })

  it('should coerce undefined to string', () => {
    const ctx = context()
    ctx.set('x-foo', undefined)
    assert.strictEqual(ctx.response.header['x-foo'], 'undefined')
  })

  it('should set a field value of array', () => {
    const ctx = context()
    ctx.set('x-foo', ['foo', 'bar', 123])
    assert.deepStrictEqual(ctx.response.header['x-foo'], ['foo', 'bar', '123'])
  })
})

describe('ctx.set(object)', () => {
  it('should set multiple fields', () => {
    const ctx = context()

    ctx.set({
      foo: '1',
      bar: '2'
    })

    assert.strictEqual(ctx.response.header.foo, '1')
    assert.strictEqual(ctx.response.header.bar, '2')
  })
})
