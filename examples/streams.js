
var koa = require('..');
var fs = require('fs');
var app = koa();

// try GET /streams.js

app.use(function *(){
  var path = __dirname + this.path;
  this.body = fs.createReadStream(path);
});

app.listen(3000);
