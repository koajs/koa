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

  it('should not assign multiple values to singleton headers', () => {
    const ctx = context()

    assert.throws(() => {
      ctx.set('content-length', ['1', '2'])
    }, /content-length must contain exactly one value/)

    assert.throws(() => {
      ctx.set({ 'Content-Length': ['1', '2'] })
    }, /Content-Length must contain exactly one value/)

    assert.throws(() => {
      ctx.set({ 'cOnTeNt-TyPe': ['text/plain', 'application/json'] })
    }, /cOnTeNt-TyPe must contain exactly one value/)
  })

  it('should normalize singleton header arrays', () => {
    const ctx = context()

    ctx.set('Content-Length', ['1'])
    assert.strictEqual(ctx.response.get('Content-Length'), '1')

    ctx.set({ 'Content-Type': ['application/json'] })
    ctx.body = { ok: true }
    assert.strictEqual(ctx.response.get('Content-Type'), 'application/json')

    ctx.set('Content-Type', ['application/json'])
    ctx.body = { ok: true }
    assert.strictEqual(ctx.response.get('Content-Type'), 'application/json')
  })

  it('should reject empty arrays for singleton headers', () => {
    const ctx = context()

    assert.throws(() => ctx.set('Content-Type', []), /must contain exactly one value/)
    assert.throws(() => ctx.set('Content-Length', []), /must contain exactly one value/)
    assert.throws(() => ctx.set({ 'Content-Type': [] }), /must contain exactly one value/)
    assert.throws(() => ctx.set({ 'Content-Length': [] }), /must contain exactly one value/)
  })

  it('should validate every field before assigning any values', () => {
    const ctx = context()

    assert.throws(() => {
      ctx.set({
        'X-Foo': 'bar',
        'Content-Length': ['1', '2']
      })
    }, /Content-Length must contain exactly one value/)

    assert.strictEqual(ctx.response.header['x-foo'], undefined)
  })

  it('should read each field value once', () => {
    const ctx = context()
    let reads = 0
    const fields = {
      get 'Content-Length' () {
        reads++
        return reads === 1 ? '1' : ['1', '2']
      }
    }

    ctx.set(fields)

    assert.strictEqual(reads, 1)
    assert.strictEqual(ctx.response.header['content-length'], '1')
  })
})
