
'use strict';

const http = require('http');
const Koa = require('..');
const app = new Koa();

// number of middleware

let n = parseInt(process.env.MW || '1', 10);
console.log(`  ${n} middleware`);

while (n--) {
  app.use(function *(ctx, next){
    yield next();
  });
}

const body = new Buffer('Hello World');

app.use(function *(ctx, next){
  yield next();
  this.body = body;
});

app.listen(3333);
