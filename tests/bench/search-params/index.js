'use strict'

const assert = require('node:assert/strict')
const { isDeepStrictEqual } = require('node:util')
const { FixtureMismatch, errors } = require('../constants')

function queryInput (size, kind) {
  assert.ok(Number.isSafeInteger(size) && size > 0, errors.querySize)
  assert.ok(['repeated', 'distinct'].includes(kind), errors.queryKind)
  const values = Array.from({ length: size }, (_, i) => String(i))
  const pairs = values.map(value => [kind === 'repeated' ? 'tag' : 'key' + value, value])
  const expected = Object.fromEntries(pairs)
  const multipleTagValues = kind === 'repeated' && size > 1
  if (multipleTagValues) expected.tag = values
  const query = new URLSearchParams(pairs).toString()
  const input = { query, expected }
  return input
}

async function measure ({ parse }, { size, kind }, smokeOnly) {
  const { Bench } = await import('tinybench')
  const { query, expected } = queryInput(size, kind)
  if (!isDeepStrictEqual(parse(query), expected)) throw new FixtureMismatch('Parsed query differs from the expected result')
  const options = smokeOnly ? { time: 0, iterations: 1, warmup: false } : { time: 500, warmupTime: 200 }
  const bench = new Bench(options)
  const batchSize = Math.ceil(1024 / size)
  bench.add('parse', () => {
    const start = bench.now()
    for (let i = 0; i < batchSize; i++) parse(query)
    const elapsed = bench.now() - start
    const overriddenDuration = elapsed / batchSize
    const timing = { overriddenDuration, overriddenIterationCost: elapsed }
    return timing
  }, { async: false })
  bench.runSync()
  const { latency } = bench.tasks[0].result
  const parseUs = latency.p50 * 1000
  const metrics = { parseUs }
  const measurement = { metrics, latency, batchSize }
  return measurement
}

module.exports = { queryInput, measure }
