'use strict'

const assert = require('node:assert/strict')
const path = require('node:path')
const { errors } = require('../constants')

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

async function measure (root, { size, kind }) {
  const { Bench } = await import('tinybench')
  const { parse } = require(path.join(root, 'lib/search-params.js'))
  const { query, expected } = queryInput(size, kind)
  assert.deepEqual(parse(query), expected)
  const bench = new Bench({ time: 500, warmupTime: 200 })
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
