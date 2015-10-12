'use strict'

const request = require('supertest')
const assert = require('assert')
const koa = require('../..')

describe('app.context', function () {
  const app1 = koa()
  app1.context.msg = 'hello'
  const app2 = koa()

  it('should merge properties', function (done) {
    app1.use(function *(next) {
      assert.equal(this.msg, 'hello')
      this.status = 204
    })

    request(app1.listen())
      .get('/')
      .expect(204, done)
  })

  it('should not affect the original prototype', function (done) {
    app2.use(function *(next) {
      assert.equal(this.msg, undefined)
      this.status = 204
    })

    request(app2.listen())
      .get('/')
      .expect(204, done)
  })
})
