# Response

  A Koa `Response` object is an abstraction on top of node's vanilla response object,
  providing additional functionality that is useful for every day HTTP server
  development.

## API

### res.header

  Response header object.

### res.socket

  Request socket.

### res.status

  Get response status. By default, `res.status` is not set unlike node's `res.statusCode` which defaults to `200`.

### res.status=

  Set response status via numeric code or case-insensitive string:

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

### res.length=

  Set response Content-Length to the given value.

### res.length

  Return response Content-Length as a number when present, or deduce
  from `res.body` when possible, or `undefined`.

### res.body

  Get response body.

### res.body=

  Set response body to one of the following:

  - `string` written
  - `Buffer` written
  - `Stream` piped
  - `Object` json-stringified
  - `null` no content response

  If `res.status` has not been set, Koa will automatically set the status to `200` or `204`.

#### String

  The Content-Type is defaulted to text/html or text/plain, both with
  a default charset of utf-8. The Content-Length field is also set.

#### Buffer

  The Content-Type is defaulted to application/octet-stream, and Content-Length
  is also set.

#### Stream

  The Content-Type is defaulted to application/octet-stream.

#### Object

  The Content-Type is defaulted to application/json.

### res.get(field)

  Get a response header field value with case-insensitive `field`.

```js
var etag = this.get('ETag');
```

### res.set(field, value)

  Set response header `field` to `value`:

```js
this.set('Cache-Control', 'no-cache');
```

### res.set(fields)

  Set several response header `fields` with an object:

```js
this.set({
  'Etag': '1234',
  'Last-Modified': date
});
```

### res.remove(field)

  Remove header `field`.

### res.type

  Get response `Content-Type` void of parameters such as "charset".

```js
var ct = this.type;
// => "image/png"
```

### res.type=

  Set response `Content-Type` via mime string or file extension.

```js
this.type = 'text/plain; charset=utf-8';
this.type = 'image/png';
this.type = '.png';
this.type = 'png';
```

  Note: when appropriate a `charset` is selected for you, for
  example `res.type = 'html'` will default to "utf-8", however
  when explicitly defined in full as `res.type = 'text/html'`
  no charset is assigned.

### res.redirect(url, [alt])

  Perform a [302] redirect to `url`.

  The string "back" is special-cased
  to provide Referrer support, when Referrer
  is not present `alt` or "/" is used.

```js
this.redirect('back');
this.redirect('back', '/index.html');
this.redirect('/login');
this.redirect('http://google.com');
```

  To alter the default status of `302`, simply assign the status
  before or after this call. To alter the body, assign it after this call:

```js
this.status = 301;
this.redirect('/cart');
this.body = 'Redirecting to shopping cart';
```

### res.attachment([filename])

  Set `Content-Disposition` to "attachment" to signal the client
  to prompt for download. Optionally specify the `filename` of the
  download.

### res.headerSent

  Check if a response header has already been sent. Useful for seeing
  if the client may be notified on error.

### res.lastModified

  Return the `Last-Modified` header as a `Date`, if it exists.

### res.lastModified=

  Set the `Last-Modified` header as an appropriate UTC string.
  You can either set it as a `Date` or date string.

```js
this.response.lastModified = new Date();
```

### res.etag=

  Set the ETag of a response including the wrapped `"`s.
  Note that there is no corresponding `res.etag` getter.

```js
this.response.etag = crypto.createHash('md5').update(this.body).digest('hex');
```

### res.vary(field)

  Vary on `field`.
