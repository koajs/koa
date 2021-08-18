
'use strict'

const request = require('../../test-helpers/context').request
const assert = require('assert')

describe('req.host', () => {
  it('should return host with port', () => {
    const req = request()
    req.header.host = 'foo.com:3000'
    assert.strictEqual(req.host, 'foo.com:3000')
  })

  describe('with no host present', () => {
    it('should return ""', () => {
      const req = request()
      assert.strictEqual(req.host, '')
    })
  })

  describe('when less then HTTP/2', () => {
    it('should not use :authority header', () => {
      const req = request({
        httpVersionMajor: 1,
        httpVersion: '1.1'
      })
      req.header[':authority'] = 'foo.com:3000'
      req.header.host = 'bar.com:8000'
      assert.strictEqual(req.host, 'bar.com:8000')
    })
  })

  describe('when HTTP/2', () => {
    it('should use :authority header', () => {
      const req = request({
        httpVersionMajor: 2,
        httpVersion: '2.0'
      })
      req.header[':authority'] = 'foo.com:3000'
      req.header.host = 'bar.com:8000'
      assert.strictEqual(req.host, 'foo.com:3000')
    })

    it('should use host header as fallback', () => {
      const req = request({
        httpVersionMajor: 2,
        httpVersion: '2.0'
      })
      req.header.host = 'bar.com:8000'
      assert.strictEqual(req.host, 'bar.com:8000')
    })
  })

  describe('when X-Forwarded-Host is present', () => {
    describe('and proxy is not trusted', () => {
      it('should be ignored on HTTP/1', () => {
        const req = request()
        req.header['x-forwarded-host'] = 'bar.com'
        req.header.host = 'foo.com'
        assert.strictEqual(req.host, 'foo.com')
      })

      it('should be ignored on HTTP/2', () => {
        const req = request({
          httpVersionMajor: 2,
          httpVersion: '2.0'
        })
        req.header['x-forwarded-host'] = 'proxy.com:8080'
        req.header[':authority'] = 'foo.com:3000'
        req.header.host = 'bar.com:8000'
        assert.strictEqual(req.host, 'foo.com:3000')
      })
    })

    describe('and proxy is trusted', () => {
      it('should be used on HTTP/1', () => {
        const req = request()
        req.app.proxy = true
        req.header['x-forwarded-host'] = 'bar.com, baz.com'
        req.header.host = 'foo.com'
        assert.strictEqual(req.host, 'bar.com')
      })

      it('should be used on HTTP/2', () => {
        const req = request({
          httpVersionMajor: 2,
          httpVersion: '2.0'
        })
        req.app.proxy = true
        req.header['x-forwarded-host'] = 'proxy.com:8080'
        req.header[':authority'] = 'foo.com:3000'
        req.header.host = 'bar.com:8000'
        assert.strictEqual(req.host, 'proxy.com:8080')
      })
    })
  })
})
