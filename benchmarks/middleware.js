
'use strict';

const http = require('http');
const Koa = require('..');
const app = new Koa();

// number of middleware

let n = parseInt(process.env.MW || '1', 10);
console.log(`  ${n} middleware`);

while (n--) {
  app.use((ctx, next) => next());
}

const body = new Buffer('Hello World');

app.use((ctx, next) => next().then(() => this.body = body));

app.listen(3333);
