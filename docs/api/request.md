# Request

  A Koa `Request` object is an abstraction on top of node's vanilla request object,
  providing additional functionality that is useful for every day HTTP server
  development.

## API

### req.header

 Request header object.

### req.method

  Request method.

### req.method=

  Set request method, useful for implementing middleware
  such as `methodOverride()`.

### req.length

  Return request Content-Length as a number when present, or `undefined`.

### req.url

  Get request URL.

### req.url=

  Set request URL, useful for url rewrites.

### req.path

  Get request pathname.

### req.path=

  Set request pathname and retain query-string when present.

### req.querystring

  Get raw query string void of `?`.

### req.querystring=

  Set raw query string.

### req.search

  Get raw query string with the `?`.

### req.search=

  Set raw query string.

### req.host

  Get host void of port number when present. Supports `X-Forwarded-Host`
  when `app.proxy` is __true__, otherwise `Host` is used.

### req.host=

  Set the `Host` header field to a new value.

### req.type

  Get request `Content-Type` void of parameters such as "charset".

```js
var ct = this.type;
// => "image/png"
```

### req.query

  Get parsed query-string, returning an empty object when no
  query-string is present. Note that this getter does _not_
  support nested parsing.

  For example "color=blue&size=small":

```js
{
  color: 'blue',
  size: 'small'
}
```

### req.query=

  Set query-string to the given object. Note that this
  setter does _not_ support nested objects.

```js
this.query = { next: '/login' };
```

### req.fresh

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

### req.stale

  Inverse of `req.fresh`.

### req.protocol

  Return request protocol, "https" or "http". Supports `X-Forwarded-Proto`
  when `app.proxy` is __true__.

### req.secure

  Shorthand for `this.protocol == "https"` to check if a request was
  issued via TLS.

### req.ip

  Request remote address. Supports `X-Forwarded-For` when `app.proxy`
  is __true__.

### req.ips

  When `X-Forwarded-For` is present and `app.proxy` is enabled an array
  of these ips is returned, ordered from upstream -> downstream. When disabled
  an empty array is returned.

### req.subdomains

  Return subdomains as an array.

  Subdomains are the dot-separated parts of the host before the main domain of
  the app. By default, the domain of the app is assumed to be the last two
  parts of the host. This can be changed by setting `app.subdomainOffset`.

  For example, if the domain is "tobi.ferrets.example.com":
  If `app.subdomainOffset` is not set, this.subdomains is `["ferrets", "tobi"]`.
  If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.

### req.is(type)

  Check if the incoming request contains the "Content-Type"
  header field, and it contains any of the give mime `type`s.
  If there is no request body, `undefined` is returned.
  If there is no content type, or the match fails `false` is returned.
  Otherwise, it returns the matching content-type.

```js
// With Content-Type: text/html; charset=utf-8
this.is('html'); // => 'html'
this.is('text/html'); // => 'text/html'
this.is('text/*', 'text/html'); // => 'text/html'

// When Content-Type is application/json
this.is('json', 'urlencoded'); // => 'json'
this.is('application/json'); // => 'application/json'
this.is('html', 'application/*'); // => 'application/json'

this.is('html'); // => false
```

  For example if you want to ensure that
  only images are sent to a given route:

```js
if (this.is('image/*')) {
  // process
} else {
  this.throw(415, 'images only!');
}
```

### req.accepts(types)

  Check if the given `type(s)` is acceptable, returning
  the best match when true, otherwise `false`, in which
  case you should respond with 406 "Not Acceptable".

  The `type` value may be one or more mime type string
  such as "application/json", the extension name
  such as "json", or an array `["json", "html", "text/plain"]`.
  When a list or array is given the _best_ match, if any is returned.

  Note that if the client did not send an `Accept` header,
  the first `type` will be returned.

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
  default: this.throw(406);
}
```

### req.acceptsEncodings(encodings)

  Check if `encodings` are acceptable, returning
  the best match when true, otherwise `identity`.

```js
// Accept-Encoding: gzip
this.acceptsEncodings('gzip', 'deflate');
// => "gzip"

this.acceptsEncodings(['gzip', 'deflate']);
// => "gzip"
```

  When no arguments are given all accepted encodings
  are returned as an array:

```js
// Accept-Encoding: gzip, deflate
this.acceptsEncodings();
// => ["gzip", "deflate"]
```

### req.acceptsCharsets(charsets)

  Check if `charsets` are acceptable, returning
  the best match when true, otherwise `undefined`.

```js
// Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5
this.acceptsCharsets('utf-8', 'utf-7');
// => "utf-8"

this.acceptsCharsets(['utf-7', 'utf-8']);
// => "utf-8"
```

  When no arguments are given all accepted charsets
  are returned as an array:

```js
// Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5
this.acceptsCharsets();
// => ["utf-8", "utf-7", "iso-8859-1"]
```

### req.acceptsLanguages(langs)

  Check if `langs` are acceptable, returning
  the best match when true, otherwise `undefined`.

```js
// Accept-Language: en;q=0.8, es, pt
this.acceptsLanguages('es', 'en');
// => "es"

this.acceptsLanguages(['en', 'es']);
// => "es"
```

  When no arguments are given all accepted languages
  are returned as an array:

```js
// Accept-Language: en;q=0.8, es, pt
this.acceptsLanguages();
// => ["es", "pt", "en"]
```

