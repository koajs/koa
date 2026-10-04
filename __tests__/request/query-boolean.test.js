'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { Socket } = require('node:net')
const querystring = require('node:querystring')
const request = require('supertest')
const Koa = require('../..')
const sp = require('../../lib/search-params')
const context = require('../../test-helpers/context')

describe('boolean values in query assignment', () => {
  it('serializes both scalar boolean values as strings', () => {
    const input = { enabled: true, disabled: false }
    const encoded = sp.stringify(input)
    assert.strictEqual(encoded, 'enabled=true&disabled=false')
    assert.strictEqual(encoded, querystring.stringify(input))
    assert.deepStrictEqual(sp.parse(encoded), {
      enabled: 'true',
      disabled: 'false'
    })
  })

  it('preserves order and repetitions in boolean arrays', () => {
    const input = { flags: [true, false, true, false] }
    const encoded = sp.stringify(input)
    assert.strictEqual(encoded, 'flags=true&flags=false&flags=true&flags=false')
    assert.strictEqual(encoded, querystring.stringify(input))
    assert.deepStrictEqual(sp.parse(encoded), {
      flags: ['true', 'false', 'true', 'false']
    })
  })

  it('retains boolean values in mixed primitive arrays', () => {
    const input = { values: [false, 0, '', true, 'false', 1] }
    const encoded = sp.stringify(input)
    assert.strictEqual(encoded, 'values=false&values=0&values=&values=true&values=false&values=1')
    assert.strictEqual(encoded, querystring.stringify(input))
    assert.deepStrictEqual(sp.parse(encoded), {
      values: ['false', '0', '', 'true', 'false', '1']
    })
  })

  it('keeps empty values for unsupported types alongside booleans', () => {
    const input = {
      enabled: false,
      nested: { value: true },
      missing: undefined,
      empty: null,
      flags: [true, null, { value: false }, undefined, false]
    }
    const encoded = sp.stringify(input)
    assert.strictEqual(encoded, 'enabled=false&nested=&missing=&empty=&flags=true&flags=&flags=&flags=&flags=false')
    assert.deepStrictEqual(sp.parse(encoded), {
      enabled: 'false',
      nested: '',
      missing: '',
      empty: '',
      flags: ['true', '', '', '', 'false']
    })
  })

  it('keeps URLSearchParams encoding when a boolean key needs escaping', () => {
    const input = { 'enabled flag': true, 'a&b': [false, true] }
    const encoded = sp.stringify(input)
    assert.strictEqual(encoded, 'enabled+flag=true&a%26b=false&a%26b=true')
    assert.deepStrictEqual(sp.parse(encoded), {
      'enabled flag': 'true',
      'a&b': ['false', 'true']
    })
  })

  it('invalidates the parsed query after each boolean rewrite', () => {
    const ctx = context({ url: '/catalog?enabled=old' })
    const initial = ctx.query
    ctx.query = { enabled: false, flags: [true] }
    const first = ctx.query
    assert.notStrictEqual(first, initial)
    assert.deepStrictEqual(first, { enabled: 'false', flags: 'true' })
    assert.strictEqual(ctx.query, first)
    assert.strictEqual(ctx.search, '?enabled=false&flags=true')
    ctx.query = { enabled: true, flags: [false] }
    const second = ctx.query
    assert.notStrictEqual(second, first)
    assert.deepStrictEqual(second, { enabled: 'true', flags: 'false' })
    assert.strictEqual(ctx.query, second)
    assert.strictEqual(ctx.querystring, 'enabled=true&flags=false')
    assert.strictEqual(ctx.url, '/catalog?enabled=true&flags=false')
    assert.strictEqual(ctx.originalUrl, '/catalog?enabled=old')
    assert.deepStrictEqual(initial, { enabled: 'old' })
    assert.deepStrictEqual(first, { enabled: 'false', flags: 'true' })
  })

  for (const method of ['get', 'post']) {
    it(`exposes the rewritten boolean query to ${method.toUpperCase()} middleware over HTTP`, async () => {
      const app = new Koa()
      const input = { enabled: true, disabled: false, flags: [false, true] }
      const expectedQuery = {
        enabled: 'true',
        disabled: 'false',
        flags: ['false', 'true']
      }
      const encoded = querystring.stringify(input)
      const originalUrl = '/catalog?previous=yes'
      const observations = []
      app.use(async (ctx, next) => {
        assert(ctx.req.socket instanceof Socket)
        assert(ctx.req.socket.remotePort > 0)
        assert.deepStrictEqual(ctx.query, { previous: 'yes' })
        ctx.query = input
        observations.push(ctx.query)
        await next()
        assert.strictEqual(ctx.query, observations[0])
        assert.deepStrictEqual(ctx.query, expectedQuery)
      })
      app.use(ctx => {
        assert.deepStrictEqual(ctx.request.query, expectedQuery)
        assert.strictEqual(ctx.request.query, observations[0])
        ctx.body = {
          query: ctx.query,
          querystring: ctx.querystring,
          search: ctx.search,
          url: ctx.url,
          originalUrl: ctx.originalUrl,
          path: ctx.path,
          method: ctx.method
        }
      })
      const result = await request(app.callback())[method](originalUrl)
        .expect('Content-Type', /json/)
        .expect(200)
      assert.deepStrictEqual(result.body, {
        query: expectedQuery,
        querystring: encoded,
        search: `?${encoded}`,
        url: `/catalog?${encoded}`,
        originalUrl,
        path: '/catalog',
        method: method.toUpperCase()
      })
      assert.strictEqual(observations.length, 1)
    })
  }
})
