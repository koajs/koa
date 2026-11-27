'use strict'

const assert = require('node:assert/strict')
const { errors } = require('../constants')

module.exports = function application (app, { depth }) {
  assert.ok(Number.isSafeInteger(depth) && depth >= 0, errors.middlewareDepth)
  const body = Buffer.from('Hello World')
  Array.from({ length: depth }).forEach(() => app.use(async (ctx, next) => {
    await next()
  }))
  app.use(ctx => { ctx.body = body })
  const expected = body.toString()
  const request = { route: '/', body: expected }
  return request
}
