
var compose = require('koa-compose');
var koa = require('..');
var app = koa();

// x-response-time

function responseTime(){
  return function *responseTime(next){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    this.set('X-Response-Time', ms + 'ms');
  }
}

// logger

function logger(){
  return function* logger(next){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
  }
}

// response

function respond() {
  return function* respond(next){
    yield next;
    if ('/' != this.url) return;
    this.body = 'Hello World';
  }
}

// composed middleware

function all() {
  return compose([
    responseTime(),
    logger(),
    respond()
  ]);
}

app.use(all());

app.listen(3000);
