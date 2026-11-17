'use strict'

const { describe, it } = require('node:test')
const request = require('supertest')
const statuses = require('statuses')
const assert = require('node:assert/strict')
const { Readable } = require('node:stream')
const { runInNewContext } = require('node:vm')
const Koa = require('../..')
const fs = require('fs')

describe('app.respond', () => {
  for (const name of ['Response', 'ReadableStream']) {
    it(`sends JSON, Node streams and web bodies without global ${name}`, async t => {
      const webBody = name === 'Response'
        ? new Response('hello', { status: 201, headers: { 'X-Test': 'response' } })
        : new Blob(['hello']).stream()
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, name)
      if (descriptor) t.after(() => Object.defineProperty(globalThis, name, descriptor))
      delete globalThis[name]

      const app = new Koa()
      const json = { hello: 'world' }
      app.use(ctx => {
        if (ctx.path === '/json') ctx.body = json
        else if (ctx.path === '/stream') ctx.body = Readable.from(['hello'])
        else ctx.body = webBody
      })
      const client = request(app.callback())
      await client.get('/json').expect(200, json)
      await client.get('/stream').expect(200, Buffer.from('hello'))
      if (name === 'Response') await client.get('/web').expect(201, 'hello').expect('X-Test', 'response')
      else await client.get('/web').expect(200, Buffer.from('hello'))
    })
  }

  it('streams a ReadableStream with a VM-realm prototype and custom tag', async () => {
    const ForeignStream = runInNewContext('(class ForeignStream {})')
    const descriptors = Object.getOwnPropertyDescriptors(ReadableStream.prototype)
    delete descriptors.constructor
    descriptors[Symbol.toStringTag] = { value: 'CustomBody' }
    Object.defineProperties(ForeignStream.prototype, descriptors)
    const app = new Koa()
    app.use(ctx => {
      const source = {
        start (controller) {
          controller.enqueue(Buffer.from('hello'))
          controller.close()
        }
      }
      const stream = Reflect.construct(ReadableStream, [source], ForeignStream)
      assert.equal(stream.constructor, ForeignStream)
      assert.equal(stream instanceof ReadableStream, false)
      ctx.body = stream
      assert.equal(ctx.response.length, undefined)
    })
    const client = request(app.callback())
    await client.get('/').expect(200, Buffer.from('hello')).expect('Content-Type', 'application/octet-stream')
    const head = await client.head('/').expect(200).expect('Content-Type', 'application/octet-stream')
    assert.equal(head.headers['content-length'], undefined)
    assert.equal(head.text, undefined)
  })

  it('sends a Response from a VM-realm subclass with a custom tag', async () => {
    const ForeignResponse = runInNewContext(`(class ForeignResponse extends Response {
      get [Symbol.toStringTag] () { return 'CustomBody' }
    })`, { Response })
    const tag = Object.getOwnPropertyDescriptor(ForeignResponse.prototype, Symbol.toStringTag)
    assert.equal(tag.get instanceof Function, false)
    const app = new Koa()
    app.use(ctx => {
      const headers = { 'X-Realm': 'vm' }
      ctx.body = new ForeignResponse('hello', { status: 201, headers })
      assert.equal(ctx.response.length, undefined)
    })
    const client = request(app.callback())
    await client.get('/').expect(201, 'hello').expect('X-Realm', 'vm')
    const head = await client.head('/').expect(201).expect('X-Realm', 'vm')
    assert.equal(head.headers['content-length'], undefined)
    assert.equal(head.text, undefined)
  })

  it('flushes only Transfer-Encoding when a length was set afterward', async () => {
    const app = new Koa()
    app.use(ctx => {
      ctx.body = 'hello'
      ctx.set('Transfer-Encoding', 'chunked')
      assert.equal(ctx.response.has('Content-Length'), false)
      ctx.set('Content-Length', '5')
      assert.equal(ctx.response.has('Content-Length'), false)
      ctx.response.flushHeaders()
    })
    const res = await request(app.callback()).get('/').expect(200, 'hello')
    assert.equal(res.headers['transfer-encoding'], 'chunked')
    assert.equal(res.headers['content-length'], undefined)
  })

  it('clears Content-Length before flushing headers with raw Transfer-Encoding', async () => {
    const app = new Koa()
    app.use(ctx => {
      ctx.body = 'hello'
      ctx.res.setHeader('Transfer-Encoding', 'chunked')
      ctx.flushHeaders()
      assert.equal(ctx.response.has('Content-Length'), false)
    })
    const res = await request(app.callback()).get('/').expect(200, 'hello')
    assert.equal(res.headers['transfer-encoding'], 'chunked')
    assert.equal(res.headers['content-length'], undefined)
  })

  for (const method of ['setHeader', 'setHeaders']) {
    it(`preserves an identical write through cached raw ${method}`, async () => {
      const app = new Koa()
      app.use(ctx => {
        const write = ctx.res[method].bind(ctx.res)
        const body = new Response('hello', { headers: { 'Content-Length': '5' } })
        ctx.body = body
        const result = method === 'setHeader'
          ? write('Content-Length', '5')
          : write(new Map([['Content-Length', '5']]))
        assert.equal(result, ctx.res)
        const isHeadRequest = ctx.method === 'HEAD'
        if (isHeadRequest) body.headers.set('Content-Length', '7')
        else body.headers.delete('Content-Length')
        ctx.body = body
        assert.equal(ctx.length, 5)
      })
      const client = request(app.callback())
      await client.get('/').expect(200, 'hello').expect('Content-Length', '5')
      const head = await client.head('/').expect(200).expect('Content-Length', '5')
      assert.equal(head.text, undefined)
    })
  }

  it('clears a copied Content-Length after a raw overwrite is rejected', async () => {
    const app = new Koa()
    app.use(ctx => {
      const body = new Response('hello', { headers: { 'Content-Length': '5' } })
      ctx.body = body
      assert.throws(() => ctx.res.setHeader('Content-Length', undefined), {
        code: 'ERR_HTTP_INVALID_HEADER_VALUE'
      })
      body.headers.delete('Content-Length')
      ctx.body = body
      assert.equal(ctx.length, undefined)
    })
    await request(app.callback()).get('/').expect(200, 'hello')
  })

  describe('when ctx.respond === false', () => {
    it('should function (ctx)', () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = 'Hello'
        ctx.respond = false

        const res = ctx.res
        res.statusCode = 200
        setImmediate(() => {
          res.setHeader('Content-Type', 'text/plain')
          res.setHeader('Content-Length', '3')
          res.end('lol')
        })
      })

      return request(app.callback())
        .get('/')
        .expect(200)
        .expect('lol')
    })

    it('should ignore set header after header sent', () => {
      const app = new Koa()
      app.use(ctx => {
        ctx.body = 'Hello'
        ctx.respond = false

        const res = ctx.res
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.setHeader('Content-Length', '3')
        res.end('lol')
        ctx.set('foo', 'bar')
      })

      return request(app.callback())
        .get('/')
        .expect(200)
        .expect('lol')
        .expect(res => {
          assert(!res.headers.foo)
        })
    })

    it('should ignore set status after header sent', () => {
      const app = new Koa()
      app.use(ctx => {
        ctx.body = 'Hello'
        ctx.respond = false

        const res = ctx.res
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/plain')
        res.setHeader('Content-Length', '3')
        res.end('lol')
        ctx.status = 201
      })

      return request(app.callback())
        .get('/')
        .expect(200)
        .expect('lol')
    })
  })

  describe('when this.type === null', () => {
    it('should not send Content-Type header', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = ''
        ctx.type = null
      })

      const res = await request(app.callback())
        .get('/')
        .expect(200)

      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
    })
  })

  describe('when HEAD is used', () => {
    it('should not respond with the body', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = 'Hello'
      })

      const res = await request(app.callback())
        .head('/')
        .expect(200)

      assert.strictEqual(res.headers['content-type'], 'text/plain; charset=utf-8')
      assert.strictEqual(res.headers['content-length'], '5')
      assert(!res.text)
    })

    it('should keep json headers', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = { hello: 'world' }
      })

      const res = await request(app.callback())
        .head('/')
        .expect(200)

      assert.strictEqual(res.headers['content-type'], 'application/json; charset=utf-8')
      assert.strictEqual(res.headers['content-length'], '17')
      assert(!res.text)
    })

    it('should keep string headers', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = 'hello world'
      })

      const res = await request(app.callback())
        .head('/')
        .expect(200)

      assert.strictEqual(res.headers['content-type'], 'text/plain; charset=utf-8')
      assert.strictEqual(res.headers['content-length'], '11')
      assert(!res.text)
    })

    it('should keep buffer headers', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = Buffer.from('hello world')
      })

      const res = await request(app.callback())
        .head('/')
        .expect(200)

      assert.strictEqual(res.headers['content-type'], 'application/octet-stream')
      assert.strictEqual(res.headers['content-length'], '11')
      assert(!res.text)
    })

    it('should keep stream header if set manually', async () => {
      const app = new Koa()

      const { length } = fs.readFileSync('package.json')

      app.use(ctx => {
        ctx.length = length
        ctx.body = fs.createReadStream('package.json')
      })

      const res = await request(app.callback())
        .head('/')
        .expect(200)

      assert.strictEqual(~~res.header['content-length'], length)
      assert(!res.text)
    })

    for (const [name, body] of [
      ['ReadableStream', () => new Blob(['hello']).stream()],
      ['Response', () => new Response('hello')]
    ]) {
      it(`should not invent a length for a ${name} body`, async () => {
        const app = new Koa()
        app.use(ctx => { ctx.body = body() })

        const res = await request(app.callback()).head('/').expect(200)
        assert.strictEqual(res.headers['content-length'], undefined)
      })
    }

    it('should respond with a 404 if no body was set', () => {
      const app = new Koa()

      app.use(ctx => {

      })

      return request(app.callback())
        .head('/')
        .expect(404)
    })

    it('should respond with a 200 if body = ""', () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = ''
      })

      return request(app.callback())
        .head('/')
        .expect(200)
    })

    it('should not overwrite the content-type', () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.status = 200
        ctx.type = 'application/javascript'
      })

      return request(app.callback())
        .head('/')
        .expect('content-type', /application\/javascript/)
        .expect(200)
    })
  })

  describe('when no middleware is present', () => {
    it('should 404', () => {
      const app = new Koa()

      return request(app.callback())
        .get('/')
        .expect(404)
    })
  })

  describe('when res has already been written to', () => {
    it('should not cause an app error', () => {
      const app = new Koa()

      app.use((ctx, next) => {
        const res = ctx.res
        ctx.status = 200
        res.setHeader('Content-Type', 'text/html')
        res.write('Hello')
      })

      app.on('error', err => { throw err })

      return request(app.callback())
        .get('/')
        .expect(200)
    })

    it('should send the right body', () => {
      const app = new Koa()

      app.use((ctx, next) => {
        const res = ctx.res
        ctx.status = 200
        res.setHeader('Content-Type', 'text/html')
        res.write('Hello')
        return new Promise(resolve => {
          setTimeout(() => {
            res.end('Goodbye')
            resolve()
          }, 0)
        })
      })

      return request(app.callback())
        .get('/')
        .expect(200)
        .expect('HelloGoodbye')
    })
  })

  describe('when .body is missing', () => {
    describe('with status=400', () => {
      it('should respond with the associated status message', () => {
        const app = new Koa()

        app.use(ctx => {
          ctx.status = 400
        })

        return request(app.callback())
          .get('/')
          .expect(400)
          .expect('Content-Length', '11')
          .expect('Bad Request')
      })
    })

    describe('with status=204', () => {
      it('should respond without a body', async () => {
        const app = new Koa()

        app.use(ctx => {
          ctx.status = 204
        })

        const res = await request(app.callback())
          .get('/')
          .expect(204)
          .expect('')

        assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
      })
    })

    describe('with status=205', () => {
      it('should respond without a body', async () => {
        const app = new Koa()

        app.use(ctx => {
          ctx.status = 205
        })

        const res = await request(app.callback())
          .get('/')
          .expect(205)
          .expect('')

        assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
      })
    })

    describe('with status=304', () => {
      it('should respond without a body', async () => {
        const app = new Koa()

        app.use(ctx => {
          ctx.status = 304
        })

        const res = await request(app.callback())
          .get('/')
          .expect(304)
          .expect('')

        assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
      })
    })

    describe('with custom status=700', () => {
      it('should respond with the associated status message', async () => {
        const app = new Koa()
        statuses.message['700'] = 'custom status'

        app.use(ctx => {
          ctx.status = 700
        })

        const res = await request(app.callback())
          .get('/')
          .expect(700)
          .expect('custom status')

        assert.strictEqual(res.res.statusMessage, 'custom status')
      })
    })

    describe('with custom statusMessage=ok', () => {
      it('should respond with the custom status message', async () => {
        const app = new Koa()

        app.use(ctx => {
          ctx.status = 200
          ctx.message = 'ok'
        })

        const res = await request(app.callback())
          .get('/')
          .expect(200)
          .expect('ok')

        assert.strictEqual(res.res.statusMessage, 'ok')
      })
    })

    describe('with custom status without message', () => {
      it('should respond with the status code number', () => {
        const app = new Koa()

        app.use(ctx => {
          ctx.res.statusCode = 701
        })

        return request(app.callback())
          .get('/')
          .expect(701)
          .expect('701')
      })
    })
  })

  describe('when .body is a null', () => {
    it('should respond 204 by default', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = null
      })

      const res = await request(app.callback())
        .get('/')
        .expect(204)
        .expect('')

      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
    })

    it('should respond 204 with status=200', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.status = 200
        ctx.body = null
      })

      const res = await request(app.callback())
        .get('/')
        .expect(204)
        .expect('')

      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
    })

    it('should respond 205 with status=205', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.status = 205
        ctx.body = null
      })

      const res = await request(app.callback())
        .get('/')
        .expect(205)
        .expect('')

      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
    })

    it('should respond 304 with status=304', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.status = 304
        ctx.body = null
      })

      const res = await request(app.callback())
        .get('/')
        .expect(304)
        .expect('')

      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
    })
  })

  describe('when .body is undefined', () => {
    it('should respond 204 by default', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = undefined
      })

      const res = await request(app.callback())
        .get('/')
        .expect(204)
        .expect('')

      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
    })

    it('should respond 204 with status=200', async () => {
      const app = new Koa()
      app.use(ctx => {
        ctx.status = 200
        ctx.body = undefined
      })

      const res = await request(app.callback())
        .get('/')
        .expect(204)
        .expect('')

      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
    })
  })

  describe('when .body is a string', () => {
    it('should respond', () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = 'Hello'
      })

      return request(app.callback())
        .get('/')
        .expect('Hello')
    })
  })

  describe('when .body is a Buffer', () => {
    it('should respond', () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = Buffer.from('Hello')
      })

      return request(app.callback())
        .get('/')
        .expect(200)
        .expect(Buffer.from('Hello'))
    })
  })

  describe('when .body is a Blob', () => {
    it('should respond', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = new Blob(['Hello'])
      })

      const expectedBlob = new Blob(['Hello'])

      const res = await request(app.callback())
        .get('/')
        .expect(200)

      assert.deepStrictEqual(res.body, Buffer.from(await expectedBlob.arrayBuffer()))
    })

    it('should keep Blob headers', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = new Blob(['hello world'])
      })

      return request(app.callback())
        .head('/')
        .expect(200)
        .expect('content-type', 'application/octet-stream')
        .expect('content-length', '11')
    })
  })

  describe('when .body is a ReadableStream', () => {
    it('should respond', async () => {
      const app = new Koa()

      app.use(async ctx => {
        ctx.body = new ReadableStream()
      })

      return request(app.callback())
        .head('/')
        .expect(200)
        .expect('content-type', 'application/octet-stream')
    })

    it('should respond hello', async () => {
      const app = new Koa()

      app.use(async ctx => {
        const blob = new Blob(['hello'])
        ctx.body = blob.stream()
      })

      return request(app.callback())
        .get('/')
        .expect(200)
        .expect('content-type', 'application/octet-stream')
        .expect(Buffer.from('hello'))
    })

    it('should handle ReadableStream with chunks', async () => {
      const app = new Koa()

      app.use(async ctx => {
        const stream = new ReadableStream({
          start (controller) {
            controller.enqueue(new TextEncoder().encode('Hello '))
            controller.enqueue(new TextEncoder().encode('World'))
            controller.close()
          }
        })
        ctx.body = stream
      })

      return request(app.callback())
        .get('/')
        .expect(200)
        .expect('content-type', 'application/octet-stream')
        .expect(Buffer.from('Hello World'))
    })

    it('should handle ReadableStream with custom headers', async () => {
      const app = new Koa()

      app.use(async ctx => {
        ctx.type = 'text/plain'
        ctx.body = new ReadableStream({
          start (controller) {
            controller.enqueue(new TextEncoder().encode('test content'))
            controller.close()
          }
        })
      })

      const res = await request(app.callback())
        .get('/')
        .expect(200)
        .expect('content-type', 'text/plain; charset=utf-8')

      assert.strictEqual(res.text, 'test content')
    })
  })

  describe('when .body is a Response', () => {
    it('should keep Response headers', () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = new Response(null, { status: 201, statusText: 'OK', headers: { 'Content-Type': 'text/plain' } })
      })

      return request(app.callback())
        .head('/')
        .expect(201)
        .expect('content-type', 'text/plain')
        .expect(res => assert.strictEqual(res.headers['content-length'], undefined))
    })

    it('should default to octet-stream', () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = new Response(null, { status: 200, statusText: 'OK' })
      })

      return request(app.callback())
        .get('/')
        .expect(200)
        .expect('content-type', 'application/octet-stream')
        .expect(Buffer.from([]))
    })

    it('should respond with body content', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = new Response('Hello World', { status: 200, headers: { 'Content-Type': 'text/plain' } })
      })

      const res = await request(app.callback())
        .get('/')
        .expect(200)
        .expect('content-type', 'text/plain')

      assert.strictEqual(res.text, 'Hello World')
    })

    it('should handle Response from fetch() with JSON', async () => {
      const app = new Koa()

      app.use(async ctx => {
        const jsonData = JSON.stringify({ message: 'Hello from fetch', timestamp: Date.now() })
        const response = new Response(jsonData, {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Custom-Header': 'custom-value'
          }
        })
        ctx.body = response
      })

      const res = await request(app.callback())
        .get('/')
        .expect(200)
        .expect('content-type', 'application/json')

      const body = JSON.parse(res.text)
      assert.strictEqual(body.message, 'Hello from fetch')
      assert(body.timestamp)
    })

    it('should handle Response from fetch() with streaming body', async () => {
      const app = new Koa()

      app.use(async ctx => {
        const stream = new ReadableStream({
          start (controller) {
            controller.enqueue(new TextEncoder().encode('Streaming '))
            controller.enqueue(new TextEncoder().encode('response '))
            controller.enqueue(new TextEncoder().encode('from fetch'))
            controller.close()
          }
        })

        const response = new Response(stream, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain'
          }
        })
        ctx.body = response
      })

      const res = await request(app.callback())
        .get('/')
        .expect(200)
        .expect('content-type', 'text/plain')

      assert.strictEqual(res.text, 'Streaming response from fetch')
    })

    it('should handle Response from fetch() with Blob body', async () => {
      const app = new Koa()

      app.use(async ctx => {
        const blob = new Blob(['Hello from Blob'], { type: 'text/plain' })
        const response = new Response(blob, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain'
          }
        })
        ctx.body = response
      })

      const res = await request(app.callback())
        .get('/')
        .expect(200)
        .expect('content-type', 'text/plain')

      assert.strictEqual(res.text, 'Hello from Blob')
    })
  })

  describe('when .body is a Stream', () => {
    it('should respond', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = fs.createReadStream('package.json')
        ctx.set('Content-Type', 'application/json; charset=utf-8')
      })

      const res = await request(app.callback())
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')

      const pkg = require('../../package')
      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'content-length'), false)
      assert.deepStrictEqual(res.body, pkg)
    })

    it('should strip content-length when overwriting', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = 'hello'
        ctx.body = fs.createReadStream('package.json')
        ctx.set('Content-Type', 'application/json; charset=utf-8')
      })

      const res = await request(app.callback())
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')

      const pkg = require('../../package')
      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'content-length'), false)
      assert.deepStrictEqual(res.body, pkg)
    })

    it('should keep content-length if not overwritten', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.length = fs.readFileSync('package.json').length
        ctx.body = fs.createReadStream('package.json')
        ctx.set('Content-Type', 'application/json; charset=utf-8')
      })

      const res = await request(app.callback())
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')

      const pkg = require('../../package')
      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'content-length'), true)
      assert.deepStrictEqual(res.body, pkg)
    })

    it('should keep content-length if overwritten with the same stream',
      async () => {
        const app = new Koa()

        app.use(ctx => {
          ctx.length = fs.readFileSync('package.json').length
          const stream = fs.createReadStream('package.json')
          ctx.body = stream
          ctx.body = stream
          ctx.set('Content-Type', 'application/json; charset=utf-8')
        })

        const res = await request(app.callback())
          .get('/')
          .expect('Content-Type', 'application/json; charset=utf-8')

        const pkg = require('../../package')
        assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'content-length'), true)
        assert.deepStrictEqual(res.body, pkg)
      })

    it('should handle errors when no content status', () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.status = 204
        ctx.body = fs.createReadStream('does not exist')
      })

      return request(app.callback())
        .get('/')
        .expect(204)
    })
  })

  describe('when using pipeline for streams', () => {
    it('should handle stream errors when error listener exists', async () => {
      const app = new Koa()
      const PassThrough = require('stream').PassThrough

      let errorCaught = false
      app.once('error', err => {
        assert(err.message === 'stream error')
        errorCaught = true
      })

      app.use(ctx => {
        const stream = new PassThrough()
        ctx.body = stream

        setImmediate(() => {
          stream.emit('error', new Error('stream error'))
        })
      })

      await request(app.callback())
        .get('/')
        .catch(() => {})

      await new Promise(resolve => setTimeout(resolve, 50))
      assert(errorCaught, 'Error should have been caught')
    })

    it('should not crash when stream errors and no error listener exists', async () => {
      const app = new Koa()
      const PassThrough = require('stream').PassThrough

      app.use(ctx => {
        const stream = new PassThrough()
        ctx.body = stream

        setImmediate(() => {
          stream.emit('error', new Error('stream error'))
        })
      })

      await request(app.callback())
        .get('/')
        .catch(() => {})

      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle ReadableStream errors when error listener exists', async () => {
      const app = new Koa()

      let errorCaught = false
      app.once('error', err => {
        assert(err.message === 'readable stream error')
        errorCaught = true
      })

      app.use(ctx => {
        const readable = new ReadableStream({
          start (controller) {
            controller.enqueue(new TextEncoder().encode('data'))
            controller.error(new Error('readable stream error'))
          }
        })
        ctx.body = readable
      })

      await request(app.callback())
        .get('/')
        .catch(() => {})

      await new Promise(resolve => setTimeout(resolve, 50))
      assert(errorCaught, 'Error should have been caught')
    })

    it('should cleanup streams on client abort', async () => {
      const app = new Koa()
      const PassThrough = require('stream').PassThrough
      const http = require('http')

      let streamDestroyed = false

      app.use(ctx => {
        const stream = new PassThrough()
        stream.on('close', () => {
          streamDestroyed = true
        })
        ctx.body = stream

        setImmediate(() => {
          stream.write('some data')
        })
      })

      const server = app.listen()

      await new Promise((resolve) => {
        const req = http.request({
          port: server.address().port,
          path: '/'
        })

        req.on('response', (res) => {
          res.on('data', () => {
            req.destroy()
            setTimeout(() => {
              server.close()
              resolve()
            }, 50)
          })
        })

        req.end()
      })

      assert(streamDestroyed, 'Stream should be destroyed on client abort')
    })
  })

  describe('when .body is an Object', () => {
    it('sends a Response lookalike as JSON', async () => {
      class Lookalike {
        get [Symbol.toStringTag] () { return 'Response' }
        get status () { return 201 }
        get headers () { return new Map() }
        clone () { return new Lookalike() }
      }

      const body = new Lookalike()
      body.hello = 'world'
      const app = new Koa()
      app.use(ctx => { ctx.body = body })
      await request(app.callback()).get('/').expect(200, { hello: 'world' })
    })

    for (const tag of ['ReadableStream', 'Response']) {
      it(`sends a JSON dictionary tagged as ${tag}`, async () => {
        const app = new Koa()
        const body = { __proto__: null, [Symbol.toStringTag]: tag, hello: 'world' }
        app.use(ctx => { ctx.body = body })
        await request(app.callback()).get('/').expect(200, { hello: 'world' })
      })
    }

    it('should respond with json', () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = { hello: 'world' }
      })

      return request(app.callback())
        .get('/')
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect('{"hello":"world"}')
    })
    describe('and headers sent', () => {
      it('should respond with json body and headers', () => {
        const app = new Koa()

        app.use(ctx => {
          ctx.length = 17
          ctx.type = 'json'
          ctx.set('foo', 'bar')
          ctx.res.flushHeaders()
          ctx.body = { hello: 'world' }
        })

        return request(app.callback())
          .get('/')
          .expect('Content-Type', 'application/json; charset=utf-8')
          .expect('Content-Length', '17')
          .expect('foo', 'bar')
          .expect('{"hello":"world"}')
      })
    })
  })

  describe('when an error occurs', () => {
    it('should emit "error" on the app', async () => {
      const app = new Koa()
      let errorCaught = false

      app.on('error', err => {
        assert.strictEqual(err.message, 'test error')
        errorCaught = true
      })

      app.use(ctx => {
        throw new Error('test error')
      })

      await request(app.callback())
        .get('/')
        .expect(500)

      assert.strictEqual(errorCaught, true)
    })

    describe('with an .expose property', () => {
      it('should expose the message', () => {
        const app = new Koa()

        app.use(ctx => {
          const err = new Error('sorry!')
          err.status = 403
          err.expose = true
          throw err
        })

        return request(app.callback())
          .get('/')
          .expect(403, 'sorry!')
      })
    })

    describe('with a .status property', () => {
      it('should respond with .status', () => {
        const app = new Koa()

        app.use(ctx => {
          const err = new Error('s3 explodes')
          err.status = 403
          throw err
        })

        return request(app.callback())
          .get('/')
          .expect(403, 'Forbidden')
      })
    })

    it('should respond with 500', () => {
      const app = new Koa()

      app.use(ctx => {
        throw new Error('boom!')
      })

      return request(app.callback())
        .get('/')
        .expect(500, 'Internal Server Error')
    })

    it('should be catchable', () => {
      const app = new Koa()

      app.use((ctx, next) => {
        return next().then(() => {
          ctx.body = 'Hello'
        }).catch(() => {
          ctx.body = 'Got error'
        })
      })

      app.use((ctx, next) => {
        throw new Error('boom!')
      })

      return request(app.callback())
        .get('/')
        .expect(200, 'Got error')
    })
  })

  describe('when status and body property', () => {
    it('should 200', () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.status = 304
        ctx.body = 'hello'
        ctx.status = 200
      })

      return request(app.callback())
        .get('/')
        .expect(200)
        .expect('hello')
    })

    it('should 204', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.status = 200
        ctx.body = 'hello'
        ctx.set('content-type', 'text/plain; charset=utf8')
        ctx.status = 204
      })

      const res = await request(app.callback())
        .get('/')
        .expect(204)

      assert.strictEqual(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
    })
  })

  describe('with explicit null body', () => {
    it('should preserve given status', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = null
        ctx.status = 404
      })

      return request(app.callback())
        .get('/')
        .expect(404)
        .expect('')
        .expect({})
    })
    it('should respond with correct headers', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = null
        ctx.status = 401
      })

      const res = await request(app.callback())
        .get('/')
        .expect(401)
        .expect('')
        .expect({})

      assert.equal(Object.prototype.hasOwnProperty.call(res.headers, 'transfer-encoding'), false)
      assert.equal(Object.prototype.hasOwnProperty.call(res.headers, 'Content-Type'), false)
      assert.equal(Object.prototype.hasOwnProperty.call(res.headers, 'content-length'), true)
    })

    it('should return content-length equal to 0', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = null
        ctx.status = 401
      })

      const res = await request(app.callback())
        .get('/')
        .expect(401)
        .expect('')
        .expect({})

      assert.equal(res.headers['content-length'], '0')
    })
    it('should not overwrite the content-length', async () => {
      const app = new Koa()

      app.use(ctx => {
        ctx.body = null
        ctx.length = 10
        ctx.status = 404
      })

      const res = await request(app.callback())
        .get('/')
        .expect(404)
        .expect('')
        .expect({})

      assert.equal(res.headers['content-length'], '0')
    })
  })
})
