'use strict'

const path = require('node:path')
const http = require('../utils/http')
const os = require('node:os')
const { execFileSync } = require('node:child_process')
const { json } = require('node:stream/consumers')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { metrics, memoryLabel, labels, columns, notes, messages, errors } = require('./constants')
const components = ['application', 'request', 'response', 'search-params']

function workloads () {
  const inputs = components.map(name => [name, require('./' + name + '/index.json')])
  const config = Object.fromEntries(inputs)
  config.http = require('./index.json')
  const Ajv = require('ajv')
  const validate = new Ajv().compile(require('./index.schema.json'))
  if (!validate(config)) throw new Error(errors.configuration(JSON.stringify(validate.errors)))
  const group = ([name, parameters]) => parameters.map(input => ({ name, parameters: input }))
  const selected = inputs.flatMap(group)
  return selected
}

function sample (revision, { name, parameters }, maxRequestsPerPhase) {
  if (!components.includes(name)) throw new Error(errors.benchmark(name))
  const fixture = require('./' + name + '/index.js')
  const measurement = name === 'search-params'
    ? fixture.measure(revision, parameters)
    : http(revision, fixture, parameters, maxRequestsPerPhase)
  return measurement
}

async function smoke () {
  for (const workload of workloads()) {
    const result = await sample(process.cwd(), workload, 1)
    validateMetrics(workload.name, result.metrics)
  }
}

async function run () {
  const [, , mode, root, specification] = process.argv
  if (mode === '--check') {
    checkReports(root)
    return
  }
  if (mode === '--smoke') {
    await smoke()
    return
  }
  if (mode !== '--sample') {
    main()
    return
  }
  const workload = specification === undefined ? await json(process.stdin) : JSON.parse(specification)
  const result = await sample(path.resolve(root), workload)
  process.stdout.write(JSON.stringify(result))
}

const format = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 })

function number (value) {
  assert.ok(Number.isFinite(value))
  const formatted = format.format(value)
  return formatted
}

function label ({ name, parameters }) {
  if (name === 'application') {
    const depth = labels.application(number(parameters.depth))
    return depth
  }
  if (name === 'response') {
    if (parameters.headItems) {
      const head = labels.head(number(parameters.headItems))
      return head
    }
    const bytes = Buffer.byteLength(JSON.stringify(parameters.payload))
    const json = labels.json(bytes)
    return json
  }
  assert.ok(['request', 'search-params'].includes(name))
  assert.ok(['distinct', 'repeated'].includes(parameters.kind))
  const query = labels.query(name, number(parameters.size), parameters.kind)
  return query
}

function mean (first, second) {
  const average = (first + second) / 2
  return average
}

function difference (baseline, candidate) {
  const change = 100 * (candidate / baseline - 1)
  const sign = change > 0 ? '+' : ''
  const percent = `${sign}${number(change)}%`
  return percent
}

function comparisonValues (base, head, release, delta = difference(base, head)) {
  const values = [number(base), number(head), delta]
  if (release === undefined) return values
  if (release === null) {
    const unavailable = [labels.unavailable].concat(values, labels.unavailable)
    return unavailable
  }
  const withRelease = [number(release)].concat(values, difference(release, head))
  return withRelease
}

function tableRow (cells) {
  const row = `| ${cells.join(' | ')} |`
  return row
}

function metricRow (entry, name, [key, verdict]) {
  assert.ok(Object.hasOwn(metrics, key) && ['pass', 'fail', 'inconclusive'].includes(verdict))
  const rounds = entry.votes[key].length || 1
  assert.ok(Number.isInteger(rounds) && rounds >= 1 && rounds <= 3)
  const { base, head, orders } = entry.attempts[rounds - 1]
  const delta = orders?.map(pair => difference(pair.base[key], pair.head[key])).join(' / ')
  const baseValue = orders ? mean(orders[0].base[key], orders[1].base[key]) : base[key]
  const headValue = orders ? mean(orders[0].head[key], orders[1].head[key]) : head[key]
  const release = entry.release?.error ? null : entry.release?.metrics[key]
  const values = comparisonValues(baseValue, headValue, release, delta)
  const direction = key === 'requestsPerSec' ? -1 : 1
  const limit = verdict === 'inconclusive' ? labels.unstable : number(100 * Math.expm1(direction * entry.tolerance[key])) + '%'
  const cells = [name, metrics[key]].concat(values, limit, rounds, verdict)
  const row = tableRow(cells)
  return row
}

