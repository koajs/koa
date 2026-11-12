'use strict'

const { runInNewContext } = require('node:vm')

function foreignReadableStream () {
  const ForeignStream = runInNewContext('(class ReadableStream {})')
  const descriptors = Object.getOwnPropertyDescriptors(ReadableStream.prototype)
  delete descriptors.constructor
  Object.defineProperties(ForeignStream.prototype, descriptors)
  const chunk = Buffer.from('hello')
  const source = {
    start (controller) {
      controller.enqueue(chunk)
      controller.close()
    }
  }
  const body = Reflect.construct(ReadableStream, [source], ForeignStream)
  return body
}

async function withForeignResponseConstructor (run) {
  const NativeResponse = globalThis.Response
  const context = { NativeResponse }
  const ForeignResponse = runInNewContext('(class Response extends NativeResponse {})', context)
  globalThis.Response = ForeignResponse
  try {
    await run(NativeResponse)
  } finally {
    globalThis.Response = NativeResponse
  }
}

module.exports = { foreignReadableStream, withForeignResponseConstructor }
