'use strict'

const assert = require('node:assert/strict')
const path = require('node:path')
const fs = require('node:fs')
const { pathToFileURL } = require('node:url')
const { it } = require('node:test')
const { compareAttempts, compareRevisions, evidence, render, affectedComponents, profiles, benchmarkPlan, runtimeSnapshot, metricCounts } = require('./index')
const { FixtureMismatch } = require('./constants')
const root = path.resolve(__dirname, '../..')
const requestFixture = 'tests/bench/request/index.js'
const responseFixture = 'tests/bench/response/index.js'
const parserFixture = 'tests/bench/search-params/index.js'

function select (files, sources) {
  const read = filename => sources[path.relative(root, filename).split(path.sep).join('/')] || ''
  return affectedComponents(files, [root], read)
}

it('selects HTTP and parser workloads for the code each exercises', () => {
  const sources = {
    'lib/application.js': "require('./request')",
    'lib/request.js': "require('./search-params')",
    [requestFixture]: "require('../search-params')"
  }
  const parser = select(['lib/search-params.js', 'tests/unit/request/query.test.js'], sources)
  assert.deepEqual([...parser], ['application', 'request', 'response', 'search-params'])
  const http = select(['tests/utils/http.js'], sources)
  assert.deepEqual([...http], ['application', 'request', 'response'])
  const combined = select([parserFixture, 'tests/bench/response/index.json'], sources)
  assert.deepEqual([...combined], ['request', 'response', 'search-params'])
})

it('excludes parser timings for an HTTP driver change using the real import graph', () => {
  const selected = affectedComponents(['tests/utils/http.js'])
  assert.deepEqual([...selected], ['application', 'request', 'response'])
})

it('keeps HTTP imports added by a parser fixture in its import graph', () => {
  const sources = { [parserFixture]: "require('../../utils/http')" }
  const selected = select(['tests/utils/http.js'], sources)
  assert.equal(selected.has('search-params'), true)
})

it('updates transitive benchmark coverage when a fixture gains an import', () => {
  const sources = { [requestFixture]: "require('../search-params')" }
  assert.deepEqual([...select([parserFixture], sources)], ['request', 'search-params'])
  const url = pathToFileURL(path.join(root, requestFixture))
  const imports = [
    "import '../request/index.js'",
    "module.require('../request')",
    `export * from '${url.href}'`,
    "import('../request/index.js?revision=1')"
  ]
  for (const source of imports) {
    const updated = { ...sources, [responseFixture]: source }
    assert.deepEqual([...select([parserFixture], updated)], ['request', 'response', 'search-params'])
  }
})

it('tracks a directory manifest beneath an ignored path', t => {
  const fixtureRoot = fs.mkdtempSync(path.join(root, 'node_modules/.bench-import-'))
  t.after(() => fs.rmSync(fixtureRoot, { recursive: true, force: true }))
  const directory = path.join(fixtureRoot, 'docs/helper')
  fs.mkdirSync(directory, { recursive: true })
  fs.writeFileSync(path.join(directory, 'package.json'), '{"main":"entry.js"}')
  fs.writeFileSync(path.join(directory, 'entry.js'), '')
  const read = filename => {
    if (filename === path.join(fixtureRoot, requestFixture)) return "require('../../../docs/helper')"
    if (fs.existsSync(filename)) {
      const source = fs.readFileSync(filename, 'utf8')
      return source
    }
    return ''
  }
  const selected = affectedComponents(['docs/helper/package.json'], [fixtureRoot], read)
  assert.deepEqual(Array.from(selected), ['request'])
})

it('runs the full suite for custom loaders and conditional ESM package entries', () => {
  const sources = [
    "const load = require('node:module').createRequire(__filename); load('../request')",
    "import { createRequire as loader } from 'module'; loader(import.meta.url)('../request')",
    "const load = require; load('../request')",
    "const load = module.require.bind(module); load('../request')",
    "const { require: load } = module; load('../request')",
    "import('koa')"
  ]
  for (const source of sources) {
    assert.equal(select([requestFixture], { [responseFixture]: source }), null)
  }
})

