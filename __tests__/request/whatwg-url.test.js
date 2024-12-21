'use strict'

import { describe, it } from 'node:test'
import { request } from '../../test-helpers/context.js'
import assert from 'assert'

describe('req.URL', () => {
  it('should not throw when host is void', () => {
    // Accessing the URL should not throw.
    request().URL // eslint-disable-line no-unused-expressions
  })

  it('should not throw when header.host is invalid', () => {
    const req = request()
    req.header.host = 'invalid host'
    // Accessing the URL should not throw.
    req.URL // eslint-disable-line no-unused-expressions
  })

  it('should return empty object when invalid', () => {
    const req = request()
    req.header.host = 'invalid host'
    assert.deepStrictEqual(req.URL, Object.create(null))
  })
})
