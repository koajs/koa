
'use strict'

const request = require('../../test-helpers/context').request
const assert = require('assert')

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