it('traces new shared runner imports and falls back for an unknown loader', () => {
  const runner = 'tests/bench/index.js'
  const direct = select([parserFixture], { [runner]: "require('./search-params')" })
  assert.equal(direct.size, 4)
  const indirect = { [runner]: 'function loadBenchmarkFile(file) { return require(file) }' }
  assert.equal(select([parserFixture], indirect), null)
})

it('rejects query parameters on named request scenarios', () => {
  const Ajv = require('ajv')
  const ajv = new Ajv().addSchema(require('./index.schema.json'), 'bench')
  const valid = ajv.getSchema('bench#/properties/request')
  assert.ok(valid([{ scenario: 'localized route' }, { size: 8, kind: 'repeated' }]))
  assert.equal(valid([{ scenario: 'localized route', size: 8 }]), false)
  assert.equal(valid([{ scenario: 'localized route', kind: 'repeated' }]), false)
})

it('times consumers from both revisions even when the changed path normally skips benchmarks', () => {
  const base = path.join(root, 'base')
  const head = path.join(root, 'head')
  const consumers = new Set([path.join(base, requestFixture), path.join(head, responseFixture)])
  const read = filename => consumers.has(filename) ? "import '../../../docs/shared.js'" : ''
  const selected = affectedComponents(['docs/shared.js'], [base, head], read)
  assert.deepEqual([...selected], ['request', 'response'])
})

it('traces the legacy master harness without forcing ignored changes into the suite', () => {
  const sources = {
    'tests/bench/index.js': [
      "require('./' + name + '/index.json')",
      "require('./' + name + '/index.js')",
      "require(path.join(roots.release, 'package.json'))"
    ].join('\n'),
    'tests/utils/http.js': "require(path.join(root, 'lib/application.js'))",
    [parserFixture]: "require(path.join(root, 'lib/search-params.js'))",
    'lib/application.js': "require('./request')"
  }
  assert.equal(select(['docs/guide.md'], sources).size, 0)
  const selected = select(['lib/request.js'], sources)
  assert.deepEqual([...selected], ['application', 'request', 'response'])
})

it('skips only explicitly mapped paths and keeps full coverage for unknown changes', () => {
  assert.equal(affectedComponents(['docs/guide.md', 'Readme.md']).size, 0)
  assert.equal(affectedComponents(['docs/guide.md', 'docs.js']), null)
  assert.equal(affectedComponents(['lib/search-params.js', 'lib/new-parser.js']), null)
  assert.equal(affectedComponents(['tests/bench/index.json']).size, 4)
  assert.equal(affectedComponents(['package-lock.json']).size, 4)
})

it('plans only the jobs needed by runtime, fixture and dependency changes', () => {
  const plan = files => benchmarkPlan(files, [root])
  assert.deepEqual(plan(['docs/guide.md']), { components: [], measurements: [], controls: false })
  assert.deepEqual(plan([responseFixture]), { components: ['response'], measurements: ['response'], controls: true })
  const http = ['application', 'request', 'response']
  assert.deepEqual(plan(['lib/request.js']), { components: http, measurements: http, controls: false })
  for (const file of ['package.json', 'package-lock.json']) {
    const result = plan([file])
    assert.equal(result.components.length, 4)
    assert.equal(result.controls, true)
  }
  assert.equal(plan(null).controls, true)
  assert.equal(plan(null).components.length, 4)
})

