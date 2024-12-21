'use strict'

import { describe, it } from 'node:test'
import request from 'supertest'
import assert from 'assert'
import Koa from '../../dist/application.js'

describe('ctx.state', () => {
  it('should provide a ctx.state namespace', () => {
    const app = new Koa()

    app.use(ctx => {
      assert.deepStrictEqual(ctx.state, {})
    })

    return request(app.callback())
      .get('/')
      .expect(404)
  })
})
