'use strict'

const { json } = require('node:stream/consumers')

module.exports = function response (app, { payload, headItems }) {
  if (headItems !== undefined) {
    const records = Array.from({ length: headItems }, (_, id) => {
      const name = 'Item ' + id
      const record = { id, name }
      return record
    })
    const length = Buffer.byteLength(JSON.stringify(records))
    app.use(ctx => {
      ctx.body = records
      ctx.length = length
    })
    const init = { method: 'HEAD' }
    const request = { route: '/', body: '', init, length }
    return request
  }
  const body = JSON.stringify(payload)
  app.use(async ctx => { ctx.body = await json(ctx.req) })
  const headers = { 'content-type': 'application/json' }
  const init = { method: 'POST', body, headers }
  const request = { route: '/', body, init }
  return request
}
