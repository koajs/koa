
'use strict';

const Koa = require('..');
const app = new Koa();

// number of middleware

let n = parseInt(process.env.MW || '1', 10);
const useAsync = process.env.USE_ASYNC === 'true';

console.log(`  ${n}${useAsync ? ' async' : ''} middleware`);

while (n--) {
  if (useAsync) {
    app.use(async(ctx, next) => next());
  } else {
    app.use((ctx, next) => next());
  }
}

const body = Buffer.from('Hello World');

if (useAsync) {
  app.use(async(ctx, next) => { await next(); ctx.body = body; });
} else {
  app.use((ctx, next) => next().then(() => ctx.body = body));
}

app.listen(3333);
