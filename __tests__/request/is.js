
'use strict'

const context = require('../../test-helpers/context')
const assert = require('assert')

describe('ctx.is(type)', () => {
  it('should ignore params', () => {
    const ctx = context()
    ctx.header['content-type'] = 'text/html; charset=utf-8'
    ctx.header['transfer-encoding'] = 'chunked'

    assert.strictEqual(ctx.is('text/*'), 'text/html')
  })

  describe('when no body is given', () => {
    it('should return null', () => {
      const ctx = context()

      assert.strictEqual(ctx.is(), null)
      assert.strictEqual(ctx.is('image/*'), null)
      assert.strictEqual(ctx.is('image/*', 'text/*'), null)
    })
  })

  describe('when no content type is given', () => {
    it('should return false', () => {
      const ctx = context()
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is(), false)
      assert.strictEqual(ctx.is('image/*'), false)
      assert.strictEqual(ctx.is('text/*', 'image/*'), false)
    })
  })

  describe('give no types', () => {
    it('should return the mime type', () => {
      const ctx = context()
      ctx.header['content-type'] = 'image/png'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is(), 'image/png')
    })
  })

  describe('given one type', () => {
    it('should return the type or false', () => {
      const ctx = context()
      ctx.header['content-type'] = 'image/png'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is('png'), 'png')
      assert.strictEqual(ctx.is('.png'), '.png')
      assert.strictEqual(ctx.is('image/png'), 'image/png')
      assert.strictEqual(ctx.is('image/*'), 'image/png')
      assert.strictEqual(ctx.is('*/png'), 'image/png')

      assert.strictEqual(ctx.is('jpeg'), false)
      assert.strictEqual(ctx.is('.jpeg'), false)
      assert.strictEqual(ctx.is('image/jpeg'), false)
      assert.strictEqual(ctx.is('text/*'), false)
      assert.strictEqual(ctx.is('*/jpeg'), false)
    })
  })

  describe('given multiple types', () => {
    it('should return the first match or false', () => {
      const ctx = context()
      ctx.header['content-type'] = 'image/png'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is('png'), 'png')
      assert.strictEqual(ctx.is('.png'), '.png')
      assert.strictEqual(ctx.is('text/*', 'image/*'), 'image/png')
      assert.strictEqual(ctx.is('image/*', 'text/*'), 'image/png')
      assert.strictEqual(ctx.is('image/*', 'image/png'), 'image/png')
      assert.strictEqual(ctx.is('image/png', 'image/*'), 'image/png')

      assert.strictEqual(ctx.is(['text/*', 'image/*']), 'image/png')
      assert.strictEqual(ctx.is(['image/*', 'text/*']), 'image/png')
      assert.strictEqual(ctx.is(['image/*', 'image/png']), 'image/png')
      assert.strictEqual(ctx.is(['image/png', 'image/*']), 'image/png')

      assert.strictEqual(ctx.is('jpeg'), false)
      assert.strictEqual(ctx.is('.jpeg'), false)
      assert.strictEqual(ctx.is('text/*', 'application/*'), false)
      assert.strictEqual(ctx.is('text/html', 'text/plain', 'application/json; charset=utf-8'), false)
    })
  })

  describe('when Content-Type: application/x-www-form-urlencoded', () => {
    it('should match "urlencoded"', () => {
      const ctx = context()
      ctx.header['content-type'] = 'application/x-www-form-urlencoded'
      ctx.header['transfer-encoding'] = 'chunked'

      assert.strictEqual(ctx.is('urlencoded'), 'urlencoded')
      assert.strictEqual(ctx.is('json', 'urlencoded'), 'urlencoded')
      assert.strictEqual(ctx.is('urlencoded', 'json'), 'urlencoded')
    })
  })
})
