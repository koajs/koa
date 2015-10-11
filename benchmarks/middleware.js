
'use strict';

const http = require('http');
const koa = require('..');
const app = koa();

// number of middleware

const n = parseInt(process.env.MW || '1', 10);
console.log('  %s middleware', n);

while (n--) {
  app.use(function *(next){
    yield *next;
  });
}

const body = new Buffer('Hello World');

app.use(function *(next){
  yield *next;
  this.body = body;
});

app.listen(3333);
