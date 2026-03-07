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
