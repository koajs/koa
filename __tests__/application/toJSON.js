
'use strict'

const assert = require('assert')
const Koa = require('../..')

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
