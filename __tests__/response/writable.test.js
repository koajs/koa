'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const Koa = require('../../')
const net = require('net')
const { once } = require('events')

describe('res.writable', () => {
  describe('when continuous requests in one persistent connection', () => {
    it('should always be writable and respond to all requests', async () => {
      const app = new Koa()
      let count = 0
      app.use(ctx => {
        count++
        ctx.body = 'request ' + count + ', writable: ' + ctx.writable
      })

      const server = app.listen()
      const port = server.address().port
      const buf = Buffer.from('GET / HTTP/1.1\r\nHost: localhost:' + port + '\r\nConnection: keep-alive\r\n\r\n')

      const client = net.connect(port)
      const datas = []

      client.on('data', data => datas.push(data))

      await once(client, 'connect')
      client.write(buf)
      client.write(buf)
      client.end()

      await once(client, 'end')
      client.destroy()

      const responses = Buffer.concat(datas).toString()
      assert.strictEqual(/request 1, writable: true/.test(responses), true)
      assert.strictEqual(/request 2, writable: true/.test(responses), true)
      assert.strictEqual(count, 2) // Add assertion for request count

      server.close()
      await once(server, 'close')
    })
  })

  describe('when socket closed before response sent', () => {
    it('should not be writable', async () => {
      const app = new Koa()
      let ctx
      let assertionRan = false
      app.on('error', () => {})

      app.use(c => {
        ctx = c
        assertionRan = true
      })

      const server = app.listen()
      const port = server.address().port
      const buf = Buffer.from('GET / HTTP/1.1\r\nHost: localhost:' + port + '\r\nConnection: keep-alive\r\n\r\n')
      const client = net.connect(port)
      await once(client, 'connect')
      client.write(buf)

      await new Promise(resolve => setTimeout(resolve, 5))
      client.destroy()

      server.close()
      await once(server, 'close')

      assert(ctx)
      assert(assertionRan)
      assert(!ctx.writable)
    })
  })

  describe('when response finished', () => {
    it('should not be writable', async () => {
      const app = new Koa()
      let assertionRan = false

      app.use(ctx => {
        ctx.res.end()
        assert(!ctx.writable)
        assertionRan = true
      })

      const server = app.listen()
      const port = server.address().port
      const buf = Buffer.from('GET / HTTP/1.1\r\nHost: localhost:' + port + '\r\nConnection: keep-alive\r\n\r\n')

      const client = net.connect(port)
      await once(client, 'connect')
      client.write(buf)

      await new Promise(resolve => setTimeout(resolve, 5))

      client.destroy()

      server.close()
      await once(server, 'close')

      assert(assertionRan)
    })
  })
})
