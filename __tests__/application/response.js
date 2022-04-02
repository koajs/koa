
'use strict'

const request = require('supertest')
const assert = require('assert')
const Koa = require('../..')

describe('app.response', () => {
  const app1 = new Koa()
  app1.response.msg = 'hello'
  const app2 = new Koa()
  const app3 = new Koa()
  const app4 = new Koa()
  const app5 = new Koa()
  const app6 = new Koa()
  const app7 = new Koa()

  it('should merge properties', () => {
    app1.use((ctx, next) => {
      assert.strictEqual(ctx.response.msg, 'hello')
      ctx.status = 204
    })

    return request(app1.listen())
      .get('/')
      .expect(204)
  })

  it('should not affect the original prototype', () => {
    app2.use((ctx, next) => {
      assert.strictEqual(ctx.response.msg, undefined)
      ctx.status = 204
    })

    return request(app2.listen())
      .get('/')
      .expect(204)
  })

  it('should not include status message in body for http2', async () => {
    app3.use((ctx, next) => {
      ctx.req.httpVersionMajor = 2
      ctx.status = 404
    })
    const response = await request(app3.listen())
      .get('/')
      .expect(404)
    assert.strictEqual(response.text, '404')
  })

  it('should set ._explicitNullBody correctly', async () => {
    app4.use((ctx, next) => {
      ctx.body = null
      assert.strictEqual(ctx.response._explicitNullBody, true)
    })

    return request(app4.listen())
      .get('/')
      .expect(204)
  })

  it('should not set ._explicitNullBody incorrectly', async () => {
    app5.use((ctx, next) => {
      ctx.body = undefined
      assert.strictEqual(ctx.response._explicitNullBody, undefined)
      ctx.body = ''
      assert.strictEqual(ctx.response._explicitNullBody, undefined)
      ctx.body = false
      assert.strictEqual(ctx.response._explicitNullBody, undefined)
    })

    return request(app5.listen())
      .get('/')
      .expect(204)
  })

  it('should add Content-Length when Transfer-Encoding is not defined', () => {
    app6.use((ctx, next) => {
      ctx.body = 'hello world'
    })

    return request(app6.listen())
      .get('/')
      .expect('Content-Length', '11')
      .expect(200)
  })

  it('should not add Content-Length when Transfer-Encoding is defined', () => {
    app7.use((ctx, next) => {
      ctx.set('Transfer-Encoding', 'chunked')
      ctx.body = 'hello world'
      assert.strictEqual(ctx.response.get('Content-Length'), undefined)
    })

    return request(app7.listen())
      .get('/')
      .expect('Transfer-Encoding', 'chunked')
      .expect(200)
  })
})
