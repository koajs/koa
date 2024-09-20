'use strict'

const { describe, it } = require('node:test')
const assert = require('assert')
const Koa = require('../..')

process.env.NODE_ENV = 'test'

describe('app.toJSON()', () => {
  it('should work', () => {
    const app = new Koa()
    const obj = app.toJSON()

    assert.deepStrictEqual({
      subdomainOffset: 2,
      proxy: false,
      env: 'test'
    }, obj)
  })
})
