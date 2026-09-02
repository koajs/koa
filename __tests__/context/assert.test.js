'use strict'

const { describe, it } = require('node:test')
const context = require('../../test-helpers/context')
const assert = require('node:assert/strict')
const httpAssert = require('http-assert')
const httpAssertCreateError = require(require.resolve('http-errors', { paths: [require.resolve('http-assert')] }))
const Koa = require('../..')

const ASSERT_METHOD_FAILURES = [
  { method: 'fail', args: [400, 'custom message'] },
  { method: 'equal', args: [1, 2, 400, 'custom message'] },
  { method: 'notEqual', args: [1, '1', 400, 'custom message'] },
  { method: 'ok', args: [false, 400, 'custom message'] },
  { method: 'strictEqual', args: [1, '1', 400, 'custom message'] },
  { method: 'notStrictEqual', args: [1, 1, 400, 'custom message'] },
  { method: 'deepEqual', args: [{ ok: true }, { ok: false }, 400, 'custom message'] },
  { method: 'notDeepEqual', args: [{ ok: true }, { ok: true }, 400, 'custom message'] }
]

function captureError (fn) {
  let caught

  try {
    fn()
  } catch (err) {
    caught = err
  }

  assert(caught)
  return caught
}

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

  it('should throw an error that is instanceof Koa.HttpError', () => {
    const ctx = context()
    const err = captureError(() => ctx.assert(false, 404, 'custom message'))

    assert.strictEqual(err instanceof Koa.HttpError, true)
    assert.strictEqual(Koa.isHttpError(err), true)
    assert.strictEqual(err.status, 404)
    assert.strictEqual(err.statusCode, 404)
    assert.strictEqual(err.message, 'custom message')
    assert.strictEqual(err.expose, true)
  })

  it('should preserve the original http-assert error', () => {
    const ctx = context()
    const err = captureError(() => ctx.assert(false, 401, 'custom message'))

    assert.strictEqual(ctx.assert, httpAssert)
    assert.strictEqual(err instanceof httpAssertCreateError.HttpError, true)
    assert.strictEqual(err.constructor, httpAssertCreateError.Unauthorized)
    assert.strictEqual(err instanceof Koa.HttpError, true)
  })

  it('should preserve custom error options', () => {
    const ctx = context()
    const err = captureError(() => {
      ctx.assert(false, 401, 'custom message', {
        code: 'AUTH_REQUIRED',
        headers: {
          'www-authenticate': 'Bearer'
        }
      })
    })

    assert.strictEqual(err.code, 'AUTH_REQUIRED')
    assert.deepStrictEqual(err.headers, {
      'www-authenticate': 'Bearer'
    })
  })

  it('should not throw when value is truthy', () => {
    const ctx = context()

    ctx.assert(true, 404, 'custom message')
    ctx.assert(1, 404)
    ctx.assert('ok', 404)
  })
})

describe('ctx.assert named methods', () => {
  ASSERT_METHOD_FAILURES.forEach(({ method, args }) => {
    it(`ctx.assert.${method}() should throw an error that is instanceof Koa.HttpError`, () => {
      const ctx = context()
      const err = captureError(() => ctx.assert[method](...args))

      assert.strictEqual(err instanceof Koa.HttpError, true)
      assert.strictEqual(Koa.isHttpError(err), true)
      assert.strictEqual(err.status, 400)
      assert.strictEqual(err.message, 'custom message')
    })
  })
})
