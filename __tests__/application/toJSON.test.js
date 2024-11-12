'use strict'

import { describe, it } from 'node:test'
import assert from 'assert'
import Koa from '../../dist/application.js'

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
