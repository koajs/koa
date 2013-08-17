
var compose = require('koa-compose');
var http = require('http');
var koa = require('..');
var app = koa();
var calls = [];

// x-response-time

function responseTime(){
  return function responseTime(next){
    return function *(){
      var start = new Date;
      yield next;
      var ms = new Date - start;
      this.set('X-Response-Time', ms + 'ms');
    }
  }
}

// logger

function logger(){
  return function logger(next){
    return function *(){
      var start = new Date;
      yield next;
      var ms = new Date - start;
      console.log('%s %s - %s', this.method, this.url, ms);
    }
  }
}

// response

function respond() {
  return function respond(next){
    return function *(){
      yield next;
      if ('/' != this.url) return;
      this.body = 'Hello World';
    }
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

http.createServer(app.callback()).listen(3000);
