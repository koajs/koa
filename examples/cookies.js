
var koa = require('..');
var app = koa();

app.use(function *(){
  if ('/favicon.ico' == this.path) return;
  var n = ~~this.cookies.get('view') || 1;
  this.cookies.set('view', n + 1);
  this.body = n + ' views';
});

app.listen(3000);
console.log('listening on port 3000');