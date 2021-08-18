# Response

  A Koa `Response` object is an abstraction on top of node's vanilla response object,
  providing additional functionality that is useful for every day HTTP server
  development.

## API

### response.header

  Response header object.

### response.headers

  Response header object. Alias as `response.header`.


### response.socket

  Response socket. Points to net.Socket instance as `request.socket`.

### response.status

  Get response status. By default, `response.status` is set to `404` unlike node's `res.statusCode` which defaults to `200`.

### response.status=

  Set response status via numeric code:

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
  - 208 "already reported"
  - 226 "im used"
  - 300 "multiple choices"
  - 301 "moved permanently"
  - 302 "found"
  - 303 "see other"
  - 304 "not modified"
  - 305 "use proxy"
  - 307 "temporary redirect"
  - 308 "permanent redirect"
  - 400 "bad request"
  - 401 "unauthorized"
  - 402 "payment required"
  - 403 "forbidden"
  - 404 "not found"
  - 405 "method not allowed"
  - 406 "not acceptable"
  - 407 "proxy authentication required"
  - 408 "request timeout"
  - 409 "conflict"
  - 410 "gone"
  - 411 "length required"
  - 412 "precondition failed"
  - 413 "payload too large"
  - 414 "uri too long"
  - 415 "unsupported media type"
  - 416 "range not satisfiable"
  - 417 "expectation failed"
  - 418 "I'm a teapot"
  - 422 "unprocessable entity"
  - 423 "locked"
  - 424 "failed dependency"
  - 426 "upgrade required"
  - 428 "precondition required"
  - 429 "too many requests"
  - 431 "request header fields too large"
  - 500 "internal server error"
  - 501 "not implemented"
  - 502 "bad gateway"
  - 503 "service unavailable"
  - 504 "gateway timeout"
  - 505 "http version not supported"
  - 506 "variant also negotiates"
  - 507 "insufficient storage"
  - 508 "loop detected"
  - 510 "not extended"
  - 511 "network authentication required"

__NOTE__: don't worry too much about memorizing these strings,
if you have a typo an error will be thrown, displaying this list
so you can make a correction.

  Since `response.status` default is set to `404`, to send a response
  without a body and with a different status is to be done like this:

```js
ctx.response.status = 200;

// Or whatever other status
ctx.response.status = 204;
```

### response.message

  Get response status message. By default, `response.message` is
  associated with `response.status`.

### response.message=

  Set response status message to the given value.

### response.length=

  Set response Content-Length to the given value.

### response.length

  Return response Content-Length as a number when present, or deduce
  from `ctx.body` when possible, or `undefined`.

### response.body

  Get response body.

### response.body=

  Set response body to one of the following:

  - `string` written
  - `Buffer` written
  - `Stream` piped
  - `Object` || `Array` json-stringified
  - `null` || `undefined` no content response

If `response.status` has not been set, Koa will automatically set the status to `200` or `204` depending on `response.body`. Specifically, if `response.body` has not been set or has been set as `null` or `undefined`, Koa will automatically set `response.status` to `204`. If you really want to send no content response with other status, you should override the `204` status as the following way:

```js
// This must be always set first before status, since null | undefined
// body automatically sets the status to 204
ctx.body = null;
// Now we override the 204 status with the desired one
ctx.status = 200;
```


Koa doesn't guard against everything that could be put as a response body -- a function doesn't serialise meaningfully, returning a boolean may make sense based on your application, and while an error works, it may not work as intended as some properties of an error are not enumerable.  We recommend adding middleware in your app that asserts body types per app.  A sample middleware might be:

```js
app.use(async (ctx, next) => {
  await next()

  ctx.assert.equal('object', typeof ctx.body, 500, 'some dev did something wrong')
})
```

#### String

  The Content-Type is defaulted to text/html or text/plain, both with
  a default charset of utf-8. The Content-Length field is also set.

#### Buffer

  The Content-Type is defaulted to application/octet-stream, and Content-Length
  is also set.

#### Stream

  The Content-Type is defaulted to application/octet-stream.

  Whenever a stream is set as the response body, `.onerror` is automatically added as a listener to the `error` event to catch any errors.
  In addition, whenever the request is closed (even prematurely), the stream is destroyed.
  If you do not want these two features, do not set the stream as the body directly.
  For example, you may not want this when setting the body as an HTTP stream in a proxy as it would destroy the underlying connection.

  See: https://github.com/koajs/koa/pull/612 for more information.

  Here's an example of stream error handling without automatically destroying the stream:

