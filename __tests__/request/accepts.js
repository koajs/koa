
'use strict'

const assert = require('assert')
const context = require('../../test-helpers/context')

describe('ctx.accepts(types)', () => {
  describe('with no arguments', () => {
    describe('when Accept is populated', () => {
      it('should return all accepted types', () => {
        const ctx = context()
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain'
        assert.deepStrictEqual(ctx.accepts(), ['text/html', 'text/plain', 'image/jpeg', 'application/*'])
      })
    })
  })

  describe('with no valid types', () => {
    describe('when Accept is populated', () => {
      it('should return false', () => {
        const ctx = context()
        ctx.req.headers.accept = 'application/*;q=0.2, image/jpeg;q=0.8, text/html, text/plain'
        assert.strictEqual(ctx.accepts('image/png', 'image/tiff'), false)
      })
    })

    describe('when Accept is not populated', () => {
      it('should return the first type', () => {
        const ctx = context()
        assert.strictEqual(ctx.accepts('text/html', 'text/plain', 'image/jpeg', 'application/*'), 'text/html')
      })
    })
  })

  describe('when extensions are given', () => {
    it('should convert to mime types', () => {
      const ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts('html'), 'html')
      assert.strictEqual(ctx.accepts('.html'), '.html')
      assert.strictEqual(ctx.accepts('txt'), 'txt')
      assert.strictEqual(ctx.accepts('.txt'), '.txt')
      assert.strictEqual(ctx.accepts('png'), false)
    })
  })

  describe('when an array is given', () => {
    it('should return the first match', () => {
      const ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts(['png', 'text', 'html']), 'text')
      assert.strictEqual(ctx.accepts(['png', 'html']), 'html')
    })
  })

  describe('when multiple arguments are given', () => {
    it('should return the first match', () => {
      const ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts('png', 'text', 'html'), 'text')
      assert.strictEqual(ctx.accepts('png', 'html'), 'html')
    })
  })

  describe('when value present in Accept is an exact match', () => {
    it('should return the type', () => {
      const ctx = context()
      ctx.req.headers.accept = 'text/plain, text/html'
      assert.strictEqual(ctx.accepts('text/html'), 'text/html')
      assert.strictEqual(ctx.accepts('text/plain'), 'text/plain')
    })
  })

  describe('when value present in Accept is a type match', () => {
    it('should return the type', () => {
      const ctx = context()
      ctx.req.headers.accept = 'application/json, */*'
      assert.strictEqual(ctx.accepts('text/html'), 'text/html')
      assert.strictEqual(ctx.accepts('text/plain'), 'text/plain')
      assert.strictEqual(ctx.accepts('image/png'), 'image/png')
    })
  })

  describe('when value present in Accept is a subtype match', () => {
    it('should return the type', () => {
      const ctx = context()
      ctx.req.headers.accept = 'application/json, text/*'
      assert.strictEqual(ctx.accepts('text/html'), 'text/html')
      assert.strictEqual(ctx.accepts('text/plain'), 'text/plain')
      assert.strictEqual(ctx.accepts('image/png'), false)
      assert.strictEqual(ctx.accepts('png'), false)
    })
  })
})
