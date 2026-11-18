'use strict'

const { describe, it } = require('node:test')
const context = require('../../test-helpers/context')
const assert = require('node:assert/strict')

describe('ctx.type=', () => {
  describe('with a mime', () => {
    it('should set the Content-Type', () => {
      const ctx = context()
      ctx.type = 'text/plain'
      assert.strictEqual(ctx.type, 'text/plain')
      assert.strictEqual(ctx.response.header['content-type'], 'text/plain; charset=utf-8')
    })
  })

  describe('with an extension', () => {
    it('should lookup the mime', () => {
      const ctx = context()
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.header['content-type'], 'application/json; charset=utf-8')
    })
  })

  describe('without a charset', () => {
    it('should default the charset', () => {
      const ctx = context()
      ctx.type = 'text/html'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=utf-8')
    })
  })

  describe('with a charset', () => {
    it('should not default the charset', () => {
      const ctx = context()
      ctx.type = 'text/html; charset=foo'
      assert.strictEqual(ctx.type, 'text/html')
      assert.strictEqual(ctx.response.header['content-type'], 'text/html; charset=foo')
    })
  })

  describe('with an unknown extension', () => {
    it('should not set a content-type', () => {
      const ctx = context()
      ctx.type = 'asdf'
      assert(!ctx.type)
      assert(!ctx.response.header['content-type'])
    })
  })
})

describe('ctx.type', () => {
  describe('with no Content-Type', () => {
    it('should return ""', () => {
      const ctx = context()
      assert(!ctx.type)
    })
  })

  describe('with a Content-Type', () => {
    it('should return the mime', () => {
      const ctx = context()
      ctx.type = 'json'
      assert.strictEqual(ctx.type, 'application/json')
    })

    it('should lowercase the mime without changing the header', () => {
      const ctx = context()
      const type = 'Application/JSON; charset=UTF-8; profile="Example"'
      ctx.set('Content-Type', type)
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.get('Content-Type'), type)
    })

    it('should trim optional whitespace before parameters', () => {
      const ctx = context()
      const type = 'application/json \t; charset=utf-8'
      ctx.set('Content-Type', type)
      assert.strictEqual(ctx.type, 'application/json')
      assert.strictEqual(ctx.response.get('Content-Type'), type)
    })
  })

  describe('when setting to +json content type', () => {
    it('should set the content type to json', () => {
      const ctx = context()
      ctx.type = 'application/vnd.myapi.v1+json'
      assert.strictEqual(ctx.type, 'application/vnd.myapi.v1+json')
    })
  })
})
