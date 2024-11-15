'use strict'

import { describe, it } from 'node:test'
import assert from 'assert'
import { response } from '../../test-helpers/context.js'
import Stream from 'stream'

describe('res.socket', () => {
  it('should return the request socket object', () => {
    const res = response()
    assert.strictEqual(res.socket instanceof Stream, true)
  })
})
