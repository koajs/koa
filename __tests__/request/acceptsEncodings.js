
'use strict'

const assert = require('assert')
const context = require('../../test-helpers/context')

describe('ctx.acceptsEncodings()', () => {
  describe('with no arguments', () => {
    describe('when Accept-Encoding is populated', () => {
      it('should return accepted types', () => {
        const ctx = context()
        ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2'
        assert.deepStrictEqual(ctx.acceptsEncodings(), ['gzip', 'compress', 'identity'])
        assert.strictEqual(ctx.acceptsEncodings('gzip', 'compress'), 'gzip')
      })
    })

    describe('when Accept-Encoding is not populated', () => {
      it('should return identity', () => {
        const ctx = context()
        assert.deepStrictEqual(ctx.acceptsEncodings(), ['identity'])
        assert.strictEqual(ctx.acceptsEncodings('gzip', 'deflate', 'identity'), 'identity')
      })
    })
  })

  describe('with multiple arguments', () => {
    it('should return the best fit', () => {
      const ctx = context()
      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2'
      assert.strictEqual(ctx.acceptsEncodings('compress', 'gzip'), 'gzip')
      assert.strictEqual(ctx.acceptsEncodings('gzip', 'compress'), 'gzip')
    })
  })

  describe('with an array', () => {
    it('should return the best fit', () => {
      const ctx = context()
      ctx.req.headers['accept-encoding'] = 'gzip, compress;q=0.2'
      assert.strictEqual(ctx.acceptsEncodings(['compress', 'gzip']), 'gzip')
    })
  })
})
