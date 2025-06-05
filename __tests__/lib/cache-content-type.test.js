const { describe, it, afterEach } = require('node:test')
const assert = require('node:assert')

const mimeTypes = require('mime-types')
const mm = require('mm')

const getType = require('../../lib/cache-content-type')

describe('cache-content-type', () => {
  afterEach(mm.restore)

  it('should work with cache', () => {
    assert.strictEqual(getType('html'), 'text/html; charset=utf-8')
    mm.syncError(mimeTypes, 'contentType', 'mock error')
    assert.strictEqual(getType('html'), 'text/html; charset=utf-8')
  })

  it('should return false when type not exists', () => {
    assert.strictEqual(getType('html-not-exists'), false)
    mm.syncError(mimeTypes, 'contentType', 'mock error')
    assert.throws(() => getType('html-not-exists'), /mock error/)
  })
})
