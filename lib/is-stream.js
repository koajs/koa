'use strict'

const Stream = require('stream')

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