function rows (entry) {
  const name = label(entry.workload)
  const measurements = Object.entries(entry.verdict).map(metric => metricRow(entry, name, metric))
  if (!entry.peakRssMiB) return measurements
  const { base, head, release } = entry.peakRssMiB
  const releasePeak = entry.release ? release ?? null : undefined
  const values = comparisonValues(base, head, releasePeak)
  const cells = [name, memoryLabel].concat(values, labels.memoryResult)
  const withMemory = measurements.concat(tableRow(cells))
  return withMemory
}

function metricCounts (report) {
  const counts = {}
  const verdicts = report.flatMap(entry => Object.entries(entry.verdict))
  for (const [key, status] of verdicts) {
    counts[key] ??= { pass: 0, fail: 0, inconclusive: 0 }
    counts[key][status]++
  }
  return counts
}

function evidence (counts, requireConclusive = true) {
  const results = Object.entries(counts).map(([key, totals]) => {
    const { pass, fail, inconclusive } = totals
    const conclusive = pass + fail
    const total = conclusive + inconclusive
    const status = conclusive ? metrics[key] : messages.insufficient(metrics[key])
    const message = messages.evidence(status, conclusive, total, totals)
    const missingEvidence = requireConclusive && conclusive === 0
    const failed = fail > 0 || missingEvidence
    const result = { message, failed }
    return result
  })
  return results
}

function checkReports (directory) {
  const directories = fs.readdirSync(directory).filter(name => name.startsWith('run-'))
  const report = directories.flatMap(name => {
    const filename = path.join(directory, name, 'report.json')
    const entries = JSON.parse(fs.readFileSync(filename, 'utf8'))
    return entries
  })
  const expected = workloads().map(workload => JSON.stringify(workload)).sort()
  const actual = report.map(entry => JSON.stringify(entry.workload)).sort()
  assert.deepEqual(actual, expected, 'Missing or duplicate benchmark workloads')
  for (const entry of report) {
    assert.deepEqual(Object.keys(entry.verdict).sort(), metricNames(entry.workload.name), 'Missing benchmark verdicts')
    const statuses = Object.values(entry.verdict)
    assert.ok(statuses.every(status => ['pass', 'fail', 'inconclusive'].includes(status)), 'Invalid benchmark verdict')
  }
  checkResults(report)
}

function checkResults (report, requireConclusive = true) {
  const results = evidence(metricCounts(report), requireConclusive)
  for (const { message, failed } of results) {
    console.log(message)
    if (failed) process.exitCode = 1
  }
}

function reportHeader (run, completed, artifact) {
  const lines = [
    messages.title, '', messages.run(run.conclusion, run.html_url),
    run.commit ? messages.commit(run.commit) : undefined,
    run.bootstrap && notes.bootstrap,
    run.baseHarness && notes.baseHarness,
    artifact ? messages.artifact(run.html_url, artifact.id) : undefined
  ].filter(line => typeof line === 'string')
  const incompleteRun = completed < run.plannedWorkloads
  if (!incompleteRun) return lines
  const incomplete = messages.incomplete(completed, run.plannedWorkloads)
  const header = lines.concat('', incomplete)
  return header
}

