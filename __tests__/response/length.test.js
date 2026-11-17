'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const { Readable, Duplex } = require('node:stream')
const { IncomingMessage, ServerResponse } = require('node:http')
const { execFileSync } = require('node:child_process')
const Koa = require('../../lib/application')
const { foreignReadableStream, withForeignResponseConstructor } = require('../../test-helpers/web-bodies')
const response = require('../../test-helpers/context').response

function nativeResponse () {
  const req = new IncomingMessage(new Duplex())
  const res = new ServerResponse(req)
  return new Koa().createContext(req, res).response
}

describe('res.length', () => {
  it('does not infer a length for a stream with a foreign prototype', () => {
    const res = response()
    const body = foreignReadableStream()
    assert.strictEqual(body instanceof ReadableStream, false)
    res.body = body
    assert.strictEqual(res.type, 'application/octet-stream')
    assert.strictEqual(res.length, undefined)
  })

  it('does not infer a Response length when the current constructor is foreign', async () => {
    await withForeignResponseConstructor(NativeResponse => {
      const res = response()
      const body = new NativeResponse('hello')
      assert.strictEqual(body instanceof Response, false)
      res.body = body
      assert.strictEqual(res.type, 'text/plain')
      assert.strictEqual(res.length, undefined)
    })
  })

  it('copies Response metadata when the current constructor is foreign', async () => {
    await withForeignResponseConstructor(NativeResponse => {
      const res = response()
      const headers = { 'Content-Length': '5', 'Content-Type': 'text/plain' }
      const body = new NativeResponse('hello', { status: 201, headers })
      res.body = body
      assert.strictEqual(res.status, 201)
      assert.strictEqual(res.type, 'text/plain')
      assert.strictEqual(res.length, 5)
    })
  })

  ;['ReadableStream', 'Response'].forEach(tag => {
    it(`keeps a plain object with a ${tag} tag as JSON`, () => {
      const res = response()
      const body = { hello: 'world' }
      body[Symbol.toStringTag] = tag
      res.body = body
      assert.strictEqual(res.type, 'application/json')
      assert.strictEqual(res.length, 17)
    })
  })

  it('keeps an object imitating the ReadableStream API as JSON', () => {
    const res = response()
    const body = {
      hello: 'world',
      locked: false,
      getReader () {},
      [Symbol.asyncIterator] () {}
    }
    body[Symbol.toStringTag] = 'ReadableStream'
    const length = Buffer.byteLength(JSON.stringify(body))
    res.body = body
    assert.strictEqual(res.type, 'application/json')
    assert.strictEqual(res.length, length)
  })

  it('keeps an object imitating the Response API as JSON', () => {
    const res = response()
    const headers = { get: () => null, keys: () => [] }
    const body = { hello: 'world', status: 201, headers, body: null }
    body[Symbol.toStringTag] = 'Response'
    const length = Buffer.byteLength(JSON.stringify(body))
    res.body = body
    assert.strictEqual(res.status, 200)
    assert.strictEqual(res.type, 'application/json')
    assert.strictEqual(res.length, length)
  })

  it('keeps an object with a throwing tag getter as JSON', () => {
    const res = response()
    const body = { hello: 'world' }
    Object.defineProperty(body, Symbol.toStringTag, {
      get () { throw new Error('invalid tag access') }
    })
    res.body = body
    assert.strictEqual(res.type, 'application/json')
    assert.strictEqual(res.length, 17)
  })

  it('deduces a string length when the Response global is absent', () => {
    const fixture = require.resolve('../../test-helpers/context')
    const script = `
      const assert = require('node:assert/strict')
      const res = require(${JSON.stringify(fixture)}).response()
      res.body = 'hello'
      res.remove('Content-Length')
      delete globalThis.Response
      assert.strictEqual(res.length, 5)
    `
    execFileSync(process.execPath, ['-e', script])
  })

  describe('when Content-Length is defined', () => {
    it('should return a number', () => {
      const res = response()
      res.set('Content-Length', '1024')
      assert.strictEqual(res.length, 1024)
    })

    describe('but not number', () => {
      it('should return 0', () => {
        const res = response()
        res.set('Content-Length', 'hey')
        assert.strictEqual(res.length, 0)
      })
    })
  })

  describe('when Content-Length is not defined', () => {
    const bodies = [
      ['undefined', () => undefined, undefined],
      ['null', () => null, undefined],
      ['string', () => 'foo', 3],
      ['multibyte string', () => 'é', 2],
      ['empty string', () => '', undefined],
      ['Buffer', () => Buffer.from('foo bar'), 7],
      ['empty Buffer', () => Buffer.alloc(0), 0],
      ['object', () => ({ hello: 'world' }), 17],
      ['array', () => [1, 2], 5],
      ['Node stream', () => Readable.from(['hello']), undefined],
      ['ReadableStream', () => new Blob(['hello']).stream(), undefined],
      ['Response', () => new Response('hello'), undefined]
    ]

    for (const [name, makeBody, expected] of bodies) {
      it(`deduces the length of a ${name} body`, () => {
        const res = response()
        res.body = makeBody()
        res.remove('Content-Length')
        assert.strictEqual(res.length, expected)
      })
    }

    describe('and .body is not', () => {
      it('should return undefined', () => {
        const res = response()
        assert.strictEqual(res.length, undefined)
      })
    })
  })

  it('honors a Response Content-Length', () => {
    const res = response()
    res.body = new Response('hello', { headers: { 'Content-Length': '5' } })
    assert.strictEqual(res.length, 5)
  })

  it('keeps the native header setter unchanged', () => {
    const req = new IncomingMessage(new Duplex())
    const raw = new ServerResponse(req)
    const setHeader = raw.setHeader
    const ctx = new Koa().createContext(req, raw)
    ctx.body = 'short'
    assert.strictEqual(raw.setHeader, setHeader)
  })

  it('clears Content-Length when a header after Transfer-Encoding is rejected', () => {
    const res = nativeResponse()
    res.body = 'hello'
    const headers = { 'tRaNsFeR-EnCoDiNg': 'chunked', 'X-Invalid': 'bad\nvalue' }
    assert.throws(() => {
      res.set(headers)
    }, { code: 'ERR_INVALID_CHAR' })
    assert.strictEqual(res.get('Transfer-Encoding'), 'chunked')
    assert.strictEqual(res.has('Content-Length'), false)
  })

  it('clears a conflicting length before a later header is rejected', () => {
    const res = nativeResponse()
    res.set('Transfer-Encoding', 'chunked')
    const headers = { 'Content-Length': '5', 'X-Invalid': 'bad\nvalue' }
    assert.throws(() => {
      res.set(headers)
    }, { code: 'ERR_INVALID_CHAR' })
    assert.strictEqual(res.get('Transfer-Encoding'), 'chunked')
    assert.strictEqual(res.has('Content-Length'), false)
  })

  it('preserves Content-Length when Transfer-Encoding itself is rejected', () => {
    const res = nativeResponse()
    res.body = 'hello'
    assert.throws(() => {
      res.set('Transfer-Encoding', 'bad\nvalue')
    }, { code: 'ERR_INVALID_CHAR' })
    assert.strictEqual(res.has('Transfer-Encoding'), false)
    assert.strictEqual(res.length, 5)
  })

  it('clears a deleted Content-Length when the same Response is reassigned', () => {
    const res = response()
    const headers = { 'Content-Length': '5' }
    const body = new Response('hello', { headers })
    res.body = body
    body.headers.delete('Content-Length')
    res.body = body
    assert.strictEqual(res.has('Content-Length'), false)
    assert.strictEqual(res.length, undefined)
  })

  it('copies an updated Content-Length when the same Response is reassigned', () => {
    const res = response()
    const headers = { 'Content-Length': '5' }
    const body = new Response('hello', { headers })
    res.body = body
    body.headers.set('Content-Length', '11')
    res.body = body
    assert.strictEqual(res.length, 11)
  })

  it('ignores a Response Content-Length when Transfer-Encoding is already set', () => {
    const res = response()
    res.set('Transfer-Encoding', 'chunked')
    const headers = { 'Content-Length': '5' }
    res.body = new Response('hello', { headers })
    assert.strictEqual(res.has('Content-Length'), false)
    assert.strictEqual(res.get('Transfer-Encoding'), 'chunked')
  })

  it('prefers Transfer-Encoding when both framing headers are copied from a Response', () => {
    const res = response()
    const headers = { 'Content-Length': '5', 'Transfer-Encoding': 'chunked' }
    res.body = new Response('hello', { headers })
    assert.strictEqual(res.has('Content-Length'), false)
    assert.strictEqual(res.get('Transfer-Encoding'), 'chunked')
  })

  describe('when transfer encoding replaces length inference', () => {
    const bodies = [
      ['string', () => 'hello world'],
      ['Buffer', () => Buffer.from('hello world')],
      ['Blob', () => new Blob(['hello world'])]
    ]

    bodies.forEach(([kind, makeBody]) => {
      it(`clears an old inferred length when replaced with a ${kind}`, () => {
        const res = response()
        res.body = 'short'
        res.set('Transfer-Encoding', 'chunked')
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
        assert.strictEqual(res.get('Transfer-Encoding'), 'chunked')
      })

      it(`clears an inferred zero length when replaced with a ${kind}`, () => {
        const res = response()
        res.body = ''
        res.set('Transfer-Encoding', 'chunked')
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
      })

      it(`clears an explicit length when transfer encoding replaces inference for a ${kind}`, () => {
        const res = response()
        res.body = 'short'
        res.length = 5
        res.set('Transfer-Encoding', 'chunked')
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
      })

      it(`preserves sent headers when replaced with a ${kind}`, () => {
        const res = response()
        res.body = 'short'
        res.res.headersSent = true
        res.set('Transfer-Encoding', 'chunked')
        res.body = makeBody()
        assert.strictEqual(res.length, 5)
      })
    })
  })

  describe('when a known-length body is replaced', () => {
    const knownLengthBodies = [
      ['string', () => 'short', 5],
      ['Buffer', () => Buffer.from('short'), 5],
      ['Blob', () => new Blob(['short']), 5],
      ['Response', () => new Response('short', { headers: { 'Content-Length': '5' } }), 5],
      ['empty string', () => '', 0],
      ['empty Buffer', () => Buffer.alloc(0), 0],
      ['empty Blob', () => new Blob([]), 0],
      ['empty Response', () => new Response(null, { headers: { 'Content-Length': '0' } }), 0]
    ]
    const unknownLengthBodies = [
      ['ReadableStream', () => new Blob(['hello world']).stream()],
      ['Response', () => new Response('hello world')]
    ]
    const overrides = [
      ['set', (res, length = '11') => res.set('Content-Length', length)],
      ['lowercase set', (res, length = '11') => res.set('content-length', length)],
      ['header object', (res, length = '11') => res.set({ 'Content-Length': length })],
      ['singleton array', (res, length = '11') => res.set('Content-Length', [length])],
      ['length setter', (res, length = 11) => { res.length = length }],
      ['Node setHeader', (res, length = '11') => res.res.setHeader('Content-Length', length)]
    ]

    const replacementCases = unknownLengthBodies.flatMap(([kind, makeBody]) => {
      return knownLengthBodies.map(([originalKind, makeOriginal, originalLength]) => {
        return { kind, makeBody, originalKind, makeOriginal, originalLength }
      })
    })
    const overrideCases = replacementCases.flatMap(testCase => {
      return overrides.map(([name, override]) => {
        return { ...testCase, name, override }
      })
    })

    replacementCases.forEach(({ kind, makeBody, originalKind, makeOriginal }) => {
      it(`clears the length belonging to a ${originalKind} when replaced with a ${kind}`, () => {
        const res = response()
        res.body = makeOriginal()
        res.body = makeBody()
        assert.strictEqual(res.length, undefined)
        assert.strictEqual(res.has('Content-Length'), false)
      })
    })

    overrideCases.forEach(({ kind, makeBody, originalKind, makeOriginal, originalLength, name, override }) => {
      it(`clears a ${name} override set before replacing a ${originalKind} with a ${kind}`, () => {
        const res = response()
        res.body = makeOriginal()
        override(res, originalLength)
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
      })

      it(`preserves a ${name} override set after replacing a ${originalKind} with a ${kind}`, () => {
        const res = response()
        res.body = makeOriginal()
        res.body = makeBody()
        override(res, originalLength)
        assert.strictEqual(res.length, originalLength)
      })
    })

    const explicitLengthCases = unknownLengthBodies.flatMap(([kind, makeBody]) => {
      return [0, 5].map(length => ({ kind, makeBody, length }))
    })

    explicitLengthCases.forEach(({ kind, makeBody, length }) => {
      it(`preserves an explicit override of ${length} after assigning a ${kind}`, () => {
        const res = response()
        res.body = 'short'
        res.body = makeBody()
        res.length = length
        assert.strictEqual(res.length, length)
      })
    })

    unknownLengthBodies.forEach(([kind, makeBody]) => {
      it(`clears a length written before a ${kind} by a setter cached before context creation`, () => {
        const req = new IncomingMessage(new Duplex())
        const raw = new ServerResponse(req)
        const setHeader = raw.setHeader.bind(raw)
        const ctx = new Koa().createContext(req, raw)
        ctx.body = 'short'
        setHeader('Content-Length', 5)
        ctx.body = makeBody()
        assert.strictEqual(ctx.response.has('Content-Length'), false)
        setHeader('Content-Length', 11)
        assert.strictEqual(ctx.length, 11)
      })

      const supportsSetHeaders = typeof ServerResponse.prototype.setHeaders === 'function'
      it(`preserves a Node setHeaders write after assigning a ${kind}`, { skip: !supportsSetHeaders }, () => {
        const res = nativeResponse()
        res.body = 'short'
        res.body = makeBody()
        const result = res.res.setHeaders(new Map([['Content-Length', 5]]))
        assert.strictEqual(result, res.res)
        assert.strictEqual(res.length, 5)
      })

      it(`clears the old length after a rejected raw write with a ${kind}`, () => {
        const res = nativeResponse()
        res.body = 'short'
        assert.throws(() => res.res.setHeader('Content-Length', '5\n'), { code: 'ERR_INVALID_CHAR' })
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
      })

      it(`preserves a middleware header write after assigning a ${kind}`, () => {
        const res = nativeResponse()
        const setHeader = res.res.setHeader
        res.res.setHeader = function (field, value) {
          return Reflect.apply(setHeader, this, arguments)
        }
        res.body = 'short'
        res.body = makeBody()
        const result = res.res.setHeader('Content-Length', 5)
        assert.strictEqual(result, res.res)
        assert.strictEqual(res.length, 5)
      })

      it(`clears each response's previous length independently with a ${kind}`, () => {
        const res = nativeResponse()
        const other = nativeResponse()
        res.body = 'short'
        other.body = 'short'
        res.res.setHeader.call(other.res, 'Content-Length', 5)
        assert.strictEqual(other.length, 5)
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
        other.body = makeBody()
        assert.strictEqual(other.has('Content-Length'), false)
      })

      it(`preserves an explicit length set before any body with a ${kind}`, () => {
        const res = response()
        res.length = 11
        res.body = makeBody()
        assert.strictEqual(res.length, 11)
      })

      it(`clears a newly inferred length after an explicit override with a ${kind}`, () => {
        const res = response()
        res.length = 11
        res.body = 'short'
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
      })

      it(`does not restore a removed length with a ${kind}`, () => {
        const res = response()
        res.body = 'short'
        res.remove('Content-Length')
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
      })

      it(`clears the previous length after removing another header with a ${kind}`, () => {
        const res = response()
        res.body = 'short'
        res.remove('Content-Type')
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
      })

      it(`clears a restored length when replaced with a ${kind}`, () => {
        const res = response()
        res.body = 'short'
        res.remove('cOnTeNt-LeNgTh')
        res.res.setHeader('Content-Length', 5)
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
      })

      it(`keeps transfer encoding without inventing a length with a ${kind}`, () => {
        const res = response()
        res.set('Transfer-Encoding', 'chunked')
        res.body = 'short'
        res.body = makeBody()
        assert.strictEqual(res.get('Transfer-Encoding'), 'chunked')
        assert.strictEqual(res.has('Content-Length'), false)
      })

      it(`clears the original inferred length after transfer encoding skips an update with a ${kind}`, () => {
        const res = response()
        res.body = 'short'
        res.set('Transfer-Encoding', 'chunked')
        res.body = Buffer.from('hello world')
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
        assert.strictEqual(res.get('Transfer-Encoding'), 'chunked')
      })

      it(`removes a conflicting length when transfer encoding skips inference with a ${kind}`, () => {
        const res = response()
        res.set('Transfer-Encoding', 'chunked')
        res.set('Content-Length', '5')
        res.body = 'short'
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
      })

      it(`refreshes the length when the same body is assigned again with a ${kind}`, () => {
        const res = response()
        const body = makeBody()
        res.body = body
        res.length = 11
        res.body = body
        const expected = kind === 'Response' ? undefined : 11
        assert.strictEqual(res.length, expected)
      })

      it(`keeps separate response lengths with a ${kind}`, () => {
        const first = response()
        const second = response()
        first.body = 'short'
        second.length = 11
        second.body = makeBody()
        first.body = makeBody()
        assert.strictEqual(first.has('Content-Length'), false)
        assert.strictEqual(second.length, 11)
      })

      it(`clears lengths across repeated body replacements with a ${kind}`, () => {
        const res = response()
        res.body = 'short'
        res.body = makeBody()
        res.body = new Blob(['another body'])
        res.body = makeBody()
        assert.strictEqual(res.length, undefined)
      })
    })

    const changedHeaderCases = unknownLengthBodies.flatMap(([kind, makeBody]) => {
      return ['set', 'delete'].map(change => ({ kind, makeBody, change }))
    })

    changedHeaderCases.forEach(({ kind, makeBody, change }) => {
      it(`clears the copied length after Response.headers.${change} with a ${kind}`, () => {
        const res = response()
        const headers = { 'Content-Length': '5' }
        const original = new Response('short', { headers })
        res.body = original
        original.headers[change]('Content-Length', '11')
        res.body = original
        const expectedLength = change === 'set' ? 11 : undefined
        assert.strictEqual(res.length, expectedLength)
        res.body = makeBody()
        assert.strictEqual(res.has('Content-Length'), false)
      })
    })

    it('uses the new Response Content-Length', () => {
      const res = response()
      res.body = 'short'
      res.body = new Response('hello world', { headers: { 'Content-Length': '11' } })
      assert.strictEqual(res.length, 11)
    })

    it('keeps the existing Node stream replacement behavior', () => {
      const res = response()
      res.body = 'short'
      res.length = 11
      res.body = Readable.from(['hello world'])
      assert.strictEqual(res.has('Content-Length'), false)
    })
  })

  describe('and a .type is set to json', () => {
    describe('and a .body is set to null', () => {
      it('should return a number', () => {
        const res = response()

        res.type = 'json'
        res.body = null
        assert.strictEqual(res.length, 4)
      })
    })
  })
})
