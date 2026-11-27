'use strict'

const path = require('node:path')
const { fileURLToPath, pathToFileURL } = require('node:url')
const os = require('node:os')
const { execFileSync } = require('node:child_process')
const { json } = require('node:stream/consumers')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const { isDeepStrictEqual } = require('node:util')
const resolveCommonJS = require.resolve
const { FixtureMismatch, slowdownPercent, metrics, memoryLabel, labels, columns, notes, messages, errors } = require('./constants')
const schema = require('./index.schema.json')
const { changedSince, ...httpProfiles } = require('./index.json')
const components = schema.definitions.component.enum
const projectRoot = path.resolve(__dirname, '../..')
const httpDriver = './tests/utils/http.js'
const http = require('../utils/http')

function fixtureFile (name, extension, root = projectRoot) {
  return path.join(root, 'tests/bench', name, 'index.' + extension)
}

function workloads () {
  verifyFixtureGroups()
  const inputs = components.map(name => [name, require(fixtureFile(name, 'json'))])
  const config = Object.fromEntries(inputs)
  config.http = httpProfiles
  config.changedSince = changedSince
  const Ajv = require('ajv')
  const validate = new Ajv().compile(schema)
  if (!validate(config)) throw new Error(errors.configuration(JSON.stringify(validate.errors)))
  const group = ([name, parameters]) => parameters.map(input => ({ name, parameters: input }))
  const selected = inputs.flatMap(group)
  return selected
}

function runtimeFile (name, root = projectRoot) {
  return path.join(root, name === 'search-params' ? 'lib/search-params.js' : 'lib/application.js')
}

function resolveImport (id, filename, esm) {
  assert.equal(typeof id, 'string', 'Unresolved dynamic import in ' + filename)
  const customLoader = id === 'module' || id === 'node:module'
  const packageEntry = id.startsWith('#') || id === 'koa' || id.startsWith('koa/')
  assert.ok(!customLoader && !packageEntry, 'Module resolution requires a full benchmark run in ' + filename)
  if (esm && id.startsWith('file:')) return fileURLToPath(new URL(id))
  if (!id.startsWith('.') && !path.isAbsolute(id)) return
  if (esm) return fileURLToPath(new URL(id, pathToFileURL(filename)))
  const target = path.resolve(path.dirname(filename), id)
  const resolved = resolveCommonJS(target)
  const manifest = path.join(target, 'package.json')
  const hasManifest = fs.existsSync(manifest)
  if (hasManifest) {
    const inputs = [resolved, manifest]
    return inputs
  }
  return resolved
}

function memberName (node) {
  return node.computed ? node.property?.value : node.property?.name
}

function requiredArgument (node) {
  if (node.type !== 'CallExpression') return
  const { callee } = node
  const property = memberName(callee)
  const moduleRequire = callee.object?.name === 'module' && property === 'require'
  const requireResolve = callee.object?.name === 'require' && property === 'resolve'
  if (callee.name === 'require' || moduleRequire || requireResolve) return node.arguments
}

function indirectLoader (node, parent) {
  if (!parent || parent.callee === node) return false
  if (node.type === 'MemberExpression') {
    return node.object.name === 'module' && memberName(node) === 'require'
  }
  if (node.type !== 'Identifier' || !['require', 'module'].includes(node.name)) return false
  if (parent.type === 'MemberExpression') {
    if (parent.property === node) return false
    const known = node.name === 'require' ? ['main', 'resolve'] : ['exports', 'require']
    return !known.includes(memberName(parent))
  }
  return parent.type !== 'BinaryExpression'
}

function declaredWorkloadInput (argument) {
  if (legacyFixtureInput(argument)) return true
  if (releasePackageInput(argument)) return true
  const args = argument?.arguments
  if (args?.[0]?.name !== 'name') return false
  if (argument.callee.name === 'runtimeFile') return args.length === 2 && args[1].name === 'revision'
  return argument.callee.name === 'fixtureFile' && args.length === 2 && ['js', 'json'].includes(args[1].value)
}

