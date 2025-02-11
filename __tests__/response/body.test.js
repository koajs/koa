'use strict'

const { describe, it } = require('node:test')
const response = require('../../test-helpers/context').response
const assert = require('assert')
const fs = require('fs')
const Stream = require('stream')

describe('res.body=', () => {
  describe('when Content-Type is set', () => {
    it('should not override', () => {
      const res = response()
      res.type = 'png'
      res.body = Buffer.from('something')
      assert.strictEqual('image/png', res.header['content-type'])
    })

    describe('when body is an object', () => {
      it('should override as json', () => {
        const res = response()

        res.body = '<em>hey</em>'
        assert.strictEqual('text/html; charset=utf-8', res.header['content-type'])

        res.body = { foo: 'bar' }
        assert.strictEqual('application/json; charset=utf-8', res.header['content-type'])
      })
    })

    it('should override length', () => {
      const res = response()
      res.type = 'html'
      res.body = 'something'
      assert.strictEqual(res.length, 9)
    })
  })

  describe('when a string is given', () => {
    it('should default to text', () => {
      const res = response()
      res.body = 'Tobi'
      assert.strictEqual('text/plain; charset=utf-8', res.header['content-type'])
    })

    it('should set length', () => {
      const res = response()
      res.body = 'Tobi'
      assert.strictEqual('4', res.header['content-length'])
    })

    describe('and contains a non-leading <', () => {
      it('should default to text', () => {
        const res = response()
        res.body = 'aklsdjf < klajsdlfjasd'
        assert.strictEqual('text/plain; charset=utf-8', res.header['content-type'])
      })
    })
  })

  describe('when an html string is given', () => {
    it('should default to html', () => {
      const res = response()
      res.body = '<h1>Tobi</h1>'
      assert.strictEqual('text/html; charset=utf-8', res.header['content-type'])
    })

    it('should set length', () => {
      const string = '<h1>Tobi</h1>'
      const res = response()
      res.body = string
      assert.strictEqual(res.length, Buffer.byteLength(string))
    })

    it('should set length when body is overridden', () => {
      const string = '<h1>Tobi</h1>'
      const res = response()
      res.body = string
      res.body = string + string
      assert.strictEqual(res.length, 2 * Buffer.byteLength(string))
    })

    describe('when it contains leading whitespace', () => {
      it('should default to html', () => {
        const res = response()
        res.body = '    <h1>Tobi</h1>'
        assert.strictEqual('text/html; charset=utf-8', res.header['content-type'])
      })
    })
  })

  describe('when an xml string is given', () => {
    it('should default to html', () => {
      /**
       * ctx test is to show that we're not going
       * to be stricter with the html sniff
       * or that we will sniff other string types.
       * You should `.type=` if ctx simple test fails.
       */

      const res = response()
      res.body = '<?xml version="1.0" encoding="UTF-8"?>\n<俄语>данные</俄语>'
      assert.strictEqual('text/html; charset=utf-8', res.header['content-type'])
    })
  })

  describe('when a stream is given', () => {
    it('should default to an octet stream', () => {
      const res = response()
      res.body = fs.createReadStream('LICENSE')
      assert.strictEqual('application/octet-stream', res.header['content-type'])
    })

    it('should add error handler to the stream, but only once', () => {
      const res = response()
      const body = new Stream.PassThrough()
      assert.strictEqual(body.listenerCount('error'), 0)
      res.body = body
      assert.strictEqual(body.listenerCount('error'), 1)
      res.body = body
      assert.strictEqual(body.listenerCount('error'), 1)
    })
  })

  describe('when a buffer is given', () => {
    it('should default to an octet stream', () => {
      const res = response()
      res.body = Buffer.from('hey')
      assert.strictEqual('application/octet-stream', res.header['content-type'])
    })

    it('should set length', () => {
      const res = response()
      res.body = Buffer.from('Tobi')
      assert.strictEqual('4', res.header['content-length'])
    })
  })

  describe('when an object is given', () => {
    it('should default to json', () => {
      const res = response()
      res.body = { foo: 'bar' }
      assert.strictEqual('application/json; charset=utf-8', res.header['content-type'])
    })
  })

  describe('when a ReadableStream is given', () => {
    it('should default to an octet stream', () => {
      const res = response()
      res.body = new ReadableStream()
      assert.strictEqual('application/octet-stream', res.header['content-type'])
    })
  })

  describe('when a Blob is given', () => {
    it('should default to an octet stream', () => {
      const res = response()
      res.body = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/octet-stream' })
      assert.strictEqual('application/octet-stream', res.header['content-type'])
    })

    it('should set length', () => {
      const res = response()
      res.body = new Blob([new Uint8Array([1, 2, 3])], { type: 'application/octet-stream' })
      assert.strictEqual('3', res.header['content-length'])
    })
  })

  describe('when a response is given', () => {
    it('should set the status', () => {
      const res = response()
      res.body = new Response(null, { status: 201 })
      assert.strictEqual(201, res.status)
    })

    it('should set headers', () => {
      const res = response()
      res.body = new Response(null, { status: 200, headers: { 'x-fizz': 'buzz', 'x-foo': 'bar' } })
      assert.strictEqual('buzz', res.header['x-fizz'])
      assert.strictEqual('bar', res.header['x-foo'])
    })

    it('should redirect', () => {
      const res = response()
      res.body = Response.redirect('https://www.example.com/', 301)
      assert.strictEqual(301, res.status)
      assert.strictEqual('https://www.example.com/', res.header.location)
    })
  })
})
