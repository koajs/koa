'use strict'

const Stream = require('stream')
const { ReadableStream } = require('node:stream/web')
const NativeResponse = typeof globalThis.ReadableStream === 'function' ? globalThis.Response : undefined

// TODO: use a third party library for this

module.exports = (stream) => {
  return (
    stream instanceof Stream ||
    (stream !== null &&
      typeof stream === 'object' &&
      !!stream.readable &&
      typeof stream.pipe === 'function' &&
      typeof stream.read === 'function' &&
      typeof stream.readable === 'boolean' &&
      typeof stream.readableObjectMode === 'boolean' &&
      typeof stream.destroy === 'function' &&
      typeof stream.destroyed === 'boolean')
  )
}

module.exports.isWebStream = function isWebStream (body) {
  if (!body || typeof body !== 'object') return false
  try {
    return typeof Reflect.get(ReadableStream.prototype, 'locked', body) === 'boolean'
  } catch {
    return false
  }
}

module.exports.isWebResponse = function isWebResponse (body) {
  if (!body || typeof body !== 'object') return false
  try {
    const ResponseConstructor = NativeResponse ?? globalThis.Response
    if (typeof ResponseConstructor !== 'function') return false
    const status = Reflect.get(ResponseConstructor.prototype, 'status', body)
    return Number.isInteger(status)
  } catch {
    return false
  }
}
