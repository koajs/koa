'use strict'

import { describe, it } from 'node:test'
import prototype from '../../dist/context.js'
import assert from 'assert'
import util from 'util'
import context from '../../test-helpers/context.js'

describe('ctx.inspect()', () => {
  it('should return a json representation', () => {
    const ctx = context()
    const toJSON = ctx.toJSON(ctx)

    assert.deepStrictEqual(toJSON, ctx.inspect())
    assert.deepStrictEqual(util.inspect(toJSON), util.inspect(ctx))
  })

  // console.log(require.cache) will call prototype.inspect()
  it('should not crash when called on the prototype', () => {
    assert.deepStrictEqual(prototype, prototype.inspect())
    assert.deepStrictEqual(util.inspect(prototype.inspect()), util.inspect(prototype))
  })
})
