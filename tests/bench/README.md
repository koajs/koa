# Koa benchmarks

Performance benchmarks belong in `tests/bench/`. The first planned workload measures HTTP requests per second as the middleware stack grows. Each case sends the same GET and returns the same fixed body. [Koa’s middleware benchmark](https://github.com/koajs/koa/tree/3bc78647595b3032583e983ff367bc734ce0dc21/benchmarks)

## Adding cases

The planned suite uses two files in this directory. `cases.json` holds workload parameters such as middleware depths and query sizes. `cases.schema.json` defines the accepted fields and values. Adding a depth to an existing workload takes one edit to `cases.json`. A new operation to measure gets its own JavaScript fixture.

Validate the configuration before starting the server or timer. Test the helpers with `*.test.js` files that run under `npm test`. For example, a misspelled field should produce an error naming that field, and a query fixture configured for 128 repeated parameters should generate exactly 128 values for the same key. [Koa’s parser benchmark cases](https://github.com/koajs/koa/pull/2043)

## Comparing revisions

The planned command for timed workloads is `npm run bench`. Run the same cases on the PR base and head with the same Node version, machine, and load settings. Warm up each revision and report repeated samples for each case so reviewers can see ordinary variation. [Node core’s benchmark guide](https://github.com/nodejs/node/blob/main/doc/contributing/writing-and-running-benchmarks.md#comparing-nodejs-versions)
