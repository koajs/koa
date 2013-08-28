
var http = require('http');
var koa = require('..');
var app = koa();

// x-response-time

app.use(function(next){
  return function *(){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    this.set('X-Response-Time', ms + 'ms');
  }
});

// logger

app.use(function(next){
  return function *(){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
  }
});

// content-length

app.use(function(next){
  return function *(){
    yield next;
    this.set('Content-Length', Buffer.byteLength(this.body));
  }
});

// response

app.use(function(next){
  return function *(){
    yield next;
    if ('/' != this.url) return;
    this.status = 200;
    this.body = 'Hello World';
  }
});

// custom 404 handler

app.use(function(next){
  return function *(){
    yield next;
    this.status = 404;
    this.body = 'Sorry cannot find that!';
    console.log(this);
  }
});

app.listen(3000);
