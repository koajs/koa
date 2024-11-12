'use strict'

import { describe, it } from 'node:test'
import assert from 'assert'
import { response } from '../../test-helpers/context.js'

describe('res.etag=', () => {
  it('should not modify an etag with quotes', () => {
    const res = response()
    res.etag = '"asdf"'
    assert.strictEqual(res.header.etag, '"asdf"')
  })

  it('should not modify a weak etag', () => {
    const res = response()
    res.etag = 'W/"asdf"'
    assert.strictEqual(res.header.etag, 'W/"asdf"')
  })

  it('should add quotes around an etag if necessary', () => {
    const res = response()
    res.etag = 'asdf'
    assert.strictEqual(res.header.etag, '"asdf"')
  })
})

describe('res.etag', () => {
  it('should return etag', () => {
    const res = response()
    res.etag = '"asdf"'
    assert.strictEqual(res.etag, '"asdf"')
  })
})