it('compares runtime imports and production locks while allowing development-only changes', () => {
  const before = runtimeSnapshot(root)
  const changed = changes => runtimeSnapshot(root, filename => {
    const source = fs.readFileSync(filename, 'utf8')
    const file = path.relative(root, filename).split(path.sep).join('/')
    return changes[file] ? changes[file](source) : source
  })
  const addDev = source => {
    const document = JSON.parse(source)
    document.devDependencies = { ...document.devDependencies, 'unused-dev-tool': '1.0.0' }
    return JSON.stringify(document)
  }
  assert.deepEqual(changed({ 'package.json': addDev }), before)
  const devLock = source => {
    const lock = JSON.parse(source)
    lock.packages['node_modules/unused-dev-tool'] = { version: '1.0.0', dev: true }
    return JSON.stringify(lock)
  }
  assert.deepEqual(changed({ 'package-lock.json': devLock }), before)
  const productionLock = source => {
    const lock = JSON.parse(source)
    lock.packages['node_modules/cookies'].version = '99.0.0'
    return JSON.stringify(lock)
  }
  assert.notDeepEqual(changed({ 'package-lock.json': productionLock }), before)
  assert.notDeepEqual(changed({ 'lib/request.js': source => source + '\nvoid 0\n' }), before)
  const manifest = source => {
    const document = JSON.parse(source)
    document.version += '-different'
    return JSON.stringify(document)
  }
  assert.notDeepEqual(changed({ 'package.json': manifest }), before)
})

it('keeps harness controls and skips comparisons when both runtime snapshots match', () => {
  const plan = benchmarkPlan([responseFixture], [root, root + path.sep])
  assert.deepEqual(plan, { components: ['response'], measurements: [], controls: true })
  const unavailable = benchmarkPlan([responseFixture], [path.join(root, 'missing-baseline'), root])
  assert.equal(unavailable.measurements.length, 4)
})

it('runs controls for an imported fixture helper outside the harness directory', t => {
  const unmockedRead = fs.readFileSync.bind(fs)
  t.mock.method(fs, 'readFileSync', (filename, ...args) => {
    const source = unmockedRead(filename, ...args)
    if (filename === path.join(root, requestFixture)) {
      const fixture = source + "\nrequire('../../utils/context')"
      return fixture
    }
    return source
  })
  const plan = benchmarkPlan(['tests/utils/context.js'], [root, root + path.sep])
  const components = ['request']
  const measurements = []
  assert.deepEqual(plan, { components, measurements, controls: true })
})

function compareRatios (ratios) {
  return compareAttempts(['requestUs'], round => ({
    base: { requestUs: 100 }, head: { requestUs: 100 * ratios[(round - 1) % ratios.length] }
  }))
}

it('cancels the first-process advantage and preserves a sustained slowdown', () => {
  const bias = 1.1
  assert.equal(compareRatios([bias, 1 / bias]).verdict.requestUs, 'pass')
  assert.equal(compareRatios([1.06 * bias, 1.06 / bias]).verdict.requestUs, 'fail')
})

it('waits for streamed POST responses and exposes the byte length to Koa', async t => {
  const { Readable } = require('node:stream')
  const http = require('../utils/http')
  let clock = 0
  t.mock.method(performance, 'now', () => clock)
  const result = await http(require('../../lib/application'), app => {
    app.use(ctx => {
      ctx.body = Readable.from((async function * () {
        yield String(ctx.request.length)
        await new Promise(resolve => setImmediate(resolve))
        clock += 1
        yield ctx.get('x-test')
      })())
    })
    const init = { method: 'POST', headers: { 'X-Test': 'ok' }, body: 'é!' }
    return { route: '/', init, body: '3ok' }
  }, {})
  assert.equal(result.metrics.requestUs, 1000)
})

it('validates numeric and repeated response headers in both measurement modes', async () => {
  const http = require('../utils/http')
  const cookies = ['a=1', 'b=2']
  const headers = {
    'x-count': '2',
    vary: 'Accept, Origin',
    cookie: 'a=1; b=2',
    'set-cookie': cookies,
    location: '/first'
  }
  await http(require('../../lib/application'), app => {
    app.use(ctx => {
      ctx.set('X-Count', 2)
      ctx.set('Vary', ['Accept', 'Origin'])
      ctx.set('Cookie', ['a=1', 'b=2'])
      ctx.set('Set-Cookie', cookies)
      ctx.set('Location', ['/first', '/second'])
      ctx.body = 'ok'
    })
    const fixture = { route: '/', body: 'ok', headers }
    return fixture
  }, {}, true)
})

