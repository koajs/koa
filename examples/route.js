
var http = require('http');
var koa = require('..');
var app = koa();

var data;

// logger

app.use(function(next){
  return function *(){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
  }
});

// response

app.use(get('/', function *(){
  if (data) {
    this.body = data;
  } else {
    this.body = 'POST to /';
  }
}));

app.use(post('/', function *(){
  data = yield buffer(this);
  this.status = 201;
  this.body = 'created';
}));

function buffer(ctx) {
  return function(done){
    var buf = '';

    ctx.req.setEncoding('utf8');
    ctx.req.on('data', function(chunk){
      buf += chunk;
    });

    ctx.req.on('end', function(){
      done(null, buf);
    });
  };
}

function get(path, fn) {
  return route('GET', path, fn);
}

function post(path, fn) {
  return route('POST', path, fn);
}

function route(method, path, fn) {
  return function(next){
    return function *() {
      var match = method == this.method && this.path == path;
      if (match) return yield fn;
      yield next;
    }
  }
}

app.listen(3000);
