'use strict'

import { describe, it } from 'node:test'
import { request } from '../../test-helpers/context.js'
import assert from 'assert'
import util from 'util'

describe('req.inspect()', () => {
  describe('with no request.req present', () => {
    it('should return null', () => {
      const req = request()
      req.method = 'GET'
      delete req.req
      assert(undefined === req.inspect())
      assert(util.inspect(req) === 'undefined')
    })
  })

  it('should return a json representation', () => {
    const req = request()
    req.method = 'GET'
    req.url = 'example.com'
    req.header.host = 'example.com'

    const expected = {
      method: 'GET',
      url: 'example.com',
      header: {
        host: 'example.com'
      }
    }

    assert.deepStrictEqual(req.inspect(), expected)
    assert.deepStrictEqual(util.inspect(req), util.inspect(expected))
  })
})
