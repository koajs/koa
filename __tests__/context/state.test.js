'use strict'

const { describe, it } = require('node:test')
const request = require('supertest')
const assert = require('assert')
const Koa = require('../..')

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
