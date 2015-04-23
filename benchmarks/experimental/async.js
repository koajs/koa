
var http = require('http');
var koa = require('../..');
var app = koa();

app.experimental = true;

// number of middleware

var n = parseInt(process.env.MW || '1', 10);
console.log('  %s async middleware', n);

while (n--) {
  app.use(async function (next){
    await next;
  });
}

var body = new Buffer('Hello World');

app.use(async function (next){
  await next;
  this.body = body;
});

app.listen(3333);
