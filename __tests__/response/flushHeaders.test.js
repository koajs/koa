'use strict'

const { describe, it } = require('node:test')
const request = require('supertest')
const assert = require('node:assert/strict')
const Koa = require('../..')
const http = require('http')
const { once } = require('node:events')

describe('ctx.flushHeaders()', () => {
  it('should set headersSent', () => {
    const app = new Koa()

    app.use((ctx, next) => {
      ctx.body = 'Body'
      ctx.status = 200
      ctx.flushHeaders()
      assert.strictEqual(ctx.res.headersSent, true)
    })

    return request(app.callback())
      .get('/')
      .expect(200)
      .expect('Body')
  })

  it('should allow a response afterwards', () => {
    const app = new Koa()

    app.use((ctx, next) => {
      ctx.status = 200
      ctx.res.setHeader('Content-Type', 'text/plain')
      ctx.flushHeaders()
      ctx.body = 'Body'
    })

    return request(app.callback())
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/plain')
      .expect('Body')
  })

  it('should send the correct status code', () => {
    const app = new Koa()

    app.use((ctx, next) => {
      ctx.status = 401
      ctx.res.setHeader('Content-Type', 'text/plain')
      ctx.flushHeaders()
      ctx.body = 'Body'
    })

    return request(app.callback())
      .get('/')
      .expect(401)
      .expect('Content-Type', 'text/plain')
      .expect('Body')
  })

  it('should ignore set header after flushHeaders', async () => {
    const app = new Koa()

    app.use((ctx, next) => {
      ctx.status = 401
      ctx.res.setHeader('Content-Type', 'text/plain')
      ctx.flushHeaders()
      ctx.body = 'foo'
      ctx.set('X-Shouldnt-Work', 'Value')
      ctx.remove('Content-Type')
      ctx.vary('Content-Type')
    })

    const res = await request(app.callback())
      .get('/')
      .expect(401)
      .expect('Content-Type', 'text/plain')

    assert.strictEqual(res.headers['x-shouldnt-work'], undefined, 'header set after flushHeaders')
    assert.strictEqual(res.headers.vary, undefined, 'header set after flushHeaders')
  })

  it('should flush headers first and delay to send data', async () => {
    const PassThrough = require('stream').PassThrough
    const app = new Koa()

    app.use(async ctx => {
      ctx.type = 'json'
      ctx.status = 200
      ctx.headers.Link = '</css/mycss.css>; as=style; rel=preload, <https://img.craftflair.com>; rel=preconnect; crossorigin'
      const stream = ctx.body = new PassThrough()
      ctx.flushHeaders()
      await stream.end(JSON.stringify({ message: 'hello!' }))
    })

    const server = app.listen()
    const port = server.address().port

    try {
      const req = http.request({ port })
      req.end()
      const [res] = await once(req, 'response')
      const onData = () => {
        process.nextTick(() => res.emit('error', new Error('boom')))
      }
      res.on('data', onData)
      res.removeListener('data', onData)
      res.destroy()
    } finally {
      await server.close()
    }
  })

  it('should catch stream error', async () => {
    const PassThrough = require('stream').PassThrough
    const app = new Koa()
    app.once('error', err => {
      assert(err.message === 'mock error')
    })

    app.use(ctx => {
      ctx.type = 'json'
      ctx.status = 200
      ctx.headers.Link = '</css/mycss.css>; as=style; rel=preload, <https://img.craftflair.com>; rel=preconnect; crossorigin'
      ctx.length = 20
      ctx.flushHeaders()
      const stream = ctx.body = new PassThrough()

      setTimeout(() => {
        stream.emit('error', new Error('mock error'))
        stream.end()
      })
    })

    await request(app.callback()).get('/')
      .then(() => {
        throw new Error('should not successfully end')
      })
      .catch(err => {
        assert(err.message === 'aborted')
      })
  })
})