function reportNotes (counts, hasMemory, release) {
  const hasInconclusive = Object.values(counts).some(metric => metric.inconclusive > 0)
  const lines = [
    notes.orders,
    counts.p99Ms && notes.latency,
    hasMemory && notes.memory,
    counts.parseUs && notes.parse,
    hasInconclusive && notes.calibration,
    hasInconclusive && notes.coverage,
    release && notes.release
  ].filter(Boolean)
  return lines
}

function reportTable (report, release) {
  const baselines = release ? columns.release(release.version) : columns.base
  const headings = columns.workload.concat(baselines, columns.verdict)
  const header = [tableRow(headings), tableRow(headings.map(() => '---'))]
  const rowsToDisplay = report.flatMap(rows)
  const table = header.concat(rowsToDisplay.slice(0, 80))
  if (rowsToDisplay.length <= 80) return table
  const truncated = table.concat('', notes.truncated)
  return truncated
}

function render (run, report, artifact) {
  const header = reportHeader(run, report.length, artifact)
  if (!report.length) {
    const empty = header.concat('', notes.empty).join('\n')
    return empty
  }
  const { release } = report[0]
  const counts = metricCounts(report)
  const results = evidence(counts).map(({ message }) => '- ' + message)
  const hasMemory = report.some(entry => entry.peakRssMiB)
  const explanations = reportNotes(counts, hasMemory, release)
  const table = reportTable(report, release)
  const summary = header.concat('', results, '', explanations, '', table).join('\n')
  return summary
}

function summary () {
  const { REPORT, ARTIFACT_ID, GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env
  const rows = REPORT && fs.existsSync(REPORT) ? JSON.parse(fs.readFileSync(REPORT, 'utf8')) : []
  const url = GITHUB_SERVER_URL + '/' + GITHUB_REPOSITORY + '/actions/runs/' + GITHUB_RUN_ID
  const { RESULT: conclusion } = process.env
  const run = { html_url: url, conclusion }
  const environment = REPORT && path.join(path.dirname(REPORT), 'environment.json')
  const hasEnvironment = environment && fs.existsSync(environment)
  if (hasEnvironment) {
    run.plannedWorkloads = JSON.parse(fs.readFileSync(environment, 'utf8')).plannedWorkloads
  }
  run.commit = process.env.PR_HEAD_SHA
  run.bootstrap = process.env.BENCH_HARNESS === '.'
  run.baseHarness = process.env.BENCH_HARNESS === '.bench-base'
  const artifact = ARTIFACT_ID && { id: ARTIFACT_ID }
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, render(run, rows, artifact) + '\n')
}

function runSample (root, workload, flags = []) {
  const args = flags.concat(__filename, '--sample', root)
  const input = JSON.stringify(workload)
  const output = execFileSync(process.execPath, args, { input, encoding: 'utf8' })
  const result = JSON.parse(output)
  return result
}

function metricNames (name) {
  const keys = name === 'search-params' ? ['parseUs'] : ['p99Ms', 'requestsPerSec']
  return keys
}

function validateMetrics (name, metrics) {
  const keys = metricNames(name)
  assert.deepEqual(Object.keys(metrics).sort(), keys, errors.sampleMetrics(name))
  for (const key of keys) assert.ok(Number.isFinite(metrics[key]) && metrics[key] > 0, errors.invalidMetric(name, key))
}

function measure (root, workload, log, { phase, round, side, peaks }) {
  const result = runSample(root, workload)
  const entry = { phase, round, side, root, workload, result }
  fs.appendFileSync(log, JSON.stringify(entry) + '\n')
  const { metrics, peakRssMiB } = result
  validateMetrics(workload.name, metrics)
  const hasPeak = peaks && peakRssMiB !== undefined
  if (hasPeak) peaks[side] = Math.max(peaks[side] ?? 0, peakRssMiB)
  return metrics
}

