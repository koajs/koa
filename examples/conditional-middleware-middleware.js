
var http = require('http');
var koa = require('..');
var app = koa();

// logger

function logger(next){
  return function *(){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
  }
}

// passing any middleware to this middleware
// will make it conditional, and will not be used
// when an asset is requested. This is a modular
// approach to conditiona-middleware.js

function ignoreAssets(mw) {
  return function(next){
    return function *(){
      if (/(\.js|\.css|\.ico)$/.test(this.path)) {
        yield next;
      } else {
        yield mw(next);
      }
    }
  }
}

app.use(ignoreAssets(logger));

// sometimes it's useful to apply some
// ad-hoc logic to enable middleware, for
// example ignoring a logger on asset requests:

app.use(function(next){
  return function *(){
    this.body = 'Hello World';
  }
});

app.listen(3000);