it('keeps the slowdown limit fixed at 5% including after an outlier', () => {
  assert.equal(compareRatios([1.049]).verdict.requestUs, 'pass')
  assert.equal(compareRatios([1.05]).verdict.requestUs, 'fail')
  const regression = compareRatios([0.5, ...Array(11).fill(1.8)])
  assert.equal(regression.pairs.length, 12)
  assert.equal(regression.verdict.requestUs, 'fail')
})

it('measures work inside the Koa callback and blocks a 5% increase', async t => {
  const http = require('../utils/http')
  const Koa = require('../../lib/application')
  let clock = 0
  t.mock.method(performance, 'now', () => clock)
  const sample = cost => http(Koa, app => {
    app.use(ctx => {
      clock += cost
      ctx.body = 'ok'
    })
    return { route: '/', body: 'ok' }
  }, {})
  const { metrics: base } = await sample(20)
  const { metrics: head } = await sample(21)
  assert.equal(base.requestUs, 20000)
  assert.equal(head.requestUs, 21000)
  assert.equal(compareAttempts(['requestUs'], () => ({ base, head })).verdict.requestUs, 'fail')
})

it('blocks a workload with unresolved timing even when other workloads pass', () => {
  const result = compareRatios([1, 1, 1.1, 1.1])
  assert.equal(result.verdict.requestUs, 'inconclusive')
  assert.equal(result.pairs.length, 48)
  assert.equal(evidence({ requestUs: { pass: 3, fail: 0, inconclusive: 1 } })[0].failed, true)
})

it('reports pinned release drift independently of the PR verdict', () => {
  const workload = { name: 'application', parameters: { depth: 0 } }
  const release = { version: '3.3.0', metrics: { requestUs: 80 } }
  const entry = { workload, release, ...compareRatios([1]) }
  assert.ok(render({}, [entry]).includes('| 80 | 100 | 100 | 0% | +25% | 0% to 0% | 5% | 6 | pass |'))
  entry.release = { version: '3.3.0', error: 'unsupported fixture' }
  assert.ok(render({}, [entry]).includes('| unavailable | 100 | 100 | 0% | unavailable | 0% to 0% | 5% | 6 | pass |'))
})

it('requires uncertainty bounds to resolve noisy samples around the slowdown limit', () => {
  const ratios = [
    1.08089471, 1.03163079, 0.82996213, 0.95969277, 0.91420613, 1.18562818,
    1.07107061, 1.24332059, 0.99714126, 0.78883675, 0.91786218, 0.98088298,
    0.95502339, 0.94225883, 0.99845010, 1.03174605, 1.20811660, 1.06434385,
    1.00544359, 1.10257660, 0.78620068, 1.09992466, 0.82728175, 1.00439844
  ]
  const control = compareRatios(ratios)
  assert.equal(control.pairs.length, 48)
  assert.equal(control.verdict.requestUs, 'pass')
  assert.ok(control.bounds.requestUs.upper < 1.05)
  const slower = compareRatios(ratios.map(ratio => ratio * 1.06))
  assert.notEqual(slower.verdict.requestUs, 'pass')
  const regression = compareRatios(ratios.map(ratio => ratio * 1.12))
  assert.equal(regression.verdict.requestUs, 'fail')
})

it('reports a head measurement for a fixture only the merged runtime satisfies', () => {
  const head = { requestUs: 10 }
  const baselineError = 'expected status 500'
  const mismatch = new FixtureMismatch(baselineError)
  const sample = side => {
    if (side === 'base') throw mismatch
    return head
  }
  const result = compareRevisions(['requestUs'], sample, true)
  const verdict = { requestUs: 'exempt' }
  assert.deepEqual(result, {
    baselineError, head, verdict, exemption: 'baseline-fixture-mismatch'
  })
  const workload = { name: 'application', parameters: { scenario: 'error' } }
  assert.match(render({}, [{ workload, ...result }]), /10 .*no comparable baseline/)
  assert.throws(() => compareRevisions(['requestUs'], sample, false), mismatch)
  assert.throws(() => compareRevisions(['requestUs'], () => { throw mismatch }, true), mismatch)
  const workerError = new Error('worker exited')
  assert.throws(() => compareRevisions(['requestUs'], () => { throw workerError }, true), workerError)
  const timeout = Object.assign(new Error('response timed out'), { code: 'ERR_BENCH_TIMEOUT' })
  assert.throws(() => compareRevisions(['requestUs'], () => { throw timeout }, true), timeout)
  const headTimeout = side => {
    if (side === 'base') return head
    throw timeout
  }
  assert.throws(() => compareRevisions(['requestUs'], headTimeout, true), timeout)
})

