
'use strict'

const response = require('../../test-helpers/context').response
const assert = require('assert')
const util = require('util')

describe('res.inspect()', () => {
  describe('with no response.res present', () => {
    it('should return null', () => {
      const res = response()
      res.body = 'hello'
      delete res.res
      assert.strictEqual(res.inspect(), undefined)
      assert.strictEqual(util.inspect(res), 'undefined')
    })
  })

  it('should return a json representation', () => {
    const res = response()
    res.body = 'hello'

    const expected = {
      status: 200,
      message: 'OK',
      header: {
        'content-type': 'text/plain; charset=utf-8',
        'content-length': '5'
      },
      body: 'hello'
    }

    assert.deepStrictEqual(res.inspect(), expected)
    assert.deepStrictEqual(util.inspect(res), util.inspect(expected))
  })
})
