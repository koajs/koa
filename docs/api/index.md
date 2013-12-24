# Application

  A Koa application is an object containing an array of middleware generator functions
  which are composed and executed in a stack-like manner upon request. Koa is similar to many
  other middleware systems that you may have encountered such as Ruby's Rack, Connect, and so on -
  however a key design decision was made to provide high level "sugar" at the otherwise low-level
  middleware layer. This improves interoperability, robustness, and makes writing middleware much
  more enjoyable.

  This includes methods for common tasks like content-negotation, cache freshness, proxy support, and redirection
  among others. Despite supplying a reasonably large number of helpful methods Koa maintains a small footprint, as
  no middleware are bundled.

  The obligatory hello world application:

```js
var koa = require('koa');
var app = koa();

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);
```

## Cascading

  Koa middleware cascade in a more traditional way as you may be used to with similar tools -
  this was previously difficult to make user friendly with node's use of callbacks.
  However with generators we can achieve "true" middleware. Contrasting Connect's implementation which
  simply passes control through series of functions until one returns, Koa yields "downstream", then
  control flows back "upstream".

  The following example responds with "Hello World", however first the request flows through
  the `x-response-time` and `logging` middleware to mark when the request started, then continue
  to yield control through the to the response middleware. When a middleware invokes `yield next`
  the function suspends and passes control to the next middleware defined. After there are no more
  middleware to execute downstream, the stack will unwind and each middleware is resumed to perform
  its upstream behaviour.

```js
var koa = require('koa');
var app = koa();

// x-response-time

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});

// logger

app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  console.log('%s %s - %s', this.method, this.url, ms);
});

// response

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);
```

## Settings

  Application settings are properties on the `app` instance, currently
  the following are supported:

  - `app.name` optionally give your application a name
  - `app.env` defaulting to the __NODE_ENV__ or "development"
  - `app.proxy` when true proxy header fields will be trusted
  - `app.subdomainOffset` offset of `.subdomains` to ignore [2]
  - `app.jsonSpaces` default JSON response spaces [2]
  - `app.outputErrors` output err.stack to stderr [false in "test" environment]

## app.listen(...)

  A Koa application is not a 1-to-1 representation of a HTTP server.
  One or more Koa applications may be mounted together to form larger
  applications with a single HTTP server.

  Create and return an HTTP server, passing the given arguments to
  `Server#listen()`. These arguments are documented on [nodejs.org](http://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback). The following is a useless Koa application bound to port `3000`:

```js
var koa = require('koa');
var app = koa();
app.listen(3000);
```

  The `app.listen(...)` method is simply sugar for the following:

```js
var http = require('http');
var koa = require('koa');
var app = koa();
http.createServer(app.callback()).listen(3000);
```

  This means you can spin up the same application as both HTTP and HTTPS
  or on multiple addresses:

```js
var http = require('http');
var koa = require('koa');
var app = koa();
http.createServer(app.callback()).listen(3000);
http.createServer(app.callback()).listen(3001);
```

## app.callback()

  Return a callback function suitable for the `http.createServer()`
  method to handle a request.
  You may also use this callback function to mount your koa app in a
  Connect/Express app.

## app.use(function)

  Add the given middleware function to this application. See [Middleware](https://github.com/koajs/koa/wiki#middleware) for
  more information.

## app.keys=

 Set signed cookie keys.

 These are passed to [KeyGrip](https://github.com/jed/keygrip),
 however you may also pass your own `KeyGrip` instance. For
 example the following are acceptable:

```js
app.keys = ['im a newer secret', 'i like turtle'];
app.keys = new KeyGrip(['im a newer secret', 'i like turtle'], 'sha256');
```

  These keys may be rotated and are used when signing cookies
  with the `{ signed: true }` option:

```js
this.cookies.set('name', 'tobi', { signed: true });
```

## Error Handling

  By default outputs all errors to stderr unless __NODE_ENV__ is "test". To perform custom error-handling logic such as centralized logging you
  can add an "error" event listener:

```js
app.on('error', function(err){
  log.error('server error', err);
});
```

  If an error in the req/res cycle and it is _not_ possible to respond to the client, the `Context` instance is also passed:

```js
app.on('error', function(err, ctx){
  log.error('server error', err, ctx);
});
```

  When an error occurs _and_ it is still possible to respond to the client, aka no data has been written to the socket, Koa will respond
  appropriately with a 500 "Internal Server Error". In either case
  an app-level "error" is emitted for logging purposes.

