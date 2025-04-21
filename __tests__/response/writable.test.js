'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const Koa = require('../../')
const net = require('net')

describe('res.writable', () => {
  describe('when continuous requests in one persistent connection', () => {
    it('should always be writable and respond to all requests', () => {
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
      client
        .on('error', err => {
          // Handle error and close server
          server.close()
          throw err
        })
        .on('data', data => datas.push(data))
        .on('end', () => {
          try {
            const responses = Buffer.concat(datas).toString()
            assert.strictEqual(/request 1, writable: true/.test(responses), true)
            assert.strictEqual(/request 2, writable: true/.test(responses), true)
            server.close()
          } catch (err) {
            server.close()
            throw err
          }
        })

      client.write(buf)
      client.write(buf)
      client.end()
    })
  })

  describe('when socket closed before response sent', () => {
    it('should not be writable', async () => {
      const app = new Koa()
      let callback
      const promise = new Promise(resolve => { callback = resolve })

      app.use(async ctx => {
        await promise
        await new Promise(resolve => setTimeout(resolve, 10))
        assert.strictEqual(ctx.writable, false, 'ctx.writable should not be true')
      })

      const server = app.listen()
      const port = server.address().port
      const buf = Buffer.from('GET / HTTP/1.1\r\nHost: localhost:' + port + '\r\nConnection: keep-alive\r\n\r\n')

      const client = net.connect(port)
      client.on('error', () => {}) // Handle ECONNRESET error

      client.write(buf)
      client.end(() => server.close(callback))
    })
  })

  describe('when response finished', () => {
    function request (server) {
      const port = server.address().port
      const buf = Buffer.from('GET / HTTP/1.1\r\nHost: localhost:' + port + '\r\nConnection: keep-alive\r\n\r\n')
      const client = net.connect(port)
      setImmediate(() => {
        client.write(buf)
      })
      setTimeout(() => {
        client.end()
        server.close()
      }, 100)
    }

    it('should not be writable', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.res.end()
        assert.strictEqual(ctx.writable, false, 'ctx.writable should not be true')
      })
      await request(app.listen())
    })
  })
})
