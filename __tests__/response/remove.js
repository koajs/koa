
'use strict'

const assert = require('assert')
const context = require('../../test-helpers/context')

describe('ctx.remove(name)', () => {
  it('should remove a field', () => {
    const ctx = context()
    ctx.set('x-foo', 'bar')
    ctx.remove('x-foo')
    assert.deepStrictEqual(ctx.response.header, {})
  })
})
