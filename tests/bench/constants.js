'use strict'

const metrics = { parseUs: 'Parse (µs)', requestUs: 'Koa callback (µs/request)' }
const slowdownPercent = 5
const memoryLabel = 'Peak benchmark worker RSS (MiB)'
const memoryResult = ['—', '—', 'info']

const labels = {
  application: depth => `application · depth ${depth}`,
  head: items => `response · HEAD · known length (${items} items)`,
  json: bytes => `response · JSON (${bytes} B)`,
  query: (name, size, kind) => `${name} · ${size} ${kind}`,
  unavailable: 'unavailable',
  memoryResult
}

const workload = ['Component', 'Metric']
const base = ['Base', 'Head', 'Δ vs base']
const release = version => [`koa@${version}`, 'Base', 'Head', 'Δ vs base', 'Δ vs release']
const verdict = ['95% interval for Δ', 'Slowdown limit', 'Pairs', 'Result']
const columns = { workload, base, release, verdict }

const notes = {
  orders: `Each block combines a base-first pair and a head-first pair. Student t intervals estimate the mean log ratio after 3, 6, 12 and at most 24 blocks. A workload passes when the upper bound is below ${slowdownPercent}% and fails when the lower bound reaches that limit. An interval crossing the limit remains inconclusive and blocks CI. The displayed 95% intervals apply to each sampling stage.`,
  callback: 'Callback time includes Koa middleware and response handling. Request setup, response checks and network I/O are outside the timed batch.',
  memory: 'Peak RSS includes Node, Koa and fixture setup in the benchmark worker. Memory is informational.',
  parse: 'Parse time is the median of per-parse batch averages.',
  coverage: 'Comparable workloads must pass. Inconclusive or missing verdicts block CI. Confirmed fixture mismatches in the proposed harness are explicitly counted as exemptions when only head supports the fixture.',
  release: 'The release column averages two samples of the pinned release. Drift against that release is informational.',
  bootstrap: 'Both revisions were timed with the proposed benchmark harness, fixtures and settings.',
  mergedHarness: 'Both revisions were timed with the merged benchmark fixtures and workload settings.',
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
  evidence: (status, conclusive, total, { pass, fail, inconclusive, exempt = 0 }) => {
    const exemption = exempt ? `, ${exempt} exempt` : ''
    const message = `${status} — ${conclusive}/${total} conclusive (${pass} passed, ${fail} failed, ${inconclusive} inconclusive${exemption})`
    return message
  },
  warning: (metric, workload) => `::warning::Inconclusive ${metric} for ${workload}`,
  releaseUnavailable: (version, workload) => `::warning::koa@${version} measurement unavailable for ${workload}. See report.json for the error.`
}

const errors = {
  baseline: 'Provide a baseline checkout: npm run bench -- <base> [head]. Use . . for a same-checkout control.',
  configuration: details => `Invalid benchmark configuration: ${details}`,
  benchmark: name => `Unknown benchmark: ${name}`,
  component: name => `Unknown component: ${name}`,
  sampleMetrics: name => `${name} sample metrics`,
  invalidMetric: (name, key) => `${name}: invalid ${key}`,
  middlewareDepth: 'Expected a non-negative middleware depth',
  querySize: 'Expected a positive query size',
  queryKind: 'Unknown query kind'
}

class FixtureMismatch extends Error {}

module.exports = { FixtureMismatch, slowdownPercent, metrics, memoryLabel, labels, columns, notes, messages, errors }
