
'use strict';

const http = require('http');
const koa = require('../..');
const app = koa();

app.experimental = true;

// number of middleware

let n = parseInt(process.env.MW || '1', 10);
console.log(`  ${n} async middleware`);

while (n--) {
  app.use(async function (next){
    await next;
  });
}

const body = new Buffer('Hello World');

app.use(async function (next){
  await next;
  this.body = body;
});

app.listen(3333);
