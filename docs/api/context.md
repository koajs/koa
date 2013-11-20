
# Context

  A Koa Context encapsulates node's `request` and `response` objects
  into a single object which provides many helpful methods for writing
  web applications and APIs.

  Many accesors and methods simply delegate to their `ctx.request` or `ctx.response`
  equivalents for convenience, and are otherwise identical.

  These operations are used so frequently in HTTP server development
  that they are added at this level, instead of a higher level framework,
  which would force middlware to re-implement this common functionality.

  A `Context` is created _per_ request, and is referenced in middleware
  as the receiver, or the `this` identifier.

## Request aliases

  The following accessors and alias [Request](request.md) equivalents:

  - `ctx.header`
  - `ctx.method`
  - `ctx.method=`
  - `ctx.url`
  - `ctx.url=`
  - `ctx.path`
  - `ctx.path=`
  - `ctx.query`
  - `ctx.query=`
  - `ctx.querystring`
  - `ctx.querystring=`
  - `ctx.length`
  - `ctx.host`
  - `ctx.fresh`
  - `ctx.stale`
  - `ctx.socket`
  - `ctx.protocol`
  - `ctx.secure`
  - `ctx.ip`
  - `ctx.ips`
  - `ctx.subdomains`
  - `ctx.is()`
  - `ctx.accepts()`
  - `ctx.acceptsEncodings()`
  - `ctx.acceptsCharsets()`
  - `ctx.acceptsLanguages()`
  - `ctx.get()`

## Response aliases

  The following accessors and alias [Response](response.md) equivalents:

  - `ctx.body`
  - `ctx.body=`
  - `ctx.status`
  - `ctx.status=`
  - `ctx.length=`
  - `ctx.type`
  - `ctx.type=`
  - `ctx.headerSent`
  - `ctx.redirect()`
  - `ctx.attachment()`
  - `ctx.set()`
  - `ctx.lastModified=`
  - `ctx.etag=`

## API

  `Context` specific methods and accessors.

### ctx.req

  Node's `request` object.

### ctx.res

  Node's `response` object.

### ctx.request

  A koa `Request` object.

### ctx.response

  A koa `Response` object.

### ctx.app

  Application instance reference.

### ctx.cookies.get(name, [options])

  Get cookie `name` with `options`:

 - `signed` the cookie requested should be signed

  Note: koa uses the [cookies](https://github.com/jed/cookies) module where options are simply passed.

### ctx.cookies.set(name, value, [options])

  Set cookie `name` to `value` with `options`:

 - `signed` sign the cookie value
 - `expires` a `Date` for cookie expiration
 - `path` cookie path, `/'` by default
 - `domain` cookie domain
 - `secure` secure cookie
 - `httpOnly` server-accessible cookie, __true__ by default

  Note: koa uses the [cookies](https://github.com/jed/cookies) module where options are simply passed.

### ctx.throw(msg, [status])

  Helper method to throw an error with a `.status` property
  that will allow Koa to respond appropriately. The following
  combinations are allowed:

```js
this.throw(403)
this.throw('name required', 400)
this.throw('something exploded')
```

  For example `this.throw('name required', 400)` is requivalent to:

```js
var err = new Error('name required');
err.status = 400;
throw err;
```

  Note that these are user-level errors and are flagged with
  `err.expose` meaning the messages are appropriate for
  client responses, which is typically not the case for
  error messages since you do not want to leak failure
  details.
