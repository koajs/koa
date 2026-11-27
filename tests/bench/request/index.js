'use strict'

const { queryInput } = require('../search-params')

function proxyRequest (app) {
  app.proxy = true
  app.use(ctx => {
    ctx.status = 200
    ctx.etag = 'current'
    ctx.body = [ctx.host, ctx.ip, ctx.protocol, ctx.accepts('json'), ctx.fresh, ctx.cookies.get('sid')].join('|')
  })
  const headers = {
    'x-forwarded-host': 'koa.test',
    'x-forwarded-for': '192.0.2.1',
    'x-forwarded-proto': 'https',
    accept: 'application/json',
    'if-none-match': '"current"',
    cookie: 'sid=abc'
  }
  return { route: '/', init: { headers }, body: 'koa.test|192.0.2.1|https|json|true|abc' }
}

function localizedRoute (app) {
  app.use(ctx => {
    const [tenant] = ctx.subdomains
    const language = ctx.acceptsLanguages('en', 'fr')
    ctx.path = '/' + tenant + ctx.path
    ctx.query = { ...ctx.query, language }
    ctx.body = ctx.url
  })
  const headers = { host: 'books.example.test', 'accept-language': 'fr' }
  return { route: '/catalog?page=2', init: { headers }, body: '/books/catalog?page=2&language=fr' }
}

module.exports = function request (app, { size, kind, scenario }) {
  if (scenario === 'localized route') return localizedRoute(app)
  if (scenario === 'proxy and negotiation') return proxyRequest(app)
  const { query, expected } = queryInput(size, kind)
  app.use(ctx => { ctx.body = ctx.query })
  const route = '/?' + query
  const body = JSON.stringify(expected)
  const request = { route, body }
  return request
}
