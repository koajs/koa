
'use strict'

/**
 * Separate file primarily because we use `require('babel/register')`.
 */

const request = require('supertest')
const koa = require('../..')

describe('.experimental=true', function () {
  it('should support async functions', function (done) {
    const app = koa()
    app.experimental = true
    app.use(async function (next) {
      const string = await Promise.resolve('asdf')
      this.body = string
    })

    request(app.callback())
    .get('/')
    .expect('asdf')
    .expect(200, done)
  })
})