function legacyFixtureInput (argument) {
  const addition = argument?.type === 'BinaryExpression' && argument.operator === '+'
  if (!addition) return false
  const { left, right } = argument
  const prefixAddition = left.type === 'BinaryExpression' && left.operator === '+'
  if (!prefixAddition) return false
  const fixtureName = left.left.value === './' && left.right.name === 'name'
  const fixtureSuffix = ['/index.js', '/index.json'].includes(right.value)
  const recognized = fixtureName && fixtureSuffix
  return recognized
}

function releasePackageInput (argument) {
  const { callee, arguments: args } = argument ?? {}
  const join = callee?.object?.name === 'path' && memberName(callee) === 'join'
  if (!join || args.length !== 2) return false
  const release = args[0]
  const releaseRoot = release.object?.name === 'roots' && memberName(release) === 'release'
  const packageFile = args[1].value === 'package.json'
  const recognized = releaseRoot && packageFile
  return recognized
}

function legacyRuntimeImport (argument, filename, runner) {
  const root = path.resolve(path.dirname(runner), '../..')
  const { callee, arguments: args } = argument ?? {}
  const join = callee?.object?.name === 'path' && memberName(callee) === 'join'
  if (!join || args.length !== 2 || args[0].name !== 'root') return
  const drivers = new Map([
    [path.resolve(root, httpDriver), 'lib/application.js'],
    [fixtureFile('search-params', 'js', root), 'lib/search-params.js']
  ])
  const runtime = drivers.get(filename)
  if (runtime && args[1].value === runtime) return path.resolve(root, runtime)
}

function localImports (filename, readFile, runner) {
  if (filename.endsWith('.json')) return []
  const { parse, VisitorKeys } = require('espree')
  const tree = parse(readFile(filename, 'utf8'), { ecmaVersion: 'latest', sourceType: 'module' })
  const files = []
  function visit (node, parent) {
    if (!node) return
    assert.ok(!indirectLoader(node, parent), 'Indirect module loading requires a full benchmark run in ' + filename)
    const args = requiredArgument(node)
    if (node.source) files.push(resolveImport(node.source.value, filename, true))
    if (args && !(filename === runner && declaredWorkloadInput(args[0]))) {
      const runtime = legacyRuntimeImport(args[0], filename, runner)
      files.push(runtime ?? resolveImport(args[0]?.value, filename, false))
    }
    for (const key of VisitorKeys[node.type]) {
      const child = node[key]
      if (Array.isArray(child)) child.forEach(entry => visit(entry, node))
      else visit(child, node)
    }
  }
  visit(tree)
  const imports = files.flat().filter(Boolean)
  return imports
}

function * benchmarkFiles (root, name, dependenciesOf) {
  const entries = ['tests/bench/index.js', fixtureFile(name, 'js', root), fixtureFile(name, 'json', root), runtimeFile(name, root)]
  if (name !== 'search-params') entries.push(httpDriver)
  const pending = new Set(entries.map(file => path.resolve(root, file)))
  const runner = path.resolve(root, 'tests/bench/index.js')
  const driver = path.resolve(root, httpDriver)
  for (const file of pending) {
    yield file
    const parserRunner = name === 'search-params' && file === runner
    dependenciesOf(file).forEach(dependency => {
      if (parserRunner && dependency === driver) return
      pending.add(dependency)
    })
  }
}

function matchImports (root, files, readFile, onMatch) {
  const changed = new Map(files.map(file => [path.resolve(root, file), file]))
  const cache = new Map()
  const runner = path.resolve(root, 'tests/bench/index.js')
  const dependenciesOf = file => {
    if (!cache.has(file)) cache.set(file, localImports(file, readFile, runner).filter(file => repositoryFile(root, file)))
    return cache.get(file)
  }
  for (const name of components) {
    for (const dependency of benchmarkFiles(root, name, dependenciesOf)) {
      const file = changed.get(dependency)
      if (file !== undefined) onMatch(name, file)
    }
  }
}

function repositoryFile (root, file) {
  const relative = path.relative(root, file)
  const inside = !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative)
  return inside && !relative.split(path.sep).includes('node_modules')
}

