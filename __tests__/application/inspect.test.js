'use strict'

const { describe, it } = require('node:test')
const assert = require('assert')
const util = require('util')
const Koa = require('../..')

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
