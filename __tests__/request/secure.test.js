'use strict'

import { describe, it } from 'node:test'
import assert from 'assert'
import { request } from '../../test-helpers/context.js'

describe('req.secure', () => {
  it('should return true when encrypted', () => {
    const req = request()
    req.req.socket = { encrypted: true }
    assert.strictEqual(req.secure, true)
  })
})
