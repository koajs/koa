
'use strict'

const request = require('supertest')
const assert = require('assert')
const Koa = require('../..')

describe('app.use(fn)', () => {
  it('should compose middleware', async () => {
    const app = new Koa()
    const calls = []

    app.use((ctx, next) => {
      calls.push(1)
      return next().then(() => {
        calls.push(6)
      })
    })

    app.use((ctx, next) => {
      calls.push(2)
      return next().then(() => {
        calls.push(5)
      })
    })

    app.use((ctx, next) => {
      calls.push(3)
      return next().then(() => {
        calls.push(4)
      })
    })

    const server = app.listen()

    await request(server)
      .get('/')
      .expect(404)

    assert.deepStrictEqual(calls, [1, 2, 3, 4, 5, 6])
  })

  it('should compose mixed middleware', async () => {
    const app = new Koa()
    const calls = []

    app.use((ctx, next) => {
      calls.push(1)
      return next().then(() => {
        calls.push(6)
      })
    })

    app.use(async (ctx, next) => {
      calls.push(2)
      await next()
      calls.push(5)
    })

    app.use((ctx, next) => {
      calls.push(3)
      return next().then(() => {
        calls.push(4)
      })
    })

    const server = app.listen()

    await request(server)
      .get('/')
      .expect(404)

    assert.deepStrictEqual(calls, [1, 2, 3, 4, 5, 6])
  })

  // https://github.com/koajs/koa/pull/530#issuecomment-148138051
  it('should catch thrown errors in non-async functions', () => {
    const app = new Koa()

    app.use(ctx => ctx.throw('Not Found', 404))

    return request(app.callback())
      .get('/')
      .expect(404)
  })

  it('should throw error for non-function', () => {
    const app = new Koa();

    [null, undefined, 0, false, 'not a function'].forEach(v => {
      assert.throws(() => app.use(v), /middleware must be a function!/)
    })
  })
})
