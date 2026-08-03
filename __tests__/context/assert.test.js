'use strict'

const { describe, it } = require('node:test')
const context = require('../../test-helpers/context')
const assert = require('node:assert/strict')
const Koa = require('../..')

describe('ctx.assert(value, status)', () => {
  it('should throw an HttpError', () => {
    const ctx = context()

    let assertionRan = false
    try {
      ctx.assert(false, 404, 'custom message')
      throw new Error('should not reach here')
    } catch (err) {
      assertionRan = true
      assert.ok(err instanceof Koa.HttpError, 'err should be instanceof Koa.HttpError')
      assert.strictEqual(err.status, 404)
      assert.strictEqual(err.message, 'custom message')
      assert.strictEqual(err.expose, true)
    }
    assert(assertionRan)
  })

  it('should not throw when value is truthy', () => {
    const ctx = context()
    ctx.assert(true, 500, 'should not throw')
    ctx.assert(1, 500, 'should not throw')
    ctx.assert({}, 500, 'should not throw')
  })

  it('assert.ok should throw an HttpError', () => {
    const ctx = context()

    try {
      ctx.assert.ok(false, 403, 'forbidden')
      throw new Error('should not reach here')
    } catch (err) {
      assert.ok(err instanceof Koa.HttpError, 'err should be instanceof Koa.HttpError')
      assert.strictEqual(err.status, 403)
      assert.strictEqual(err.message, 'forbidden')
      assert.strictEqual(err.expose, true)
    }
  })

  it('assert.equal should throw an HttpError', () => {
    const ctx = context()

    try {
      ctx.assert.equal(1, 2, 400, 'not equal')
      throw new Error('should not reach here')
    } catch (err) {
      assert.ok(err instanceof Koa.HttpError, 'err should be instanceof Koa.HttpError')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.message, 'not equal')
    }
  })

  it('assert.strictEqual should throw an HttpError', () => {
    const ctx = context()

    try {
      ctx.assert.strictEqual(1, '1', 400, 'not strictly equal')
      throw new Error('should not reach here')
    } catch (err) {
      assert.ok(err instanceof Koa.HttpError, 'err should be instanceof Koa.HttpError')
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.message, 'not strictly equal')
    }
  })

  it('assert.notEqual should throw an HttpError', () => {
    const ctx = context()

    try {
      ctx.assert.notEqual(1, 1, 400, 'equal')
      throw new Error('should not reach here')
    } catch (err) {
      assert.ok(err instanceof Koa.HttpError, 'err should be instanceof Koa.HttpError')
      assert.strictEqual(err.status, 400)
    }
  })

  it('assert.fail should throw an HttpError', () => {
    const ctx = context()

    try {
      ctx.assert.fail(500, 'failed')
      throw new Error('should not reach here')
    } catch (err) {
      assert.ok(err instanceof Koa.HttpError, 'err should be instanceof Koa.HttpError')
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.message, 'failed')
      assert.strictEqual(err.expose, false)
    }
  })

  it('should preserve custom properties on the error', () => {
    const ctx = context()

    try {
      ctx.assert(false, 418, 'teapot', { code: 'TEAPOT', details: { a: 1 } })
      throw new Error('should not reach here')
    } catch (err) {
      assert.ok(err instanceof Koa.HttpError, 'err should be instanceof Koa.HttpError')
      assert.strictEqual(err.status, 418)
      assert.strictEqual(err.code, 'TEAPOT')
      assert.deepStrictEqual(err.details, { a: 1 })
    }
  })
})
