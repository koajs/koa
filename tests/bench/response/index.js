'use strict'

const { json } = require('node:stream/consumers')
const { Readable } = require('node:stream')

function redirect (app, back) {
  app.use(ctx => {
    ctx.vary('Accept')
    if (back) ctx.back('/')
    else ctx.redirect('/next')
  })
  const referer = 'http://koa.test/previous'
  const init = { headers: { accept: 'text/plain', host: 'koa.test', referer } }
  const location = back ? referer : '/next'
  const headers = { location, vary: 'Accept' }
  return { route: '/', init, headers, status: 302, body: 'Redirecting to ' + location + '.' }
}

function stream (app) {
  const modified = new Date('2025-01-02T00:00:00Z')
  const link = '</archive>; rel="collection"'
  const chunks = [Buffer.from('first\n'), Buffer.from('second\n')]
  app.use(ctx => {
    ctx.lastModified = modified
    if (ctx.lastModified <= new Date(ctx.get('If-Modified-Since'))) {
      ctx.status = 304
      return
    }
    ctx.type = 'text/plain'
    ctx.body = Readable.from(chunks)
    if (ctx.response.is('text/*')) ctx.append('Link', link)
  })
  const init = { headers: { 'if-modified-since': 'Wed, 01 Jan 2025 00:00:00 GMT' } }
  const headers = { 'last-modified': modified.toUTCString(), link }
  return { route: '/archive/today', body: 'first\nsecond\n', headers, init }
}

function attachment (app) {
  app.use(ctx => {
    ctx.attachment('report.txt')
    ctx.etag = 'report'
    ctx.body = 'report'
  })
  const headers = { 'content-disposition': 'attachment; filename="report.txt"', etag: '"report"' }
  return { route: '/', headers, body: 'report' }
}

module.exports = function response (app, { payload, headItems, scenario }) {
  if (scenario === 'redirect' || scenario === 'back') return redirect(app, scenario === 'back')
  if (scenario === 'stream') return stream(app)
  if (scenario === 'attachment') return attachment(app)
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
  app.use(async ctx => {
    ctx.assert(ctx.is('json') && ctx.request.type === 'application/json', 415)
    ctx.body = await json(ctx.req)
  })
  const headers = { 'content-type': 'application/json' }
  const init = { method: 'POST', body, headers }
  const request = { route: '/', body, init }
  return request
}