it('counts explicit baseline exemptions without passing missing paired verdicts', () => {
  const parameters = { scenario: 'error' }
  const workload = { name: 'application', parameters }
  const head = { requestUs: 10 }
  const sample = side => {
    if (side === 'base') throw new FixtureMismatch('unsupported behavior')
    return head
  }
  const entry = Object.assign({ workload }, compareRevisions(['requestUs'], sample, true))
  const counts = metricCounts([entry])
  assert.deepEqual(counts.requestUs, { pass: 0, fail: 0, inconclusive: 0, exempt: 1 })
  assert.equal(evidence(counts)[0].failed, false)
  assert.match(render({}, [entry]), /1 exempt/)
  delete entry.exemption
  assert.equal(evidence(metricCounts([entry]))[0].failed, true)
  entry.verdict = {}
  assert.equal(evidence(metricCounts([entry]))[0].failed, true)
  entry.verdict = { requestUs: 'pass' }
  assert.equal(evidence(metricCounts([entry]))[0].failed, true)
})

it('preserves the head memory measurement when the baseline is unavailable', () => {
  const workload = { name: 'application', parameters: { scenario: 'error' } }
  const entry = { workload, baselineError: 'mismatch', head: { requestUs: 10 }, verdict: {}, peakRssMiB: { head: 80 } }
  assert.match(render({}, [entry]), /Peak benchmark worker RSS \(MiB\) \| unavailable \| 80 \| —/)
  entry.release = { version: '3.3.0', metrics: { requestUs: 12 } }
  entry.peakRssMiB.release = 100
  assert.match(render({}, [entry]), /Peak benchmark worker RSS \(MiB\) \| 100 \| unavailable \| 80 \| — \| -20%/)
})

it('reports an unfinished response as a timeout', async t => {
  if (!t.mock?.method) {
    t.skip('Function mocks are unavailable on this Node version')
    return
  }
  t.mock.method(globalThis, 'setTimeout', (callback, delay) => {
    assert.equal(delay, 5000)
    queueMicrotask(callback)
    const timer = { refresh () {} }
    return timer
  })
  const http = require('../utils/http')
  const measured = http(require('../../lib/application'), app => {
    app.use(() => new Promise(() => {}))
    return { route: '/', body: 'ok' }
  }, {})
  const rejected = assert.rejects(measured, error => {
    assert.equal(error.code, 'ERR_BENCH_TIMEOUT')
    assert.equal(error instanceof FixtureMismatch, false)
    return true
  })
  await rejected
})

it('profiles head when the baseline cannot satisfy a fixture and continues profiling', () => {
  const roots = { base: '/base', head: '/head' }
  const workload = { name: 'application', parameters: { scenario: 'error' } }
  const result = { workload, baselineError: 'fixture mismatch' }
  const calls = []
  const sample = (root, input, flags) => calls.push({ root, input, flags })
  profiles(roots, result, '/profiles', 0, sample)
  assert.deepEqual(calls.map(call => call.root), ['/head'])
  assert.ok(calls[0].flags.includes('application-0-head.cpuprofile'))
  assert.ok(calls[0].flags.includes('--cpu-prof'))
  profiles(roots, { workload }, '/profiles', 1, sample)
  assert.deepEqual(calls.map(call => call.root), ['/head', '/base', '/head'])
  assert.ok(calls.every(call => call.flags.includes('--cpu-prof')))
})
