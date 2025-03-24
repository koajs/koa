'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const Koa = require('../..')

describe('app.toJSON()', () => {
  it('should work', () => {
    const app = new Koa({ env: 'test' })
    const obj = app.toJSON()

    assert.deepStrictEqual({
      subdomainOffset: 2,
      proxy: false,
      env: 'test'
    }, obj)
  })
})
