'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { setImmediate } = require('node:timers/promises')
const request = require('supertest')
const Koa = require('../..')

describe('app.handleRequest', () => {
  for (const value of [null, undefined]) {
    for (const mode of ['throw', 'reject']) {
      it(`responds with 500 when middleware ${mode}s ${value}`, async () => {
        const app = new Koa()
        const errors = []
        app.on('error', err => errors.push(err))
        app.use(() => {
          if (mode === 'throw') throw value
          return Promise.reject(value)
        })

        await request(app.callback())
          .get('/')
          .timeout({ deadline: 1000 })
          .expect(500, 'Internal Server Error')

        assert.strictEqual(errors.length, 1)
        assert(errors[0] instanceof Error)
        assert.strictEqual(errors[0].message, `non-error thrown: ${value}`)
      })
    }

    it(`reports a rejection with ${value} after headers have been sent`, async () => {
      const app = new Koa()
      const errors = []
      app.on('error', (err, ctx) => {
        errors.push(err)
        ctx.res.end()
      })
      app.use(async ctx => {
        ctx.status = 200
        ctx.set('X-Sent', 'yes')
        ctx.flushHeaders()
        await Promise.reject(value)
      })

      await request(app.callback())
        .get('/')
        .timeout({ deadline: 1000 })
        .expect('X-Sent', 'yes')
        .expect(200)

      assert.strictEqual(errors.length, 1)
      assert(errors[0] instanceof Error)
      assert.strictEqual(errors[0].message, `non-error thrown: ${value}`)
      assert.strictEqual(errors[0].headerSent, true)
    })
  }

  it('completes a successful response without emitting an error', async () => {
    const app = new Koa()
    const errors = []
    app.on('error', err => errors.push(err))
    app.use(ctx => { ctx.body = 'ok' })

    await request(app.callback()).get('/').expect(200, 'ok')
    await setImmediate()
    assert.deepStrictEqual(errors, [])
  })

  it('keeps nullish context error callbacks as no-ops', async () => {
    const app = new Koa()
    const errors = []
    app.on('error', err => errors.push(err))
    app.use(ctx => {
      ctx.onerror(null)
      ctx.onerror(undefined)
      ctx.body = 'ok'
    })

    await request(app.callback()).get('/').expect(200, 'ok')
    await setImmediate()
    assert.deepStrictEqual(errors, [])
  })
})
