'use strict'

import { describe, it } from 'node:test'
import { request } from '../../test-helpers/context.js'
import assert from 'assert'

describe('ctx.length', () => {
  it('should return length in content-length', () => {
    const req = request()
    req.header['content-length'] = '10'
    assert.strictEqual(req.length, 10)
  })

  it('should return undefined with no content-length present', () => {
    const req = request()
    assert.strictEqual(req.length, undefined)
  })
})
