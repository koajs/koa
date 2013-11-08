
var koa = require('..');
var app = koa();

// x-response-time

app.use(function *responseTime(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});

// logger

app.use(function *logger(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// content-length

app.use(function *contentLength(next){
  yield next;
  if (!this.body) return;
  this.set('Content-Length', Buffer.byteLength(this.body));
});

// custom 404 handler

app.use(function *notfound(next){
  yield next;
  if (this.body) return;
  this.status = 404;
  this.body = 'Sorry! No luck';
});

// response

app.use(function *response(next){
  yield next;
  if ('/' != this.url) return;
  this.body = 'Hello World';
});

app.listen(3000);
