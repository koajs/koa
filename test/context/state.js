'use strict'

const request = require('supertest')
const assert = require('assert')
const koa = require('../..')

describe('ctx.state', function () {
  it('should provide a ctx.state namespace', function (done) {
    const app = koa()

    app.use(function *() {
      assert.deepEqual(this.state, {})
    })

    const server = app.listen()

    request(server)
      .get('/')
      .expect(404)
      .end(done)
  })
})