function pair (roots, workload, log, { phase, round, peaks }) {
  const order = round % 2 ? ['base', 'head'] : ['head', 'base']
  const metrics = {}
  for (const side of order) {
    metrics[side] = measure(roots[side], workload, log, { phase, round, side, peaks })
  }
  const changes = Object.fromEntries(Object.entries(metrics.base).map(([key, base]) => {
    const head = metrics.head[key]
    const ratio = key === 'requestsPerSec' ? base / head : head / base
    const slowdown = Math.log(ratio)
    const entry = [key, slowdown]
    return entry
  }))
  const { base, head } = metrics
  const pair = { base, head, changes }
  return pair
}

function recordControl (keys, controls, changes) {
  for (const key of keys) {
    const difference = Math.abs(changes[key])
    const limit = Math.log(key === 'p99Ms' ? 1.20 : 1.10)
    const control = controls[key]
    control.maximum = Math.max(control.maximum, difference)
    if (difference <= limit) control.quiet++
  }
}

function calibrate (keys, sampleControl) {
  const controls = Object.fromEntries(keys.map(key => [key, { quiet: 0, maximum: 0 }]))
  for (let round = 1; round <= 6; round++) {
    recordControl(keys, controls, sampleControl(round))
    if (keys.every(key => controls[key].quiet >= 3)) break
  }
  const limits = keys.map(key => {
    const { quiet, maximum } = controls[key]
    const limit = quiet >= 3 ? maximum : null
    const entry = [key, limit]
    return entry
  })
  const tolerance = Object.fromEntries(limits)
  return tolerance
}

function decision (votes) {
  if (!votes[0]) return 'pass'
  if (votes.filter(Boolean).length >= 2) return 'fail'
  if (votes.length === 3) return 'pass'
  return 'retry'
}

function balancedAttempt (first, second) {
  const base = {}
  const head = {}
  const changes = {}
  for (const key of Object.keys(first.changes)) {
    base[key] = mean(first.base[key], second.base[key])
    head[key] = mean(first.head[key], second.head[key])
    changes[key] = Math.min(first.changes[key], second.changes[key])
  }
  const orders = [first, second]
  const attempt = { base, head, changes, orders }
  return attempt
}

function recordVotes (tolerance, attempt, votes, verdict) {
  for (const key of Object.keys(tolerance)) {
    if (verdict[key] !== 'retry') continue
    const slower = attempt.changes[key] > tolerance[key]
    votes[key] = votes[key].concat(slower)
    verdict[key] = decision(votes[key])
  }
  const retry = Object.values(verdict).includes('retry')
  return retry
}

function compareAttempts (tolerance, samplePair) {
  const keys = Object.keys(tolerance)
  const votes = Object.fromEntries(keys.map(key => [key, []]))
  const verdict = Object.fromEntries(keys.map(key => [key, tolerance[key] === null ? 'inconclusive' : 'retry']))
  const attempts = []
  for (let round = 1; round <= 3; round++) {
    const first = samplePair(round * 2 - 1)
    const second = samplePair(round * 2)
    const attempt = balancedAttempt(first, second)
    attempts[round - 1] = attempt
    const retry = recordVotes(tolerance, attempt, votes, verdict)
    if (!retry) break
  }
  const comparison = { attempts, votes, verdict }
  return comparison
}

function measureRelease (root, workload, log, { round, peaks }) {
  try {
    const metrics = measure(root, workload, log, { phase: 'release', round, side: 'release', peaks })
    const sample = { metrics }
    return sample
  } catch (error) {
    const reason = error.message || String(error)
    const unavailable = { error: reason }
    return unavailable
  }
}

function releaseResult (version, before, sampleAfter) {
  const after = before.error ? before : sampleAfter()
  const { error } = after
  if (error) {
    const unavailable = { version, error }
    return unavailable
  }
  const keys = Object.keys(before.metrics)
  const metrics = Object.fromEntries(keys.map(key => [key, mean(before.metrics[key], after.metrics[key])]))
  const release = { version, metrics }
  return release
}

