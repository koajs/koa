
var zlib = require('zlib');
var koa = require('..');
var fs = require('fs');
var app = koa();

// ignore favicons

app.use(function(next){
  return function *(){
    if ('/favicon.ico' == this.path) this.status = 404;
    yield next;
  }
});

// logger

app.use(function(next){
  return function *(){
    console.log('%s %s', this.method, this.url);
    yield next;
  }
});

// stream a file

app.use(function(next){
  return function *(){
    var path = __dirname + this.path;
    var exists = yield isFile(path);

    if (!exists) return yield next;

    this.body = fs.createReadStream(path);
    yield next;
  }
});

// gzip the response

app.use(function(next){
  return function *(){
    var body = this.body;

    if (!body || !body.readable) return yield next;

    var gzip = zlib.createGzip();
    this.set('Content-Encoding', 'gzip');
    this.body = gzip;
    body.pipe(gzip);

    yield next;
  }
});

app.listen(3000);

/**
 * Stat regular file helper.
 */

function isFile(file) {
  return function(done){
    fs.stat(file, function(err, stat){
      if (err && 'ENOENT' == err.code) return done(null, false);
      if (err) return done(err);
      done(null, stat.isFile());
    });
  }
}