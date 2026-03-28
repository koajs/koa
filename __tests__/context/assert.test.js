'use strict'

const { describe, it } = require('node:test')
const context = require('../../test-helpers/context')
const assert = require('node:assert/strict')

describe('ctx.assert(value, status)', () => {
  it('should throw an error', () => {
    const ctx = context()

    let assertionRan = false
    try {
      ctx.assert(false, 404, 'custom message')
      throw new Error('should not reach here')
    } catch (err) {
      assertionRan = true
      assert.strictEqual(err.status, 404)
      assert.strictEqual(err.message, 'custom message')
      assert.strictEqual(err.expose, true)
    }
    assert(assertionRan)
  })

  it('should not throw when value is truthy', () => {
    const ctx = context()
    ctx.assert(true, 404, 'should not throw')
    ctx.assert(1, 404)
    ctx.assert('ok', 404)
  })
})

describe('ctx.assert instanceof HttpError', () => {
  it('thrown error should be instanceof HttpError', () => {
    const ctx = context()
    const { HttpError } = require('../../')

    let caught
    try {
      ctx.assert(false, 401, 'Unauthorized')
    } catch (err) {
      caught = err
    }

    assert.ok(caught instanceof HttpError, 'error should be instanceof HttpError')
    assert.strictEqual(caught.status, 401)
    assert.strictEqual(caught.message, 'Unauthorized')
  })
})

describe('ctx.assert named methods', () => {
  it('assert.equal should throw when values are not loosely equal', () => {
    const ctx = context()
    assert.throws(() => ctx.assert.equal(1, 2, 400), { status: 400 })
    ctx.assert.equal(1, '1', 400)
  })

  it('assert.notEqual should throw when values are loosely equal', () => {
    const ctx = context()
    assert.throws(() => ctx.assert.notEqual(1, '1', 400), { status: 400 })
    ctx.assert.notEqual(1, 2, 400)
  })

  it('assert.ok should throw when value is falsy', () => {
    const ctx = context()
    assert.throws(() => ctx.assert.ok(false, 400), { status: 400 })
    ctx.assert.ok(true, 400)
  })

  it('assert.strictEqual should throw when values are not strictly equal', () => {
    const ctx = context()
    assert.throws(() => ctx.assert.strictEqual(1, '1', 400), { status: 400 })
    ctx.assert.strictEqual(1, 1, 400)
  })

  it('assert.notStrictEqual should throw when values are strictly equal', () => {
    const ctx = context()
    assert.throws(() => ctx.assert.notStrictEqual(1, 1, 400), { status: 400 })
    ctx.assert.notStrictEqual(1, '1', 400)
  })

  it('assert.deepEqual should throw when values are not deeply equal', () => {
    const ctx = context()
    assert.throws(() => ctx.assert.deepEqual({ a: 1 }, { a: 2 }, 400), { status: 400 })
    ctx.assert.deepEqual({ a: 1 }, { a: 1 }, 400)
  })

  it('assert.notDeepEqual should throw when values are deeply equal', () => {
    const ctx = context()
    assert.throws(() => ctx.assert.notDeepEqual({ a: 1 }, { a: 1 }, 400), { status: 400 })
    ctx.assert.notDeepEqual({ a: 1 }, { a: 2 }, 400)
  })

  it('assert.fail should always throw', () => {
    const ctx = context()
    assert.throws(() => ctx.assert.fail(400, 'always fails'), { status: 400, message: 'always fails' })
  })
})
