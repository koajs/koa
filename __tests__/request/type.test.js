'use strict'

import { describe, it } from 'node:test'
import { request } from '../../test-helpers/context.js'
import assert from 'assert'

describe('req.type', () => {
  it('should return type void of parameters', () => {
    const req = request()
    req.header['content-type'] = 'text/html; charset=utf-8'
    assert.strictEqual(req.type, 'text/html')
  })

  it('should return empty string with no host present', () => {
    const req = request()
    assert.strictEqual(req.type, '')
  })
})
