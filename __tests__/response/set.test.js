'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const context = require('../../test-helpers/context')

describe('ctx.set(name, val)', () => {
  it('should set a field value', () => {
    const ctx = context()
    ctx.set('x-foo', 'bar')
    assert.strictEqual(ctx.response.get('x-foo'), 'bar')
  })

  it('should coerce number to string', () => {
    const ctx = context()
    ctx.set('x-foo', 5)
    assert.strictEqual(ctx.response.header['x-foo'], 5)
  })

  it('should coerce undefined to string', () => {
    const ctx = context()
    ctx.set('x-foo', undefined)
    assert.strictEqual(ctx.response.header['x-foo'], undefined)
  })

  it('should set a field value of array', () => {
    const ctx = context()
    ctx.set('x-foo', ['foo', 'bar', 123])
    assert.deepStrictEqual(ctx.response.header['x-foo'], ['foo', 'bar', 123])
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

describe('ctx.set(object) Content-Type singleton guard', () => {
  it('should throw when Content-Type is set to an array via the object form', () => {
    const ctx = context()
    assert.throws(
      () => ctx.set({ 'Content-Type': ['text/html', 'text/plain'] }),
      { message: 'Assign multiple Content-Type for response header is not allowed' }
    )
  })

  it('should throw regardless of header name casing in the object form', () => {
    const ctx = context()
    assert.throws(
      () => ctx.set({ 'content-type': ['application/json', 'text/plain'] }),
      { message: 'Assign multiple Content-Type for response header is not allowed' }
    )
  })
})
