
'use strict'

const request = require('supertest')
const assert = require('assert')
const Koa = require('../..')

describe('app', () => {
  // ignore test on Node.js v18
  (/^v18\./.test(process.version) ? it.skip : it)('should handle socket errors', done => {
    const app = new Koa()

    app.use((ctx, next) => {
      // triggers ctx.socket.writable == false
      ctx.socket.emit('error', new Error('boom'))
    })

    app.on('error', err => {
      assert.strictEqual(err.message, 'boom')
      done()
    })

    request(app.callback())
      .get('/')
      .end(() => {})
  })

  it('should not .writeHead when !socket.writable', done => {
    const app = new Koa()

    app.use((ctx, next) => {
      // set .writable to false
      ctx.socket.writable = false
      ctx.status = 204
      // throw if .writeHead or .end is called
      ctx.res.writeHead =
      ctx.res.end = () => {
        throw new Error('response sent')
      }
    })

    // hackish, but the response should occur in a single tick
    setImmediate(done)

    request(app.callback())
      .get('/')
      .end(() => {})
  })

  it('should set development env when NODE_ENV missing', () => {
    const NODE_ENV = process.env.NODE_ENV
    process.env.NODE_ENV = ''
    const app = new Koa()
    process.env.NODE_ENV = NODE_ENV
    assert.strictEqual(app.env, 'development')
  })

  it('should set env from the constructor', () => {
    const env = 'custom'
    const app = new Koa({ env })
    assert.strictEqual(app.env, env)
  })

  it('should set proxy flag from the constructor', () => {
    const proxy = true
    const app = new Koa({ proxy })
    assert.strictEqual(app.proxy, proxy)
  })

  it('should set signed cookie keys from the constructor', () => {
    const keys = ['customkey']
    const app = new Koa({ keys })
    assert.strictEqual(app.keys, keys)
  })

  it('should set subdomainOffset from the constructor', () => {
    const subdomainOffset = 3
    const app = new Koa({ subdomainOffset })
    assert.strictEqual(app.subdomainOffset, subdomainOffset)
  })

  it('should set compose from the constructor', () => {
    const compose = () => (ctx) => {}
    const app = new Koa({ compose })
    assert.strictEqual(app.compose, compose)
  })

  it('should have a static property exporting `HttpError` from http-errors library', () => {
    const CreateError = require('http-errors')

    assert.notEqual(Koa.HttpError, undefined)
    assert.deepStrictEqual(Koa.HttpError, CreateError.HttpError)
    assert.throws(() => { throw new CreateError(500, 'test error') }, Koa.HttpError)
  })

  it('should export createAsyncCtxStorageMiddleware function', () => {
    const app = new Koa()
    assert.strictEqual(typeof app.createAsyncCtxStorageMiddleware, 'function')
  })
})
