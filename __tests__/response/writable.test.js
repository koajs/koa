'use strict'

const { describe, it } = require('node:test')
const assert = require('assert')
const Koa = require('../../')
const net = require('net')

describe('res.writable', () => {
  describe('when continuous requests in one persistent connection', () => {
    it('should always be writable and respond to all requests', (t, done) => {
      const app = new Koa()
      let count = 0
      app.use(ctx => {
        count++
        ctx.body = 'request ' + count + ', writable: ' + ctx.writable
      })

      const server = app.listen()

      requestTwice(server, (_, datas) => {
        const responses = Buffer.concat(datas).toString()
        assert.strictEqual(/request 1, writable: true/.test(responses), true)
        assert.strictEqual(/request 2, writable: true/.test(responses), true)
        done()
        server.close()
      })

      function requestTwice (server, done) {
        const port = server.address().port
        const buf = Buffer.from('GET / HTTP/1.1\r\nHost: localhost:' + port + '\r\nConnection: keep-alive\r\n\r\n')
        const client = net.connect(port)
        const datas = []
        client
          .on('error', done)
          .on('data', data => datas.push(data))
          .on('end', () => done(null, datas))
        setImmediate(() => {
          client.write(buf)
          client.write(buf)
          setImmediate(() => client.end())
        })
      }
    })
  })

  describe('when socket closed before response sent', () => {
    it('should not be writable', (t, done) => {
      const app = new Koa()
      let callback
      const promise = new Promise(resolve => { callback = resolve })
      app.use(ctx => {
        promise.then(() => {
          if (ctx.writable) return done(new Error('ctx.writable should not be true'))
          done()
          server.close()
        })
      })

      const server = app.listen()

      requestClosed(server)

      function requestClosed (server) {
        const port = server.address().port
        const buf = Buffer.from('GET / HTTP/1.1\r\nHost: localhost:' + port + '\r\nConnection: keep-alive\r\n\r\n')
        const client = net.connect(port, () => {
          client.write(buf)
          client.end(() => setTimeout(callback))
        })
      }
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

    it('should not be writable', (t, done) => {
      const app = new Koa()
      app.use(ctx => {
        ctx.res.end()
        if (ctx.writable) return done(new Error('ctx.writable should not be true'))
        done()
      })
      request(app.listen())
    })
  })
})
