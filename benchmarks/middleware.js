
var http = require('http');
var koa = require('..');
var app = koa();

// number of middleware

var n = parseInt(process.env.MW || '1', 10);
console.log('  %s middleware', n);

while (n--) {
  app.use(function(next){
    return function *(){
      yield next;
    }
  });
}

var body = new Buffer('Hello World');

app.use(function(next){
  return function *(){
    yield next;
    this.body = body;
  }
});

http.createServer(app.callback()).listen(3000);
