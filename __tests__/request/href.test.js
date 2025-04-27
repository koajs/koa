'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const Stream = require('stream')
const request = require('supertest')
const Koa = require('../../')
const context = require('../../test-helpers/context')

describe('ctx.href', () => {
  it('should return the full request url', () => {
    const socket = new Stream.Duplex()
    const req = {
      url: '/users/1?next=/dashboard',
      headers: {
        host: 'localhost'
      },
      socket,
      __proto__: Stream.Readable.prototype
    }
    const ctx = context(req)
    assert.strictEqual(ctx.href, 'http://localhost/users/1?next=/dashboard')
    // change it also work
    ctx.url = '/foo/users/1?next=/dashboard'
    assert.strictEqual(ctx.href, 'http://localhost/users/1?next=/dashboard')
  })

  it('should work with `GET http://example.com/foo`', async () => {
    const app = new Koa()
    app.use(ctx => {
      ctx.body = ctx.href
    })

    const res = await request(app.callback())
      .get('/foo')
      .set('Host', 'example.com')
      .expect(200)

    assert.strictEqual(res.text, 'http://example.com/foo')
  })
})
