
'use strict'

const assert = require('assert')
const request = require('../../test-helpers/context').request

describe('req.header', () => {
  it('should return the request header object', () => {
    const req = request()
    assert.deepStrictEqual(req.header, req.req.headers)
  })

  it('should set the request header object', () => {
    const req = request()
    req.header = { 'X-Custom-Headerfield': 'Its one header, with headerfields' }
    assert.deepStrictEqual(req.header, req.req.headers)
  })
})
