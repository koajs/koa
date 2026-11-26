'use strict'

const { queryInput } = require('../search-params')

module.exports = function request (app, { size, kind }) {
  const { query, expected } = queryInput(size, kind)
  app.use(ctx => { ctx.body = ctx.query })
  const route = '/?' + query
  const body = JSON.stringify(expected)
  const request = { route, body }
  return request
}
