'use strict'

import { describe, it } from 'node:test'
import request from 'supertest'
import assert from 'assert'
import Koa from '../../dist/application.js'

describe('app.request', () => {
  const app1 = new Koa()
  app1.request.message = 'hello'
  const app2 = new Koa()

  it('should merge properties', () => {
    app1.use((ctx, next) => {
      assert.strictEqual(ctx.request.message, 'hello')
      ctx.status = 204
    })

    return request(app1.callback())
      .get('/')
      .expect(204)
  })

  it('should not affect the original prototype', () => {
    app2.use((ctx, next) => {
      assert.strictEqual(ctx.request.message, undefined)
      ctx.status = 204
    })

    return request(app2.callback())
      .get('/')
      .expect(204)
  })
})
