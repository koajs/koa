'use strict'

const assert = require('node:assert/strict')
const path = require('node:path')
const { once } = require('node:events')
const { execFile } = require('node:child_process')
const { Agent, createServer, get } = require('node:http')
const { promisify } = require('node:util')
const { json, text } = require('node:stream/consumers')
const { pipeline } = require('node:stream/promises')
const { setTimeout: delay } = require('node:timers/promises')
const profiles = require('../bench/index.json')
const { errors } = require('../bench/constants')
const settings = process.env.GITHUB_EVENT_NAME === 'pull_request' ? profiles.pullRequest : profiles.full
const run = promisify(execFile)

async function measure (Bench, count, rate, send) {
  const { connections: threshold } = settings
  const bench = new Bench({
    concurrency: 'task', threshold, time: 0, iterations: count, warmup: false, throws: true
  })
  let scheduled = 0
  let start
  let end
  bench.add('request', async () => {
    const due = rate ? start + scheduled * 1000 / rate : performance.now()
    if (rate) scheduled++
    const wait = Math.ceil(due - performance.now())
    if (wait > 0) await delay(wait)
    await send()
    end = performance.now()
    const overriddenDuration = Math.max(0, end - due)
    const timing = { overriddenDuration }
    return timing
  }, { async: true, beforeAll () { start = performance.now() } })
  await bench.run()
  const { latency } = bench.tasks[0].result
  assert.equal(latency.samplesCount, count)
  const elapsedMs = end - start
  const measurement = { latency, count, elapsedMs }
  return measurement
}

async function phases (send, maxRequestsPerPhase = Infinity) {
  const { Bench } = await import('tinybench')
  const warmupRequests = Math.min(settings.warmupRequests, maxRequestsPerPhase)
  const latencyRequests = Math.min(settings.latencyRequests, maxRequestsPerPhase)
  const capacityRequests = Math.min(settings.capacityRequests, maxRequestsPerPhase)
  await measure(Bench, warmupRequests, settings.requestsPerSecond, send)
  const paced = await measure(Bench, latencyRequests, settings.requestsPerSecond, send)
  await measure(Bench, warmupRequests, 0, send)
  const capacity = await measure(Bench, capacityRequests, 0, send)
  const { p99: p99Ms } = paced.latency
  const requestsPerSec = capacity.count * 1000 / capacity.elapsedMs
  const metrics = { p99Ms, requestsPerSec }
  const result = { metrics, paced, capacity }
  return result
}

async function headClient (url, { length, maxRequestsPerPhase }) {
  const { connections: maxSockets } = settings
  const agent = new Agent({ keepAlive: true, maxSockets })
  const send = async () => {
    const request = get(url, { method: 'HEAD', agent })
    const [response] = await once(request, 'response')
    assert.equal(await text(response), '')
    assert.equal(response.statusCode, 200)
    assert.equal(response.headers['content-length'], String(length))
    const { reusedSocket } = request
    return reusedSocket
  }
  try {
    await send()
    assert.ok(await send(), errors.headSocket)
    const result = await phases(send, maxRequestsPerPhase)
    return result
  } finally {
    agent.destroy()
  }
}

function client (url, request) {
  const { init, body, maxRequestsPerPhase } = request
  if (init?.method === 'HEAD') {
    const result = headClient(url, request)
    return result
  }
  const send = async () => {
    const response = await fetch(url, init)
    assert.equal(response.status, 200)
    assert.equal(await response.text(), body)
  }
  const result = phases(send, maxRequestsPerPhase)
  return result
}

async function runLoadGenerator (origin, input) {
  const execution = run(process.execPath, [__filename, origin], { timeout: 120000 })
  const writeInput = pipeline([input], execution.child.stdin)
  const [child, stdin] = await Promise.allSettled([execution, writeInput])
  if (child.status === 'rejected') throw child.reason
  if (stdin.status === 'rejected') throw stdin.reason
  const result = JSON.parse(child.value.stdout)
  return result
}

async function http (root, endpoint, parameters, maxRequestsPerPhase = parameters.maxRequestsPerPhase) {
  const Koa = require(path.join(root, 'lib/application.js'))
  const app = new Koa()
  const request = endpoint(app, parameters)
  const server = createServer({ rejectNonStandardBodyWrites: true }, app.callback())
  app.on('error', (error, ctx) => {
    if (error.code === 'ERR_HTTP_BODY_NOT_ALLOWED') ctx.res.destroy(error)
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  try {
    const origin = 'http://127.0.0.1:' + server.address().port
    const input = JSON.stringify(Object.assign({}, request, { maxRequestsPerPhase }))
    const result = await runLoadGenerator(origin, input)
    const peakRssMiB = process.resourceUsage().maxRSS / 1024
    const measurement = Object.assign(result, { peakRssMiB })
    return measurement
  } finally {
    await promisify(server.close).call(server)
  }
}

async function runClient () {
  const [, , url, specification] = process.argv
  const fromStdin = specification === undefined
  const request = fromStdin ? await json(process.stdin) : JSON.parse(specification)
  const target = fromStdin ? url + request.route : url
  const measurement = client(target, request)
  return measurement
}

if (require.main === module) {
  runClient().then(result => {
    process.stdout.write(JSON.stringify(result))
  }).catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}

module.exports = http
module.exports.settings = settings
