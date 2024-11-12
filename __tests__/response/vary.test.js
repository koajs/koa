'use strict'

import { describe, it } from 'node:test'
import assert from 'assert'
import context from '../../test-helpers/context.js'

describe('ctx.vary(field)', () => {
  describe('when Vary is not set', () => {
    it('should set it', () => {
      const ctx = context()
      ctx.vary('Accept')
      assert.strictEqual(ctx.response.header.vary, 'Accept')
    })
  })

  describe('when Vary is set', () => {
    it('should append', () => {
      const ctx = context()
      ctx.vary('Accept')
      ctx.vary('Accept-Encoding')
      assert.strictEqual(ctx.response.header.vary, 'Accept, Accept-Encoding')
    })
  })

  describe('when Vary already contains the value', () => {
    it('should not append', () => {
      const ctx = context()
      ctx.vary('Accept')
      ctx.vary('Accept-Encoding')
      ctx.vary('Accept')
      ctx.vary('Accept-Encoding')
      assert.strictEqual(ctx.response.header.vary, 'Accept, Accept-Encoding')
    })
  })
})
