
'use strict'

const request = require('supertest')
const assert = require('assert')
const Koa = require('../..')

describe('app.currentContext', () => {
  it('should throw error if AsyncLocalStorage not support', () => {
    if (require('async_hooks').AsyncLocalStorage) return
    assert.throws(() => new Koa({ asyncLocalStorage: true }),
      /Requires node 12\.17\.0 or higher to enable asyncLocalStorage/)
  })

  it('should get currentContext return context when asyncLocalStorage enable', async () => {
    if (!require('async_hooks').AsyncLocalStorage) return

    const app = new Koa({ asyncLocalStorage: true })

    app.use(async ctx => {
      assert(ctx === app.currentContext)
      await new Promise(resolve => {
        setTimeout(() => {
          assert(ctx === app.currentContext)
          resolve()
        }, 1)
      })
      await new Promise(resolve => {
        assert(ctx === app.currentContext)
        setImmediate(() => {
          assert(ctx === app.currentContext)
          resolve()
        })
      })
      assert(ctx === app.currentContext)
      app.currentContext.body = 'ok'
    })

    const requestServer = async () => {
      assert(app.currentContext === undefined)
      await request(app.callback()).get('/').expect('ok')
      assert(app.currentContext === undefined)
    }

    await Promise.all([
      requestServer(),
      requestServer(),
      requestServer(),
      requestServer(),
      requestServer()
    ])
  })

  it('should get currentContext return undefined when asyncLocalStorage disable', async () => {
    const app = new Koa()

    app.use(async ctx => {
      assert(app.currentContext === undefined)
      ctx.body = 'ok'
    })

    await request(app.callback()).get('/').expect('ok')
  })

  it('should get currentContext return context in error handler when asyncLocalStorage enable', async () => {
    const app = new Koa({ asyncLocalStorage: true })

    app.use(async () => {
      throw new Error('error message')
    })

    const handleError = new Promise((resolve, reject) => {
      app.on('error', (err, ctx) => {
        try {
          assert.strictEqual(err.message, 'error message')
          assert.strictEqual(app.currentContext, ctx)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })

    await request(app.callback()).get('/').expect('Internal Server Error')
    await handleError
  })

  it('should get currentContext return undefined in error handler when asyncLocalStorage disable', async () => {
    const app = new Koa()

    app.use(async () => {
      throw new Error('error message')
    })

    const handleError = new Promise((resolve, reject) => {
      app.on('error', (err, ctx) => {
        try {
          assert.strictEqual(err.message, 'error message')
          assert.strictEqual(app.currentContext, undefined)
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    })

    await request(app.callback()).get('/').expect('Internal Server Error')
    await handleError
  })
})
