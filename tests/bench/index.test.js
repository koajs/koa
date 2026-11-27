'use strict'

const assert = require('node:assert/strict')
const { it } = require('node:test')
const { calibrate, compareAttempts, render } = require('./index')

function p99Pair (headMs) {
  const base = { p99Ms: 100 }
  const head = { p99Ms: headMs }
  const p99Ms = Math.log(headMs / 100)
  const changes = { p99Ms }
  const pair = { base, head, changes }
  return pair
}

it('includes noisy controls in the limit once three quiet controls are available', () => {
  const ratios = [1.296, 1 / 1.594, 1.101, 1.01, 1.02]
  const controls = ratios.map(Math.log).map(p99Ms => ({ p99Ms }))
  const tolerance = calibrate(['p99Ms'], round => controls[round - 1])
  assert.equal(tolerance.p99Ms, Math.abs(Math.log(ratios[1])))
  const withinNoise = compareAttempts(tolerance, () => p99Pair(150))
  assert.equal(withinNoise.verdict.p99Ms, 'pass')
  const regression = compareAttempts(tolerance, () => p99Pair(170))
  assert.equal(regression.verdict.p99Ms, 'fail')
  assert.deepEqual(regression.votes.p99Ms, [true, true])
})

it('reports inconclusive when fewer than three controls are quiet', () => {
  const quiet = { p99Ms: 0 }
  const p99Ms = Math.log(1.5)
  const noisy = { p99Ms }
  const tolerance = calibrate(['p99Ms'], round => round <= 2 ? quiet : noisy)
  assert.equal(tolerance.p99Ms, null)
  const result = compareAttempts(tolerance, () => p99Pair(180))
  assert.equal(result.verdict.p99Ms, 'inconclusive')
})

it('renders both order deltas and compares the mean candidate with the release', () => {
  const tolerance = { p99Ms: 0 }
  const orders = [p99Pair(90), p99Pair(130)]
  const result = compareAttempts(tolerance, round => orders[round - 1])
  const [attempt] = result.attempts
  assert.equal(attempt.base.p99Ms, 100)
  assert.equal(attempt.head.p99Ms, 110)
  assert.deepEqual(attempt.orders, orders)
  assert.deepEqual(result.votes.p99Ms, [false])
  const parameters = { depth: 0 }
  const workload = { name: 'application', parameters }
  const metrics = { p99Ms: 100 }
  const release = { version: '3.3.0', metrics }
  const entry = Object.assign({ workload, tolerance, release }, result)
  const summary = render({}, [entry])
  assert.ok(summary.includes('| 100 | 100 | 110 | -10% / +30% | +10% | 0% | 1 | pass |'))
  entry.release = { version: '3.3.0', error: 'unsupported fixture' }
  assert.ok(render({}, [entry]).includes('| unavailable | 100 | 110 | -10% / +30% | unavailable | 0% | 1 | pass |'))
})
