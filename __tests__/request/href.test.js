'use strict'

import { describe, it } from 'node:test'
import assert from 'assert'
import Stream from 'stream'
import http from 'http'
import Koa from '../../dist/application.js'
import context from '../../test-helpers/context.js'

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

  it('should work with `GET http://example.com/foo`', (t, done) => {
    const app = new Koa()
    app.use(ctx => {
      ctx.body = ctx.href
    })
    app.listen(function () {
      const server = this
      const address = this.address()
      http.get({
        host: 'localhost',
        path: 'http://example.com/foo',
        port: address.port
      }, res => {
        assert.strictEqual(res.statusCode, 200)
        let buf = ''
        res.setEncoding('utf8')
        res.on('data', s => { buf += s })
        res.on('end', () => {
          assert.strictEqual(buf, 'http://example.com/foo')
          done()
          server.close()
        })
      })
    })
  })
})
