
'use strict'

const assert = require('assert')
const util = require('util')
const Koa = require('../..')
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
