'use strict'

import { describe, it } from 'node:test'
import assert from 'assert'
import util from 'util'
import Koa from '../../dist/application.js'

process.env.NODE_ENV = 'test'
const app = new Koa()

describe('app.inspect()', () => {
  it('should work', () => {
    const str = util.inspect(app)
    assert.strictEqual("{ subdomainOffset: 2, proxy: false, env: 'test' }", str)
  })

  it('should return a json representation', () => {
    assert.deepStrictEqual(
      { subdomainOffset: 2, proxy: false, env: 'test' },
      app.inspect()
    )
  })
})
