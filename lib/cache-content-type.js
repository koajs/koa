'use strict'

const mimeTypes = require('mime-types')
const { LRU } = require('ylru')

const typeLRUCache = new LRU(100)

module.exports = (type) => {
  let mimeType = typeLRUCache.get(type)
  if (!mimeType) {
    mimeType = mimeTypes.contentType(type)
    typeLRUCache.set(type, mimeType)
  }
  return mimeType
}