function affectedComponents (files, roots = [projectRoot], readFile = fs.readFileSync) {
  const groups = new Set()
  const unmapped = new Set(files)
  const onMatch = (name, file) => {
    groups.add(name)
    unmapped.delete(file)
  }
  try {
    for (const root of new Set(roots)) matchImports(root, files, readFile, onMatch)
  } catch (error) {
    console.warn('Could not trace benchmark imports:', error.message)
    return null
  }
  const ignored = file => changedSince.ignore.some(key => key === file || (key.endsWith('/') && file.startsWith(key)))
  return [...unmapped].every(ignored) ? groups : null
}

function verifyFixtureGroups () {
  const directories = fs.readdirSync(__dirname, { withFileTypes: true }).filter(entry => entry.isDirectory())
  const fixtures = directories.filter(({ name }) => ['js', 'json'].some(ext => fs.existsSync(fixtureFile(name, ext))))
  assert.deepEqual(fixtures.map(({ name }) => name).sort(), [...components].sort(), 'Register every benchmark fixture in the schema')
}

function changedFiles (cwd, since, committed = process.env.GITHUB_ACTIONS === 'true') {
  const revisions = committed ? [since, 'HEAD'] : [since]
  const args = ['diff', '--name-only', '--no-renames', '-z', '--end-of-options', ...revisions, '--']
  const git = args => execFileSync('git', args, { cwd, encoding: 'utf8' })
  try {
    const untracked = committed ? '' : git(['ls-files', '--others', '--exclude-standard', '-z'])
    const output = git(args) + untracked
    return output.split('\0').filter(Boolean)
  } catch {
    return null
  }
}

function runtimeSnapshot (root, readFile = fs.readFileSync) {
  const runner = path.join(root, 'tests/bench/index.js')
  const pending = new Set(components.map(name => runtimeFile(name, root)))
  const sources = new Map()
  for (const file of pending) {
    sources.set(path.relative(root, file), readFile(file, 'utf8'))
    const imports = localImports(file, readFile, runner).filter(file => repositoryFile(root, file))
    imports.forEach(file => pending.add(file))
  }
  const metadata = file => JSON.parse(readFile(path.join(root, file), 'utf8'))
  const manifest = withoutDevDependencies(metadata('package.json'))
  const lock = metadata('package-lock.json')
  assert.ok(lock.packages, 'Missing package dependency graph')
  const installed = Object.entries(lock.packages).filter(([, dependency]) => !dependency.dev)
  const packages = new Map(installed.map(([name, dependency]) => [name, withoutDevDependencies(dependency)]))
  return { sources, manifest, packages, lockfileVersion: lock.lockfileVersion }
}

function withoutDevDependencies ({ devDependencies, ...metadata }) {
  return metadata
}

function sameRuntime (roots) {
  if (roots.length !== 2 || roots[0] === roots[1]) return false
  try {
    const [base, head] = roots.map(root => runtimeSnapshot(root))
    return isDeepStrictEqual(base, head)
  } catch (error) {
    console.warn('Could not verify runtime equality:', error.message)
    return false
  }
}

function benchmarkPlan (files, roots) {
  const affected = files && affectedComponents(files, roots)
  const selected = affected ? [...affected] : components
  const inputs = ['tests/bench/', 'tests/utils/http.js', '.github/workflows/node.js.yml', 'package.json', 'package-lock.json']
  const harnessInput = file => inputs.some(input => file === input || (input.endsWith('/') && file.startsWith(input)))
  const unchanged = selected.length > 0 && sameRuntime(roots)
  const controls = unchanged || !files || files.some(harnessInput)
  const measurements = unchanged ? [] : selected
  return { components: selected, measurements, controls }
}

function selectChanged (workloads, { base, head }, since) {
  const files = changedFiles(head, since)
  const groups = files && affectedComponents(files, [base, head])
  const selected = groups ? workloads.filter(({ name }) => groups.has(name)) : workloads
  const names = [...new Set(selected.map(({ name }) => name))]
  const count = `Selected ${selected.length} of ${workloads.length} benchmark workloads.`
  const details = [count, names.join(', ')]
  if (!files) details.push('Git could not read the comparison.')
  else if (!groups) details.push('Could not narrow benchmark coverage for these changes.')
  const message = details.filter(Boolean).join(' ')
  console.log(message)
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, message + '\n\n')
  return selected
}

