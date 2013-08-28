
var http = require('http');
var koa = require('..');
var app = koa();

// look ma, error propagation!

app.use(function(next){
  return function *(){
    try {
      yield next;
    } catch (err) {
      // some errors will have .status
      // however this is not a guarantee
      this.status = err.status || 500;
      this.type = 'html';
      this.body = '<p>Something <em>exploded</em>, please contact Maru.</p>';
    
      // since we handled this manually we'll
      // want to delegate to the regular app
      // level error handling as well so that
      // centralized still functions correctly.
      this.app.emit('error', err);
    }
  }
});

// response

app.use(function(next){
  return function *(){
    throw new Error('boom boom');
  }
});

// error handler

app.on('error', function(err){
  console.log('sent error %s to the cloud', err.message);
});

app.listen(3000);
