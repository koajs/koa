
'use strict'

const response = require('../../test-helpers/context').response
const assert = require('assert')
const fs = require('fs')

describe('res.length', () => {
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
