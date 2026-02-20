'use strict'

const Stream = require('stream')

// TODO: use a third party library for this

const isStream = (stream) => {
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

/**
 * Check if `obj` is an async iterable (but not a string, Buffer, or Node.js stream).
 * This enables support for async generators and other async iterables as response bodies.
 *
 * @param {*} obj
 * @return {boolean}
 */
const isAsyncIterable = (obj) => {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj[Symbol.asyncIterator] === 'function' &&
    !isStream(obj) &&
    !(obj instanceof ReadableStream) &&
    !(obj instanceof Blob) &&
    !(obj instanceof Response)
  )
}

module.exports = isStream
module.exports.isAsyncIterable = isAsyncIterable
