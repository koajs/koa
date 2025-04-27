'use strict'

const { describe, it } = require('node:test')
const request = require('supertest')
const Koa = require('../..')

describe('flushHeaders', () => {
  it('should flush headers first and delay to send data', async () => {
    const app = new Koa()

    app.use(async (ctx) => {
      ctx.type = 'text/plain'
      ctx.status = 200
      await ctx.flushHeaders()
      ctx.body = 'Hello'
    })

    await request(app.callback())
      .get('/')
      .expect('Content-Type', /text\/plain/)
      .expect(200)
      .expect('Hello')
  })
})
