
var koa = require('..');
var fs = require('co-fs');
var app = koa();

// read docs/*.md in parallel
// and return a joined response

app.use(function *(){
  var paths = yield fs.readdir('docs');

  var files = yield paths.map(function(path){
    return fs.readFile('docs/' + path, 'utf8');
  });

  this.type = 'markdown';
  this.body = files.join('');
});

app.listen(3000);
