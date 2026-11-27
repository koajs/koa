'use strict'

const metrics = { parseUs: 'Parse (µs)', p99Ms: 'p99 from scheduled start (ms)', requestsPerSec: 'Requests/s' }
const memoryLabel = 'Peak benchmark worker RSS (MiB)'
const memoryResult = ['—', '—', 'info']

const labels = {
  application: depth => `application · depth ${depth}`,
  head: items => `response · HEAD · known length (${items} items)`,
  json: bytes => `response · JSON (${bytes} B)`,
  query: (name, size, kind) => `${name} · ${size} ${kind}`,
  unstable: 'unstable control',
  unavailable: 'unavailable',
  memoryResult
}

const workload = ['Component', 'Metric']
const base = ['Base', 'Head', 'Δ vs base']
const release = version => [`koa@${version}`, 'Master', 'Proposed merge', 'Δ vs master', 'Δ vs release']
const verdict = ['Slowdown limit', 'Attempts', 'Result']
const columns = { workload, base, release, verdict }

const notes = {
  orders: 'Paired deltas show the deciding attempt (base first / head first). Base and head values average the two orders. Both orders must exceed the largest observed base-against-base difference to trigger a retry.',
  latency: 'p99 measures time from the scheduled start until the response body is read, including any wait to send the request.',
  memory: 'Each revision reports its highest worker RSS across HTTP comparison samples. This includes Node, Koa, the benchmark harness, and fixture setup. The load generator runs in a separate process. Memory is informational.',
  parse: 'Parse time is the median of per-parse batch averages.',
  calibration: 'Inconclusive metrics failed calibration: fewer than three of six base pairs met the noise limit (1.20× for p99, 1.10× for throughput and parsing).',
  coverage: 'Each metric type in the run requires at least one conclusive result. Any confirmed regression fails the run.',
  release: 'Lower times and higher requests/s are faster. Release timings and throughput average two warmed samples. The pass/fail decision compares the proposed merge with master.',
  bootstrap: 'Initial benchmark run uses the proposed harness because the base revision has none.',
  baseHarness: 'Both revisions were timed with the base revision’s fixtures and workload settings.',
  truncated: 'The download contains the full table data.',
  empty: 'No completed measurements were available.'
}

const messages = {
  title: '### Koa benchmarks',
  run: (conclusion, url) => `Benchmarks **${conclusion}**. [Run logs](${url})`,
  commit: sha => 'PR head: `' + sha + '`.',
  artifact: (url, id) => `[Download measurements and available CPU profiles](${url}/artifacts/${id})`,
  incomplete: (completed, planned) => `**Incomplete run.** ${completed} of ${planned} workloads completed.`,
  insufficient: metric => `Insufficient evidence for ${metric}`,
  evidence: (status, conclusive, total, { pass, fail, inconclusive }) =>
    `${status} — ${conclusive}/${total} conclusive (${pass} passed, ${fail} failed, ${inconclusive} inconclusive)`,
  warning: (metric, workload) => `::warning::Inconclusive ${metric} for ${workload}`,
  releaseUnavailable: (version, workload) => `::warning::koa@${version} measurement unavailable for ${workload}. See report.json for the error.`
}

const errors = {
  baseline: 'Provide a baseline checkout: npm run bench -- <base> [head]. Use . . for a same-checkout control.',
  headSocket: 'Expected consecutive HEAD requests to reuse a connection',
  configuration: details => `Invalid benchmark configuration: ${details}`,
  benchmark: name => `Unknown benchmark: ${name}`,
  component: name => `Unknown component: ${name}`,
  sampleMetrics: name => `${name} sample metrics`,
  invalidMetric: (name, key) => `${name}: invalid ${key}`,
  middlewareDepth: 'Expected a non-negative middleware depth',
  querySize: 'Expected a positive query size',
  queryKind: 'Unknown query kind'
}

module.exports = { metrics, memoryLabel, labels, columns, notes, messages, errors }
