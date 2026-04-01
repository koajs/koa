'use strict'

const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const Stream = require('stream')
const Koa = require('../..')
const Request = require('../../test-helpers/context').request

describe('req.ip with port in X-Forwarded-For', () => {
  describe('when XFF contains IPv4 with port', () => {
    it('should strip the port', () => {
      const req = request()
      req.app.proxy = true
      req.header['x-forwarded-for'] = '1.2.3.4:8080, 5.6.7.8'
      assert.strictEqual(req.ip, '1.2.3.4')
    })
  })

  describe('when XFF contains IPv6 with port', () => {
    it('should strip the port and brackets', () => {
      const req = request()
      req.app.proxy = true
      req.header['x-forwarded-for'] = '[::1]:8080, 127.0.0.1'
      assert.strictEqual(req.ip, '::1')
    })
  })

  describe('when XFF contains plain IPv4 (no port)', () => {
    it('should return the address as-is', () => {
      const req = request()
      req.app.proxy = true
      req.header['x-forwarded-for'] = '1.2.3.4, 5.6.7.8'
      assert.strictEqual(req.ip, '1.2.3.4')
    })
  })

  describe('when XFF contains plain IPv6 (no port)', () => {
    it('should return the address as-is', () => {
      const req = request()
      req.app.proxy = true
      req.header['x-forwarded-for'] = '::1, 127.0.0.1'
      assert.strictEqual(req.ip, '::1')
    })
  })
})