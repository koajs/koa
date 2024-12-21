'use strict'

import { describe, it } from 'node:test'
import request from 'supertest'
import assert from 'assert'
import Koa from '../../dist/application.js'

describe('app.compose', () => {
  it('should work with default compose ', async () => {
    const app = new Koa()
    const calls = []

    app.use((ctx, next) => {
      calls.push(1)
      return next().then(() => {
        calls.push(4)
      })
    })

    app.use((ctx, next) => {
      calls.push(2)
      return next().then(() => {
        calls.push(3)
      })
    })

    await request(app.callback())
      .get('/')
      .expect(404)

    assert.deepStrictEqual(calls, [1, 2, 3, 4])
  })

  it('should work with configurable compose', async () => {
    const calls = []
    let count = 0
    const app = new Koa({
      compose (fns) {
        return async (ctx) => {
          const dispatch = async () => {
            count++
            const fn = fns.shift()
            fn && fn(ctx, dispatch)
          }
          dispatch()
        }
      }
    })

    app.use((ctx, next) => {
      calls.push(1)
      next()
      calls.push(4)
    })
    app.use((ctx, next) => {
      calls.push(2)
      next()
      calls.push(3)
    })

    await request(app.callback())
      .get('/')

    assert.deepStrictEqual(calls, [1, 2, 3, 4])
    assert.equal(count, 3)
  })
})
