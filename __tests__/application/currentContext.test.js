'use strict'

const { describe, it } = require('node:test')
const request = require('supertest')
const assert = require('node:assert/strict')
const Koa = require('../..')
const { AsyncLocalStorage } = require('async_hooks')

describe('app.currentContext', () => {
  it('should get currentContext return context when asyncLocalStorage enable', async () => {
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

  it('should support a custom asyncLocalStorage', async () => {
    const asyncLocalStorage = new AsyncLocalStorage()
    const app = new Koa({ asyncLocalStorage })
    assert(app.currentContext === undefined)
    app.use(async ctx => {
      assert(ctx === app.currentContext)
      assert(asyncLocalStorage.getStore() === ctx)
      ctx.body = 'ok'
    })
    await request(app.callback()).get('/').expect('ok')
    assert(app.currentContext === undefined)
  })
})
