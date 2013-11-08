
var koa = require('..');
var app = koa();

// logger

function *logger(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
}

// sometimes it's useful to apply some
// ad-hoc logic to enable middleware, for
// example ignoring a logger on asset requests:

app.use(function *(next){
  if (/(\.js|\.css|\.ico)$/.test(this.path)) {
    yield next;
  } else {
    this.body = 'Hello World';
    yield logger(next);
  }
});

app.listen(3000);
