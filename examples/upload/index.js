
/**
 * Module dependencies.
 */

var logger = require('koa-logger');
var serve = require('koa-static');
var parse = require('co-busboy');
var koa = require('../..');
var fs = require('fs');
var app = koa();

// log requests

app.use(logger());

// custom 404

app.use(function *(next){
  yield next;
  if (this.body || !this.idempotent) return;
  this.redirect('/404.html');
});

// serve files from ./public

app.use(serve(__dirname + '/public'));

// handle uploads

app.use(function *(next){
  // ignore non-POSTs
  if ('POST' != this.method) return yield next;

  // multipart upload
  var parser = parse(this);
  var part;

  while (part = yield parser.part()) {
    var stream = fs.createWriteStream('/tmp/' + Math.random());
    part.pipe(stream);
    console.log('uploading %s -> %s', part.filename, stream.path);
  }

  this.redirect('/');
});

// listen

app.listen(3000);
console.log('listening on port 3000');