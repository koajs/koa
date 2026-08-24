'use strict'

const { describe, it } = require('node:test')
const context = require('../../test-helpers/context')
const assert = require('node:assert/strict')
const httpAssert = require('http-assert')
const Koa = require('../..')

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

  it('should throw Koa HttpError instances', () => {
    const ctx = context()

    assert.throws(() => {
      ctx.assert(false, 404, 'custom message')
    }, err => {
      assert.strictEqual(err instanceof Koa.HttpError, true)
      assert.strictEqual(err.status, 404)
      assert.strictEqual(err.message, 'custom message')
      assert.strictEqual(err.expose, true)
      return true
    })
  })

  it('should throw Koa HttpError instances with default status', () => {
    const ctx = context()

    assert.throws(() => {
      ctx.assert(false, 'custom message without status')
    }, err => {
      assert.strictEqual(err instanceof Koa.HttpError, true)
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.message, 'custom message without status')
      assert.strictEqual(err.expose, false)
      return true
    })
  })

  it('should throw Koa HttpError instances from assertion helpers', () => {
    const ctx = context()

    assert.throws(() => {
      ctx.assert.equal('actual', 'expected', 400, 'custom message')
    }, err => {
      assert.strictEqual(err instanceof Koa.HttpError, true)
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.message, 'custom message')
      assert.strictEqual(err.expose, true)
      return true
    })
  })

  it('should throw Koa HttpError instances from assertion helpers without explicit status', () => {
    const ctx = context()

    assert.throws(() => {
      ctx.assert.ok(false, 'custom helper message without status')
    }, err => {
      assert.strictEqual(err instanceof Koa.HttpError, true)
      assert.strictEqual(err.status, 500)
      assert.strictEqual(err.message, 'custom helper message without status')
      assert.strictEqual(err.expose, false)
      return true
    })
  })

  it('should rethrow non-http assertion helper errors unchanged', () => {
    const ctx = context()
    const originalFail = httpAssert.fail
    const error = new Error('custom helper failure')

    httpAssert.fail = function () {
      throw error
    }

    try {
      assert.throws(() => {
        ctx.assert.fail()
      }, err => {
        assert.strictEqual(err, error)
        return true
      })
    } finally {
      httpAssert.fail = originalFail
    }
  })
})
