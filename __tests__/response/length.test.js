'use strict'

const { describe, it } = require('node:test')
const response = require('../../test-helpers/context').response
const assert = require('node:assert/strict')
const fs = require('fs')

describe('res.length', () => {
  describe('when Content-Length is defined', () => {
    it('honors a Response Content-Length', () => {
      const res = response()
      res.body = new Response('hello', { headers: { 'Content-Length': '5' } })
      assert.strictEqual(res.length, 5)
    })

    it('clears a copied Content-Length when the same Response removes it', () => {
      const res = response()
      const body = new Response('hello', { headers: { 'Content-Length': '5' } })
      res.body = body
      body.headers.delete('Content-Length')
      res.body = body
      assert.equal(res.length, undefined)
    })

    it('preserves an explicit override after the source Response removes its length', () => {
      const res = response()
      const body = new Response('hello', { headers: { 'Content-Length': '5' } })
      res.body = body
      res.set('content-LENGTH', '5')
      body.headers.delete('Content-Length')
      res.body = body
      assert.equal(res.length, 5)
    })

    it('preserves an explicit override when the same Response still has a length', () => {
      const res = response()
      const body = new Response('hello', { headers: { 'Content-Length': '3' } })
      res.body = body
      res.length = 5
      res.body = body
      assert.equal(res.length, 5)
    })

    it('clears an explicit override on reassignment when Transfer-Encoding is set', () => {
      const res = response()
      const body = new Response(null, { headers: { 'Content-Length': '0' } })
      res.body = body
      res.length = 0
      res.res.setHeader('Transfer-Encoding', 'chunked')
      res.body = body
      assert.equal(res.has('Content-Length'), false)
    })

    it('clears Content-Length on known-length body assignment with raw Transfer-Encoding', () => {
      for (const body of ['', 'hello', Buffer.alloc(0), Buffer.from('hello'), new Blob(), new Blob(['hello'])]) {
        const res = response()
        res.body = 'previous'
        res.res.setHeader('Transfer-Encoding', 'chunked')
        res.body = body
        assert.equal(res.has('Content-Length'), false)
        assert.equal(res.get('Transfer-Encoding'), 'chunked')
      }
    })

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
    it('clears stale lengths on replacement and preserves explicit lengths on reassignment', () => {
      for (const body of [new Blob(['hello']).stream(), new Response('hello')]) {
        const res = response()
        res.body = 'ok'
        res.body = body
        assert.equal(res.length, undefined)
        res.length = 5
        res.body = body
        assert.equal(res.length, 5)
      }
    })

    it('returns undefined for ReadableStream and Response bodies', () => {
      const res = response()
      res.body = new Blob(['hello']).stream()
      assert.strictEqual(res.length, undefined)
      res.body = new Response('hello')
      assert.strictEqual(res.length, undefined)
    })

    describe('and a .body is set', () => {
      it('should return a number', () => {
        const res = response()

        res.body = null
        assert.strictEqual(res.length, undefined)

        res.body = 'foo'
        res.remove('Content-Length')
        assert.strictEqual(res.length, 3)

        res.body = 'foo'
        assert.strictEqual(res.length, 3)

        res.body = Buffer.from('foo bar')
        res.remove('Content-Length')
        assert.strictEqual(res.length, 7)

        res.body = Buffer.from('foo bar')
        assert.strictEqual(res.length, 7)

        res.body = { hello: 'world' }
        res.remove('Content-Length')
        assert.strictEqual(res.length, 17)

        res.body = { hello: 'world' }
        assert.strictEqual(res.length, 17)

        res.body = fs.createReadStream('package.json')
        assert.strictEqual(res.length, undefined)

        res.body = null
        assert.strictEqual(res.length, undefined)
      })
    })

    describe('and .body is not', () => {
      it('should return undefined', () => {
        const res = response()
        assert.strictEqual(res.length, undefined)
      })
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
