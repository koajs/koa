'use strict'

const assert = require('node:assert/strict')
const { once } = require('node:events')
const { Agent, createServer, IncomingMessage, request, ServerResponse } = require('node:http')
const { Duplex } = require('node:stream')
const { text } = require('node:stream/consumers')
const { setImmediate } = require('node:timers/promises')
const profiles = require('../bench/index.json')
const { FixtureMismatch } = require('../bench/constants')
const prProfile = ['pull_request', 'workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME)
const settings = prProfile ? profiles.pullRequest : profiles.full

function check (fixture, status, body, headers) {
  try {
    assert.equal(status, fixture.status ?? 200)
    assert.equal(body, fixture.body)
    if (fixture.length !== undefined) assert.equal(String(headers['content-length']), String(fixture.length))
    for (const [key, value] of Object.entries(fixture.headers ?? {})) assert.deepEqual(headers[key], value)
  } catch (error) {
    if (!(error instanceof assert.AssertionError)) throw error
    throw new FixtureMismatch(error.message, { cause: error })
  }
}

async function smokeRequest (url, fixture, agent) {
  const signal = AbortSignal.timeout(5000)
  const options = Object.assign(requestOptions(fixture), { agent, signal })
  const req = request(url, options)
  req.end(fixture.init?.body)
  const [res] = await once(req, 'response')
  check(fixture, res.statusCode, await text(res), res.headers)
  return req.reusedSocket
}

async function smoke (callback, fixture) {
  const server = createServer({ rejectNonStandardBodyWrites: true }, callback)
  const agent = new Agent({ keepAlive: true, maxSockets: 1, timeout: 5000 })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  try {
    const url = 'http://127.0.0.1:' + server.address().port + fixture.route
    await smokeRequest(url, fixture, agent)
    if (fixture.init?.method === 'HEAD') assert.ok(await smokeRequest(url, fixture, agent))
  } finally {
    agent.destroy()
    await new Promise(resolve => server.close(resolve))
  }
}

function requestOptions ({ init = {} }) {
  const method = init.method ?? 'GET'
  const headers = { host: 'localhost', connection: 'keep-alive' }
  for (const [key, value] of Object.entries(init.headers ?? {})) headers[key.toLowerCase()] = value
  const hasBody = init.body !== undefined || ['POST', 'PUT', 'PATCH'].includes(method)
  if (hasBody && headers['content-length'] === undefined && headers['transfer-encoding'] === undefined) {
    headers['content-length'] = String(Buffer.byteLength(init.body ?? ''))
  }
  return { method, headers }
}

class Response extends ServerResponse {
  chunks = []

  write (chunk, encoding, callback) {
    this.capture(chunk, encoding)
    return super.write(chunk, encoding, callback)
  }

  end (chunk, encoding, callback) {
    if (chunk != null && typeof chunk !== 'function') this.capture(chunk, encoding)
    return super.end(chunk, encoding, callback)
  }

  capture (chunk, encoding) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined)
    this.chunks.push(bytes)
  }
}

function exchange ({ route, init = {} }, options) {
  const socket = new Duplex({ read () {}, write (chunk, encoding, done) { done() } })
  socket.remoteAddress = '127.0.0.1'
  const req = new IncomingMessage(socket)
  req.httpVersion = '1.1'
  req.httpVersionMajor = 1
  req.httpVersionMinor = 1
  req.method = options.method
  req.url = route
  req.headers = Object.assign({}, options.headers)
  req.rawHeaders = Object.entries(req.headers).flat()
  if (init.body) req.push(Buffer.from(init.body))
  req.push(null)
  req.complete = true
  const res = new Response(req, { rejectNonStandardBodyWrites: true })
  res.assignSocket(socket)
  return { req, res }
}

const singleValueHeaders = new Set([
  'age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from',
  'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location',
  'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'server', 'user-agent'
])

function wireHeaders (headers) {
  const normalized = {}
  for (const [name, value] of Object.entries(headers)) {
    const values = Array.isArray(value) ? value : [value]
    if (!values.length) continue
    const strings = values.map(value => String(value).replace(/^[ \t]+|[ \t]+$/g, ''))
    if (name === 'set-cookie') normalized[name] = strings
    else if (singleValueHeaders.has(name)) normalized[name] = strings[0]
    else normalized[name] = strings.join(name === 'cookie' ? '; ' : ', ')
  }
  return normalized
}

async function batch (callback, fixture, count) {
  const options = requestOptions(fixture)
  const exchanges = Array.from({ length: count }, () => exchange(fixture, options))
  const elapsed = await timeRequests(callback, exchanges)
  for (const { res } of exchanges) {
    assert.ok(res.finished)
    const body = Buffer.concat(res.chunks).toString()
    check(fixture, res.statusCode, body, wireHeaders(res.getHeaders()))
  }
  await setImmediate()
  const requestUs = 1000 * elapsed / count
  return requestUs
}

async function timeRequests (callback, exchanges) {
  let timer
  const timeout = new Promise((resolve, reject) => {
    const error = Object.assign(new Error('Benchmark response did not finish'), { code: 'ERR_BENCH_TIMEOUT' })
    timer = setTimeout(() => reject(error), 5000)
  })
  const send = async () => {
    const start = performance.now()
    for (const { req, res } of exchanges) {
      timer.refresh()
      const finish = once(res, 'finish')
      await Promise.all([finish, callback(req, res)])
    }
    return performance.now() - start
  }
  try {
    return await Promise.race([send(), timeout])
  } finally {
    clearTimeout(timer)
  }
}

async function batches (callback, fixture, duration) {
  const samples = []
  const until = performance.now() + duration
  do {
    samples.push(await batch(callback, fixture, 64))
  } while (performance.now() < until)
  return samples
}

async function http (Koa, endpoint, parameters, smokeOnly) {
  const app = new Koa()
  const fixture = endpoint(app, parameters)
  const callback = app.callback()
  if (smokeOnly) {
    await smoke(callback, fixture)
    const requestUs = await batch(callback, fixture, 1)
    const metrics = { requestUs }
    return { metrics }
  }
  await batches(callback, fixture, settings.warmupMs)
  const samples = await batches(callback, fixture, settings.sampleMs)
  const sorted = samples.sort((a, b) => a - b)
  const lower = sorted[Math.floor((sorted.length - 1) / 2)]
  const upper = sorted[Math.floor(sorted.length / 2)]
  const requestUs = (lower + upper) / 2
  const metrics = { requestUs }
  const peakRssMiB = process.resourceUsage().maxRSS / 1024
  return { metrics, batches: samples.length, peakRssMiB }
}

module.exports = http
module.exports.settings = settings
