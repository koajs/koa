
'use strict';

const Koa = require('..');
const app = new Koa();

// number of middleware

let n = parseInt(process.env.MW || '1', 10);
console.log(`  ${n} middleware`);

while (n--) {
  app.use((ctx, next) => next());
}

const body = Buffer.from('Hello World');

app.use((ctx, next) => next().then(() => ctx.body = body));

app.listen(3333);
