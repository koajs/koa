
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

  - `app.env` defaulting to the __NODE_ENV__ or "development"
  - `app.proxy` when true proxy header fields will be trusted
  - `app.subdomainOffset` offset of `.subdomains` to ignore [2]
  - `app.jsonSpaces` default JSON response spaces [2]
  - `app.outputErrors` output err.stack to stderr [true in "development"]

### app.listen(...)

  Create and return an HTTP server, passing the given arguments to
  `Server#listen()`. These arguments are documented on [nodejs.org](http://nodejs.org/api/http.html#http_server_listen_port_hostname_backlog_callback).

### app.callback()

  Return a callback function suitable for the `http.createServer()`
  method to handle a request.

### app.use(function)

  Add the given middleware function to this application. See [Middleware](#middleware) for
  more information.

### app.context(obj)

  Each `Application` has its own `Context` instance, meaning you may extend the prototype of one,
  and the other will remain untouched with the default prototype. To extend an app's context you may
  invoke `app.context()` any number of times with an object of extensions:

```js
app.context({
  get something(){
    return 'hi';
  },

  set something(val){
    this._something = val;
  },

  render: function(){
    this.body = '<html></html>';
  }
});
```

## Context

  A Koa Context encapsulates node's `request` and `response` objects
  into a single object which provides many helpful methods for writing
  web applications and APIs.

  These operations are used so frequently in HTTP server development
  that they are added at this level, instead of a higher level framework,
  which would force middlware to re-implement this common functionality.

  A `Context` is created _per_ request, and is referenced in middleware 
  as the receiver, or the `this` variable.

### ctx.req

  Node's `request` object.

### ctx.res
 
  Node's `response` object.

### ctx.app

  Application instance reference.

### ctx.header

 Request header object.

### ctx.responseHeader

 Response header object.

### ctx.method

  Request method.

### ctx.method=

  Set request method, useful for implementing middleware
  such as `methodOverride()`.

### ctx.status

  Get response status.

### ctx.status=

  Set response status via numeric code or string:

  - 100 "continue"
  - 101 "switching protocols"
  - 102 "processing"
  - 200 "ok"
  - 201 "created"
  - 202 "accepted"
  - 203 "non-authoritative information"
  - 204 "no content"
  - 205 "reset content"
  - 206 "partial content"
  - 207 "multi-status"
  - 300 "multiple choices"
  - 301 "moved permanently"
  - 302 "moved temporarily"
  - 303 "see other"
  - 304 "not modified"
  - 305 "use proxy"
  - 307 "temporary redirect"
  - 400 "bad request"
  - 401 "unauthorized"
  - 402 "payment required"
  - 403 "forbidden"
  - 404 "not found"
  - 405 "method not allowed"
  - 406 "not acceptable"
  - 407 "proxy authentication required"
  - 408 "request time-out"
  - 409 "conflict"
  - 410 "gone"
  - 411 "length required"
  - 412 "precondition failed"
  - 413 "request entity too large"
  - 414 "request-uri too large"
  - 415 "unsupported media type"
  - 416 "requested range not satisfiable"
  - 417 "expectation failed"
  - 418 "i'm a teapot"
  - 422 "unprocessable entity"
  - 423 "locked"
  - 424 "failed dependency"
  - 425 "unordered collection"
  - 426 "upgrade required"
  - 428 "precondition required"
  - 429 "too many requests"
  - 431 "request header fields too large"
  - 500 "internal server error"
  - 501 "not implemented"
  - 502 "bad gateway"
  - 503 "service unavailable"
  - 504 "gateway time-out"
  - 505 "http version not supported"
  - 506 "variant also negotiates"
  - 507 "insufficient storage"
  - 509 "bandwidth limit exceeded"
  - 510 "not extended"
  - 511 "network authentication required"

  __NOTE__: don't worry too much about memorizing these strings,
  if you have a typo an error will be thrown, displaying this list
  so you can make a correction.

### ctx.length

  Return request Content-Length as a number when present, or undefined.

### ctx.responseLength

  Return response Content-Length as a number when present, or deduce
  from `ctx.body` when possible, or undefined.

### ctx.body

  Get response body. When `ctx.body` is `null` and `ctx.status` is still
  200 it is considered a 404. This is to prevent the developer from manually
  specifying `this.status = 200` on every response.

### ctx.body=

  Set response body to one of the following:

  - `string` written
  - `Buffer` written
  - `Stream` piped
  - `Object` json stringified

  When a Koa application is created it injects
  a middleware named `respond`, which handles
  each of these `ctx.body` values. The `Content-Length`
  header field is set when possible, and objects are 
  passed through `JSON.stringify()`.

  To alter the JSON response formatting use the `app.jsonSpaces`
  setting, for example to compress JSON responses set:

```js
app.jsonSpaces = 0;
```

### ctx.get(field)

  Get a request header field value with case-insensitive `field`.

```js
var etag = this.get('If-None-Match');
```

### ctx.set(field, value)

  Set response header `field` to `value`:

```js
this.set('Cache-Control', 'no-cache');
```

### ctx.set(fields)

  Set several response header `fields` with an object:

```js
this.set({
  'Etag': '1234',
  'Last-Modified': date
});
```

### ctx.type

  Get request `Content-Type` void of parameters such as "charset".

```js
var ct = this.type;
// => "image/png"
``` 

### ctx.type=

  Set response `Content-Type` via mime string or file extension.

```js
this.type = 'image/png';
this.type = '.png';
this.type = 'png';
```

  __NOTE__: when `ctx.body` is an object the content-type is set for you.

### ctx.url

  Get request URL.

### ctx.url=

  Set request URL, useful for url rewrites.

### ctx.path

  Get request pathname.

### ctx.path=

  Set request pathname and retain query-string when present.

### ctx.query
 
  Get parsed query-string using [qs](https://github.com/visionmedia/node-querystring). For example with the url "/shoes?page=2&sort=asc&filters[color]=blue"
  `this.query` would be the following object:

```js
{
  page: '2',
  sort: 'asc',
  filters: {
    color: 'blue'
  }
}
```

  __NOTE__: this property returns `{}` when no query-string is present.

### ctx.query=

  Set query-string to the given object.

```js
this.query = { next: '/login' };
```

### ctx.querystring

  Get raw query string void of `?`.

### ctx.querystring=

  Set raw query string.

### ctx.host

  Get host void of port number when present. Supports `X-Forwarded-Host`
  when `app.proxy` is __true__, otherwise `Host` is used.

### ctx.fresh

  Check if a request cache is "fresh", aka the contents have not changed. This
  method is for cache negotiation between `If-None-Match` / `ETag`, and `If-Modified-Since` and `Last-Modified`. It should be referenced after setting one or more of these response headers.

```js
this.set('ETag', '123');

// cache is ok
if (this.fresh) {
  this.status = 304;
  return;
} 

// cache is stale
// fetch new data
this.body = yield db.find('something');
```

### ctx.stale

  Inverse of `ctx.fresh`.

### ctx.protocol

  Return request protocol, "https" or "http". Supports `X-Forwarded-Proto`
  when `app.proxy` is __true__.

### ctx.secure

  Shorthand for `this.protocol == "https"` to check if a requset was
  issued via TLS.

### ctx.ip

  Request remote address. Supports `X-Forwarded-For` when `app.proxy`
  is __true__.

### ctx.ips

  When `X-Forwarded-For` is present and `app.proxy` is enabled an array
  of these ips is returned, ordered from upstream -> downstream. When disabled
  an empty array is returned.

### ctx.subdomains

  Return subdomains as an array.
  
  Subdomains are the dot-separated parts of the host before the main domain of
  the app. By default, the domain of the app is assumed to be the last two
  parts of the host. This can be changed by setting `app.subdomainOffset`.
  
  For example, if the domain is "tobi.ferrets.example.com":
  If `app.subdomainOffset` is not set, this.subdomains is `["ferrets", "tobi"]`.
  If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.

### ctx.is(type)
 
  Check if the incoming request contains the `Content-Type`
  header field, and it contains the give mime `type`.
  
```js  
// With Content-Type: text/html; charset=utf-8
this.is('html');
this.is('.html');
this.is('text/html');
this.is('text/*');
// => true

// When Content-Type is application/json
this.is('json');
this.is('.json');
this.is('application/json');
this.is('application/*');
// => true

this.is('html');
// => false
```

### ctx.redirect(url, [alt])

  Perform a 302 redirect to `url`.
  
  The string "back" is special-cased
  to provide Referrer support, when Referrer
  is not present `alt` or "/" is used.
  
```js  
this.redirect('back');
this.redirect('back', '/index.html');
this.redirect('/login');
this.redirect('http://google.com');
```

  To alter the default status of `302` or the response
  body simply re-assign after this call:

```js
this.redirect('/cart');
this.status = 301;
this.body = 'Redirecting to shopping cart';
```

### ctx.attachment([filename])

  Set `Content-Disposition` to "attachment" to signal the client
  to prompt for download. Optionally specify the `filename` of the
  download.

### ctx.accept(types)

  Check if the given `type(s)` is acceptable, returning
  the best match when true, otherwise `undefined`, in which
  case you should respond with 406 "Not Acceptable".
  
  The `type` value may be one or more mime type string
  such as "application/json", the extension name
  such as "json", or an array `["json", "html", "text/plain"]`. When a list or array is given the _best_ match, if any is returned.
  
```js  
// Accept: text/html
this.accepts('html');
// => "html"

// Accept: text/*, application/json
this.accepts('html');
// => "html"
this.accepts('text/html');
// => "text/html"
this.accepts('json', 'text');
// => "json"
this.accepts('application/json');
// => "application/json"

// Accept: text/*, application/json
this.accepts('image/png');
this.accepts('png');
// => undefined

// Accept: text/*;q=.5, application/json
this.accepts(['html', 'json']);
this.accepts('html', 'json');
// => "json"
```

  You may call `this.accepts()` as may times as you like,
  or use a switch:

```js
switch (this.accepts('json', 'html', 'text')) {
  case 'json': break;
  case 'html': break;
  case 'text': break;
}
```

### ctx.accepted

  Return accepted mime types ordered by quality.

### ctx.acceptedEncodings

  Return accepted content encodings ordered by quality.

### ctx.acceptedCharsets

  Return accepted charsets ordered by quality.

### ctx.acceptedLanguages

  Return accepted languages ordered by quality.

### ctx.headerSent

  Check if a response header has already been sent. Useful for seeing
  if the client may be notified on error.

### ctx.socket

  Request socket object.

## Notes

### HEAD support

  Koa's upstream response middleware supports __HEAD__ for you,
  however expensive requests would benefit from custom handling. For
  example instead of reading a file into memory and piping it to the
  client, you may wish to `stat()` and set the `Content-*` header fields
  appropriately to bypass the read. 

# License

  MIT