```js
const PassThrough = require('stream').PassThrough;

app.use(async ctx => {
  ctx.body = someHTTPStream.on('error', (err) => ctx.onerror(err)).pipe(PassThrough());
});
```

#### Object

  The Content-Type is defaulted to application/json. This includes plain objects `{ foo: 'bar' }` and arrays `['foo', 'bar']`.

### response.get(field)

  Get a response header field value with case-insensitive `field`.

```js
const etag = ctx.response.get('ETag');
```

### response.has(field)

  Returns `true` if the header identified by name is currently set in the outgoing headers.
  The header name matching is case-insensitive.

```js
const rateLimited = ctx.response.has('X-RateLimit-Limit');
```

### response.set(field, value)

  Set response header `field` to `value`:

```js
ctx.set('Cache-Control', 'no-cache');
```

### response.append(field, value)
  Append additional header `field` with value `val`.

```js
ctx.append('Link', '<http://127.0.0.1/>');
```

### response.set(fields)

  Set several response header `fields` with an object:

```js
ctx.set({
  'Etag': '1234',
  'Last-Modified': date
});
```

This delegates to [setHeader](https://nodejs.org/dist/latest/docs/api/http.html#http_request_setheader_name_value) which sets or updates headers by specified keys and doesn't reset the entire header.

### response.remove(field)

  Remove header `field`.

### response.type

  Get response `Content-Type` void of parameters such as "charset".

```js
const ct = ctx.type;
// => "image/png"
```

### response.type=

  Set response `Content-Type` via mime string or file extension.

```js
ctx.type = 'text/plain; charset=utf-8';
ctx.type = 'image/png';
ctx.type = '.png';
ctx.type = 'png';
```

  Note: when appropriate a `charset` is selected for you, for
  example `response.type = 'html'` will default to "utf-8". If you need to overwrite `charset`,
  use `ctx.set('Content-Type', 'text/html')` to set response header field to value directly.

### response.is(types...)

  Very similar to `ctx.request.is()`.
  Check whether the response type is one of the supplied types.
  This is particularly useful for creating middleware that
  manipulate responses.

  For example, this is a middleware that minifies
  all HTML responses except for streams.

```js
const minify = require('html-minifier');

app.use(async (ctx, next) => {
  await next();

  if (!ctx.response.is('html')) return;

  let body = ctx.body;
  if (!body || body.pipe) return;

  if (Buffer.isBuffer(body)) body = body.toString();
  ctx.body = minify(body);
});
```

### response.redirect(url, [alt])

  Perform a [302] redirect to `url`.

  The string "back" is special-cased
  to provide Referrer support, when Referrer
  is not present `alt` or "/" is used.

```js
ctx.redirect('back');
ctx.redirect('back', '/index.html');
ctx.redirect('/login');
ctx.redirect('http://google.com');
```

  To alter the default status of `302`, simply assign the status
  before or after this call. To alter the body, assign it after this call:

```js
ctx.status = 301;
ctx.redirect('/cart');
ctx.body = 'Redirecting to shopping cart';
```

### response.attachment([filename], [options])

  Set `Content-Disposition` to "attachment" to signal the client
  to prompt for download. Optionally specify the `filename` of the
  download and some [options](https://github.com/jshttp/content-disposition#options).

### response.headerSent

  Check if a response header has already been sent. Useful for seeing
  if the client may be notified on error.

### response.lastModified

  Return the `Last-Modified` header as a `Date`, if it exists.

### response.lastModified=

  Set the `Last-Modified` header as an appropriate UTC string.
  You can either set it as a `Date` or date string.

```js
ctx.response.lastModified = new Date();
```

### response.etag=

  Set the ETag of a response including the wrapped `"`s.
  Note that there is no corresponding `response.etag` getter.

```js
ctx.response.etag = crypto.createHash('md5').update(ctx.body).digest('hex');
```

### response.vary(field)

  Vary on `field`.

### response.flushHeaders()

  Flush any set headers, and begin the body.
