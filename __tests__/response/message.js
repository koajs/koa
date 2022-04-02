
'use strict'

const assert = require('assert')
const response = require('../../test-helpers/context').response

describe('res.message', () => {
  it('should return the response status message', () => {
    const res = response()
    res.status = 200
    assert.strictEqual(res.message, 'OK')
  })

  describe('when res.message not present', () => {
    it('should look up in statuses', () => {
      const res = response()
      res.res.statusCode = 200
      assert.strictEqual(res.message, 'OK')
    })
  })
})

describe('res.message=', () => {
  it('should set response status message', () => {
    const res = response()
    res.status = 200
    res.message = 'ok'
    assert.strictEqual(res.res.statusMessage, 'ok')
    assert.strictEqual(res.inspect().message, 'ok')
  })
})
