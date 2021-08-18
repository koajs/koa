
'use strict'

const assert = require('assert')
const request = require('../../test-helpers/context').request

describe('req.secure', () => {
  it('should return true when encrypted', () => {
    const req = request()
    req.req.socket = { encrypted: true }
    assert.strictEqual(req.secure, true)
  })
})
