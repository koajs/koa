'use strict'

function isResponse (body) {
  const hasResponseConstructor = typeof Response === 'function'
  if (!hasResponseConstructor) return false
  const isNativeResponse = body instanceof Response
  if (isNativeResponse) return true

  try {
    const tag = Object.prototype.toString.call(body)
    if (tag !== '[object Response]') return false
    const status = Reflect.get(Response.prototype, 'status', body)
    const hasResponseState = Number.isInteger(status)
    return hasResponseState
  } catch {
    return false
  }
}

function isReadableStream (body) {
  const hasStreamConstructor = typeof ReadableStream === 'function'
  if (!hasStreamConstructor) return false
  const isNativeStream = body instanceof ReadableStream
  if (isNativeStream) return true

  try {
    const tag = Object.prototype.toString.call(body)
    if (tag !== '[object ReadableStream]') return false
    const locked = Reflect.get(ReadableStream.prototype, 'locked', body)
    const hasStreamState = typeof locked === 'boolean'
    return hasStreamState
  } catch {
    return false
  }
}

module.exports = { isReadableStream, isResponse }