function compare (roots, workload, directory) {
  const log = path.join(directory, 'samples.jsonl')
  const peaks = {}
  const releaseSample = round => measureRelease(roots.release, workload, log, { round, peaks })
  const before = roots.release && releaseSample(1)
  const keys = metricNames(workload.name)
  const { base } = roots
  const control = { base, head: base }
  const tolerance = calibrate(keys, round => pair(control, workload, log, { phase: 'control', round }).changes)
  const comparison = compareAttempts(tolerance, round => pair(roots, workload, log, { phase: 'comparison', round, peaks }))
  const result = Object.assign({ workload, tolerance }, comparison)
  if (before) {
    const { version } = require(path.join(roots.release, 'package.json'))
    result.release = releaseResult(version, before, () => releaseSample(2))
    if (result.release.error) {
      delete peaks.release
      console.warn(messages.releaseUnavailable(version, label(workload)))
    }
  }
  if (peaks.head !== undefined) result.peakRssMiB = peaks
  return result
}

function profiles (roots, workload, directory, index) {
  for (const side of ['base', 'head']) {
    const filename = workload.name + '-' + index + '-' + side + '.cpuprofile'
    runSample(roots[side], workload, ['--cpu-prof', '--cpu-prof-dir', directory, '--cpu-prof-name', filename])
  }
}

function metadata (roots, plannedWorkloads) {
  const sha = cwd => execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim()
  const base = sha(roots.base)
  const head = sha(roots.head)
  const release = roots.release && require(path.join(roots.release, 'package.json')).version
  const { version: node } = process
  const { version: tinybench } = require('../../package-lock.json').packages['node_modules/tinybench']
  const osRelease = os.release()
  const arch = os.arch()
  const [{ model: cpu }] = os.cpus()
  const cores = os.availableParallelism()
  const { ImageVersion: runnerImage } = process.env
  const { settings } = http
  const environment = { plannedWorkloads, base, head, release, node, tinybench, os: osRelease, arch, cpu, cores, runnerImage, http: settings }
  return environment
}

function logResult (workload, result) {
  console.log(workload.name, workload.parameters, result.verdict)
  if (result.peakRssMiB) console.log(memoryLabel, result.peakRssMiB)
  for (const [key, verdict] of Object.entries(result.verdict)) {
    if (verdict === 'inconclusive') console.warn(messages.warning(metrics[key], label(workload)))
  }
  const failed = Object.values(result.verdict).includes('fail')
  return failed
}

function main () {
  const [, , basePath, headPath = '.', name] = process.argv
  assert.ok(basePath, errors.baseline)
  const base = path.resolve(basePath)
  const head = path.resolve(headPath)
  const roots = { base, head }
  if (process.env.BENCH_RELEASE) roots.release = path.resolve(process.env.BENCH_RELEASE)
  const selected = workloads().filter(workload => !name || workload.name === name)
  assert.ok(selected.length, errors.component(name))
  const output = path.resolve(process.env.BENCH_OUTPUT || 'coverage/bench')
  fs.mkdirSync(output, { recursive: true })
  const directory = fs.mkdtempSync(path.join(output, 'run-'))
  const reportPath = path.join(directory, 'report.json')
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, 'report=' + reportPath + '\n')
  fs.writeFileSync(path.join(directory, 'environment.json'), JSON.stringify(metadata(roots, selected.length), null, 2))
  console.log(directory)
  const report = []
  for (const [index, workload] of selected.entries()) {
    const result = compare(roots, workload, directory)
    const failed = logResult(workload, result)
    report[index] = result
    fs.writeFileSync(reportPath, JSON.stringify(report))
    const collectProfile = failed || process.env.BENCH_PROFILES === 'true'
    if (collectProfile) profiles(roots, workload, directory, index)
  }
  const requireConclusive = process.env.BENCH_DEFER_EVIDENCE !== 'true'
  checkResults(report, requireConclusive)
}

if (require.main === module) {
  run().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}

module.exports = { summary, calibrate, compareAttempts, render, evidence, profiles }
