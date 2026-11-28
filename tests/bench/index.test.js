'use strict'

const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { spawnSync } = require('node:child_process')
const { it } = require('node:test')
const { calibrate, compareAttempts, render, evidence, profiles } = require('./index')
const supportsBenchmarkRuntime = Number(process.versions.node.split('.')[0]) >= 20

function temporaryDirectory (run) {
  const output = path.resolve(__dirname, '../../coverage')
  fs.mkdirSync(output, { recursive: true })
  const directory = fs.mkdtempSync(path.join(output, 'bench-test-'))
  try {
    const result = run(directory)
    return result
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
}

function reportEntries (p99Ms = 'pass') {
  const names = ['application', 'request', 'response', 'search-params']
  const entries = names.flatMap(name => {
    const parameters = require('./' + name + '/index.json')
    const verdict = name === 'search-params' ? { parseUs: 'pass' } : { p99Ms, requestsPerSec: 'pass' }
    const group = parameters.map(parameters => ({ workload: { name, parameters }, verdict: { ...verdict } }))
    return group
  })
  return entries
}

function checkReport (report) {
  const result = temporaryDirectory(directory => {
    const names = new Set(report.map(entry => entry.workload.name))
    names.forEach(name => {
      const run = path.join(directory, 'run-' + name)
      fs.mkdirSync(run)
      const entries = report.filter(entry => entry.workload.name === name)
      fs.writeFileSync(path.join(run, 'report.json'), JSON.stringify(entries))
    })
    const executable = path.join(__dirname, 'index.js')
    const result = spawnSync(process.execPath, [executable, '--check', directory], { encoding: 'utf8' })
    return result
  })
  return result
}

it('defers inconclusive component evidence without accepting confirmed regressions', () => {
  const noisy = { p99Ms: { pass: 0, fail: 0, inconclusive: 3 } }
  assert.equal(evidence(noisy, false)[0].failed, false)
  assert.equal(evidence(noisy)[0].failed, true)
  const regression = { p99Ms: { pass: 1, fail: 1, inconclusive: 1 } }
  assert.equal(evidence(regression, false)[0].failed, true)
})

it('checks conclusive evidence across the complete benchmark suite', () => {
  const report = reportEntries()
  report.slice(0, 3).forEach(entry => { entry.verdict.p99Ms = 'inconclusive' })
  const accepted = checkReport(report)
  assert.equal(accepted.status, 0, accepted.stderr)
  const noisy = checkReport(reportEntries('inconclusive'))
  assert.equal(noisy.status, 1)
  assert.match(noisy.stdout, /Insufficient evidence/)
  report[1].verdict.requestsPerSec = 'fail'
  const regression = checkReport(report)
  assert.equal(regression.status, 1)
  assert.match(regression.stdout, /1 failed/)
})

it('rejects missing or duplicate benchmark workload reports', () => {
  const report = reportEntries()
  for (const entries of [report.slice(1), report.concat(report[0])]) {
    const rejected = checkReport(entries)
    assert.equal(rejected.status, 1)
    assert.match(rejected.stderr, /Missing or duplicate benchmark workloads/)
  }
})

it('rejects benchmark reports with absent or invalid verdicts', () => {
  const report = reportEntries()
  report[0].verdict = {}
  const missing = checkReport(report)
  assert.equal(missing.status, 1)
  assert.match(missing.stderr, /Missing benchmark verdicts/)
  report[0].verdict = { p99Ms: 'unknown', requestsPerSec: 'pass' }
  const invalid = checkReport(report)
  assert.equal(invalid.status, 1)
  assert.match(invalid.stderr, /Invalid benchmark verdict/)
})

it('writes usable CPU profiles for both revisions', { skip: !supportsBenchmarkRuntime }, () => {
  temporaryDirectory(directory => {
    const root = path.resolve(__dirname, '../..')
    const roots = { base: root, head: root }
    const workload = { name: 'search-params', parameters: { size: 8, kind: 'distinct' } }
    profiles(roots, workload, directory, 0)
    for (const side of ['base', 'head']) {
      const filename = path.join(directory, 'search-params-0-' + side + '.cpuprofile')
      const profile = JSON.parse(fs.readFileSync(filename, 'utf8'))
      assert.ok(profile.nodes.length > 0)
      assert.ok(profile.samples.length > 0)
      assert.ok(profile.endTime > profile.startTime)
    }
  })
})

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
