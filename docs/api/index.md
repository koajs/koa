## Application

  A Koa application is not a 1-to-1 representation of an HTTP server,
  as one or more Koa applications may be mounted together to form larger
  applications, with a single HTTP server.

  The following is a useless Koa application bound to port `3000`:

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

  This means you can spin up the same application as both HTTP and HTTPS,
  or on multiple addresses:

```js
var http = require('http');
var koa = require('koa');
var app = koa();
http.createServer(app.callback()).listen(3000);
http.createServer(app.callback()).listen(3001);
```

### Settings

  Application settings are properties on the `app` instance, currently
  the following are supported:

  - `app.name` optionally give your application a name
  - `app.env` defaulting to the __NODE_ENV__ or "development"
  - `app.proxy` when true proxy header fields will be trusted
  - `app.subdomainOffset` offset of `.subdomains` to ignore [2]
  - `app.jsonSpaces` default JSON response spaces [2]
  - `app.outputErrors` output err.stack to stderr [false in "test" environment]

### app.listen(...)

  Create and return an HTTP server, passing the given arguments to
  `Server#listen()`. These arguments are documented on [nodejs.org](http://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback).

### app.callback()

  Return a callback function suitable for the `http.createServer()`
  method to handle a request.

### app.use(function)

  Add the given middleware function to this application. See [Middleware](#middleware) for
  more information.

## Handling Requests

  Koa requests are manipulated using a `Context` object containing both a Koa `Request` and `Response` object. For more information on these view:

  - [Context](context.md)
  - [Request](request.md)
  - [Response](response.md)

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
app.on('error', function(err){
  log.error('server error', err);
});
```

  When an error occurs _and_ it is still possible to respond to the client, aka no data has been written to the socket, Koa will respond
  appropriately with a 500 "Internal Server Error". In either case
  an app-level "error" is emitted for logging purposes. 

## Notes

### HEAD Support

  Koa's upstream response middleware supports __HEAD__ for you,
  however expensive requests would benefit from custom handling. For
  example instead of reading a file into memory and piping it to the
  client, you may wish to `stat()` and set the `Content-*` header fields
  appropriately to bypass the read. 

### Socket Errors

  Node http servers emit a "clientError" event when a socket error occurs. You'll probably want to delegate this to your
  Koa handler by doing the following, in order to centralize
  logging:

```js
var app = koa();
var srv = app.listen(3000);
srv.on('clientError', function(err){
  app.emit('error', err);
});
```

# License

  MIT