function sample (revision, { name, parameters }, smokeOnly) {
  if (!components.includes(name)) throw new Error(errors.benchmark(name))
  const fixture = require(fixtureFile(name, 'js'))
  const runtime = require(runtimeFile(name, revision))
  const measurement = name === 'search-params'
    ? fixture.measure(runtime, parameters, smokeOnly)
    : http(runtime, fixture, parameters, smokeOnly)
  return measurement
}

async function smoke () {
  for (const workload of workloads()) {
    const result = await sample(process.cwd(), workload, true)
    validateMetrics(workload.name, result.metrics)
  }
}

async function run () {
  const [, , mode, root, specification] = process.argv
  if (mode === '--smoke') {
    await smoke()
    return
  }
  if (mode !== '--sample') {
    main()
    return
  }
  const workload = specification === undefined ? await json(process.stdin) : JSON.parse(specification)
  let result
  try {
    result = await sample(path.resolve(root), workload)
  } catch (error) {
    if (!(error instanceof FixtureMismatch)) throw error
    result = { fixtureError: error.message }
  }
  process.stdout.write(JSON.stringify(result))
}

const format = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 4 })

function number (value) {
  assert.ok(Number.isFinite(value))
  const formatted = format.format(value)
  return formatted
}

function label ({ name, parameters }) {
  if (parameters.scenario) return name + ' · ' + parameters.scenario
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
  const { pairs } = entry
  const base = median(pairs.map(pair => pair.base[key]))
  const head = median(pairs.map(pair => pair.head[key]))
  const ratio = entry.bounds?.[key].ratio ?? median(balancedRatios(pairs, key))
  const release = entry.release?.error ? null : entry.release?.metrics[key]
  const values = comparisonValues(base, head, release, difference(1, ratio))
  const interval = entry.bounds?.[key]
  const uncertainty = interval ? difference(1, interval.lower) + ' to ' + difference(1, interval.upper) : '—'
  const cells = [name, metrics[key]].concat(values, uncertainty, number(slowdownPercent) + '%', pairs.length, verdict)
  const row = tableRow(cells)
  return row
}

function rows (entry) {
  const name = label(entry.workload)
  const measurements = entry.baselineError
    ? headOnlyRows(entry, name)
    : Object.entries(entry.verdict).map(metric => metricRow(entry, name, metric))
  if (!entry.peakRssMiB) return measurements
  const { base, head, release } = entry.peakRssMiB
  const releasePeak = entry.release ? release ?? null : undefined
  const values = entry.baselineError
    ? headOnlyValues(head, release, Boolean(entry.release))
    : comparisonValues(base, head, releasePeak)
  const cells = [name, memoryLabel].concat(values, '—', labels.memoryResult)
  const withMemory = measurements.concat(tableRow(cells))
  return withMemory
}

function headOnlyRows (entry, name) {
  return Object.entries(entry.head).map(([key, value]) => {
    const release = entry.release?.metrics?.[key]
    const values = headOnlyValues(value, release, Boolean(entry.release))
    const cells = [name, metrics[key], ...values, '—', '—', 0, 'no comparable baseline']
    return tableRow(cells)
  })
}

function headOnlyValues (head, release, hasRelease) {
  const values = [labels.unavailable, number(head), '—']
  if (!hasRelease) return values
  values.unshift(release === undefined ? labels.unavailable : number(release))
  values.push(release === undefined ? '—' : difference(release, head))
  return values
}

function metricCounts (report) {
  const counts = {}
  const verdicts = report.flatMap(metricEntries)
  for (const [key, status] of verdicts) {
    counts[key] ??= { pass: 0, fail: 0, inconclusive: 0, exempt: 0 }
    counts[key][status]++
  }
  return counts
}

function metricEntries (entry) {
  const entries = metricNames(entry.workload.name).map(key => {
    const status = reportedVerdict(entry, key)
    const metric = [key, status]
    return metric
  })
  return entries
}

