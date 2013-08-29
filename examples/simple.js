
var http = require('http');
var koa = require('..');
var app = koa();

// x-response-time

app.use(function(next){
  return function *responseTime(){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    this.set('X-Response-Time', ms + 'ms');
  }
});

// logger

app.use(function(next){
  return function *logger(){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
  }
});

// content-length

app.use(function(next){
  return function *contentLength(){
    yield next;
    if (!this.body) return;
    this.set('Content-Length', Buffer.byteLength(this.body));
  }
});

// custom 404 handler

app.use(function(next){
  return function *notfound(){
    yield next;
    if (this.body) return;
    this.status = 404;
    this.body = 'Sorry! No luck';
  }
});

// response

app.use(function(next){
  return function *response(){
    yield next;
    if ('/' != this.url) return;
    this.body = 'Hello World';
  }
});

app.listen(3000);