function reportedVerdict (entry, key) {
  const status = entry.verdict?.[key]
  const pairedStatus = ['pass', 'fail', 'inconclusive'].includes(status)
  const hasPairs = Array.isArray(entry.pairs) && entry.pairs.length > 0
  const pairedResult = pairedStatus && hasPairs
  if (pairedResult) return status
  const allowedExemption = entry.exemption === 'baseline-fixture-mismatch' && status === 'exempt'
  const headMeasured = Number.isFinite(entry.head?.[key]) && entry.head[key] > 0
  const validExemption = allowedExemption && headMeasured && typeof entry.baselineError === 'string'
  if (validExemption) return 'exempt'
  return 'inconclusive'
}

function evidence (counts) {
  const results = Object.entries(counts).map(([key, totals]) => {
    const { pass, fail, inconclusive, exempt = 0 } = totals
    const conclusive = pass + fail
    const total = conclusive + inconclusive + exempt
    const sufficient = conclusive > 0 || exempt > 0
    const status = sufficient ? metrics[key] : messages.insufficient(metrics[key])
    const message = messages.evidence(status, conclusive, total, totals)
    const failed = fail > 0 || inconclusive > 0
    const result = { message, failed }
    return result
  })
  return results
}

function reportHeader (run, completed, artifact) {
  const lines = [
    messages.title, '', messages.run(run.conclusion, run.html_url),
    run.commit ? messages.commit(run.commit) : undefined,
    run.bootstrap && notes.bootstrap,
    run.mergedHarness && notes.mergedHarness,
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
  const hasExemption = Object.values(counts).some(metric => metric.exempt > 0)
  const lines = [
    notes.orders,
    counts.requestUs && notes.callback,
    hasMemory && notes.memory,
    counts.parseUs && notes.parse,
    (hasInconclusive || hasExemption) && notes.coverage,
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
  run.mergedHarness = process.env.BENCH_HARNESS === '.' && process.env.GITHUB_EVENT_NAME === 'push'
  run.bootstrap = process.env.BENCH_HARNESS === '.' && process.env.GITHUB_EVENT_NAME === 'pull_request'
  run.baseHarness = process.env.BENCH_HARNESS === '.bench-base'
  const artifact = ARTIFACT_ID && { id: ARTIFACT_ID }
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, render(run, rows, artifact) + '\n')
}

function runSample (root, workload, flags = []) {
  const args = flags.concat(__filename, '--sample', root)
  const input = JSON.stringify(workload)
  const output = execFileSync(process.execPath, args, { input, encoding: 'utf8' })
  const result = JSON.parse(output)
  if (Object.hasOwn(result, 'fixtureError')) {
    throw new FixtureMismatch(result.fixtureError)
  }
  return result
}

function metricNames (name) {
  const keys = name === 'search-params' ? ['parseUs'] : ['requestUs']
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

function compareRevisions (keys, sample, allowMissingBaseline) {
  let base
  try {
    base = sample('base', 1)
  } catch (error) {
    if (!allowMissingBaseline || !(error instanceof FixtureMismatch)) throw error
    const head = sample('head', 1)
    const verdict = Object.fromEntries(keys.map(key => [key, 'exempt']))
    const exemption = 'baseline-fixture-mismatch'
    const baselineError = error.message || 'Baseline cannot satisfy the fixture'
    const comparison = { baselineError, head, verdict, exemption }
    return comparison
  }
  return compareAttempts(keys, round => {
    if (round === 1) return { base, head: sample('head', round) }
    const order = round % 2 ? ['base', 'head'] : ['head', 'base']
    return Object.fromEntries(order.map(side => [side, sample(side, round)]))
  })
}

function medianOfSorted (sorted) {
  const middle = Math.floor(sorted.length / 2)
  if (sorted.length % 2) return sorted[middle]
  return mean(sorted[middle - 1], sorted[middle])
}

function median (values) {
  return medianOfSorted(values.sort((a, b) => a - b))
}

function balancedRatios (pairs, key) {
  const ratios = []
  for (let i = 0; i < pairs.length; i += 2) {
    const first = pairs[i].head[key] / pairs[i].base[key]
    const second = pairs[i + 1].head[key] / pairs[i + 1].base[key]
    ratios.push(Math.sqrt(first * second))
  }
  return ratios
}

function comparisonBounds (pairs, key, critical) {
  const logs = balancedRatios(pairs, key).map(Math.log)
  const average = logs.reduce((sum, value) => sum + value, 0) / logs.length
  const squaredErrors = logs.map(value => (value - average) ** 2)
  const variance = squaredErrors.reduce((sum, value) => sum + value, 0) / (logs.length - 1)
  const margin = critical * Math.sqrt(variance / logs.length)
  const ratio = Math.exp(average)
  const lower = Math.exp(average - margin)
  const upper = Math.exp(average + margin)
  return { ratio, lower, upper }
}

function verdictFor ({ lower, upper }) {
  const threshold = 1 + slowdownPercent / 100
  if (lower >= threshold) return 'fail'
  if (upper < threshold) return 'pass'
  return 'inconclusive'
}

function compareAttempts (keys, samplePair) {
  const pairs = []
  let verdict
  let bounds
  for (const [count, critical] of [[6, 4.303], [12, 2.571], [24, 2.201], [48, 2.069]]) {
    while (pairs.length < count) pairs.push(samplePair(pairs.length + 1))
    bounds = Object.fromEntries(keys.map(key => [key, comparisonBounds(pairs, key, critical)]))
    verdict = Object.fromEntries(keys.map(key => [key, verdictFor(bounds[key])]))
    if (!Object.values(verdict).includes('inconclusive')) break
  }
  return { pairs, bounds, verdict }
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

function releaseVersion (root) {
  return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version
}

function compare (roots, workload, directory) {
  const log = path.join(directory, 'samples.jsonl')
  const peaks = {}
  const releaseSample = round => measureRelease(roots.release, workload, log, { round, peaks })
  const before = roots.release && releaseSample(1)
  const keys = metricNames(workload.name)
  const sample = (side, round) => measure(roots[side], workload, log, { phase: 'comparison', round, side, peaks })
  const mergedHarness = roots.head === projectRoot && roots.base !== roots.head
  const comparison = compareRevisions(keys, sample, mergedHarness)
  const result = Object.assign({ workload }, comparison)
  if (result.baselineError) console.warn('No comparable baseline for %s: %s', label(workload), result.baselineError)
  if (before) {
    const version = releaseVersion(roots.release)
    result.release = releaseResult(version, before, () => releaseSample(2))
    if (result.release.error) {
      delete peaks.release
      console.warn(messages.releaseUnavailable(version, label(workload)))
    }
  }
  if (peaks.head !== undefined) result.peakRssMiB = peaks
  return result
}

function profiles (roots, result, directory, index, sample = runSample) {
  const { workload, baselineError } = result
  const sides = baselineError ? ['head'] : ['base', 'head']
  for (const side of sides) {
    const filename = workload.name + '-' + index + '-' + side + '.cpuprofile'
    sample(roots[side], workload, ['--cpu-prof', '--cpu-prof-dir', directory, '--cpu-prof-name', filename])
  }
}

function metadata (roots, plannedWorkloads) {
  const sha = cwd => execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim()
  const base = sha(roots.base)
  const head = sha(roots.head)
  const release = roots.release && releaseVersion(roots.release)
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
  const available = workloads()
  if (name) assert.ok(components.includes(name), errors.component(name))
  const candidates = name ? available.filter(workload => workload.name === name) : available
  const since = process.env.BENCH_CHANGED_SINCE
  const selected = since ? selectChanged(candidates, roots, since) : candidates
  if (!selected.length) return
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
    if (collectProfile) profiles(roots, result, directory, index)
  }
  for (const { message, failed } of evidence(metricCounts(report))) {
    console.log(message)
    if (failed) process.exitCode = 1
  }
}

if (require.main === module) {
  run().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}

module.exports = { summary, compareAttempts, compareRevisions, evidence, render, affectedComponents, changedFiles, profiles, benchmarkPlan, runtimeSnapshot, metricCounts }
