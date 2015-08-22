1.0.0 / 2015-08-22
==================

 * add `this.req` check for `querystring()`
 * don't log errors with `err.expose`
 * `koa` now follows semver!

0.21.0 / 2015-05-23
==================

 * empty `request.query` objects are now always the same instance
 * bump `fresh@0.3.0`

0.20.0 / 2015-04-30
==================

Breaking change if you're using `this.get('ua') === undefined` etc.
For more details please checkout [#438](https://github.com/koajs/koa/pull/438).

  * make sure helpers return strict string
  * feat: alias response.headers to response.header

0.19.1 / 2015-04-14
==================

  * non-error thrown, fixed #432

0.19.0 / 2015-04-05
==================

 * `req.host` and `req.hostname` now always return a string (semi-breaking change)
 * improved test coverage

0.18.1 / 2015-03-01
==================

 * move babel to `devDependencies`

0.18.0 / 2015-02-14
==================

 * experimental es7 async function support via `app.experimental = true`
 * use `content-type` instead of `media-typer`

0.17.0 / 2015-02-05
==================

Breaking change if you're using an old version of node v0.11!
Otherwise, you should have no trouble upgrading.

 * official iojs support
 * drop support for node.js `>= 0.11.0 < 0.11.16`
 * use `Object.setPrototypeOf()` instead of `__proto__`
 * update dependencies

0.16.0 / 2015-01-27
==================

 * add `res.append()`
 * fix path usage for node@0.11.15

0.15.0 / 2015-01-18
==================

 * add `this.href`

0.14.0 / 2014-12-15
==================

 * remove `x-powered-by` response header
 * fix the content type on plain-text redirects
 * add ctx.state
 * bump `co@4`
 * bump dependencies

0.13.0 / 2014-10-17
==================

 * add this.message
 * custom status support via `statuses`

0.12.2 / 2014-09-28
==================

 * use wider semver ranges for dependencies koa maintainers also maintain

0.12.1 / 2014-09-21
==================

 * bump content-disposition
 * bump statuses

0.12.0 / 2014-09-20
==================

 * add this.assert()
 * use content-disposition

0.11.0 / 2014-09-08
==================

 * fix app.use() assertion #337
 * bump a lot of dependencies

0.10.0 / 2014-08-12
==================

 * add `ctx.throw(err, object)` support
 * add `ctx.throw(err, status, object)` support

0.9.0 / 2014-08-07
==================

 * add: do not set `err.expose` to true when err.status not a valid http status code
 * add: alias `request.headers` as `request.header`
 * add context.inspect(), cleanup app.inspect()
 * update cookies
 * fix `err.status` invalid lead to uncaughtException
 * fix middleware gif, close #322

0.8.2 / 2014-07-27
==================

 * bump co
 * bump parseurl

0.8.1 / 2014-06-24
==================

 * bump type-is

0.8.0 / 2014-06-13
==================

 * add `this.response.is()``
 * remove `.status=string` and `res.statusString` #298

0.7.0 / 2014-06-07
==================

 * add `this.lastModified` and `this.etag` as both getters and setters for ubiquity #292.
   See koajs/koa@4065bf7 for an explanation.
 * refactor `this.response.vary()` to use [vary](https://github.com/expressjs/vary) #291
 * remove `this.response.append()` #291

0.6.3 / 2014-06-06
==================

 * fix res.type= when the extension is unknown
 * assert when non-error is passed to app.onerror #287
 * bump finished

0.6.2 / 2014-06-03
==================

 * switch from set-type to mime-types

0.6.1 / 2014-05-11
==================

 * bump type-is
 * bump koa-compose

0.6.0 / 2014-05-01
==================

 * add nicer error formatting
 * add: assert object type in ctx.onerror
 * change .status default to 404. Closes #263
 * remove .outputErrors, suppress output when handled by the dev. Closes #272
 * fix content-length when body is re-assigned. Closes #267

0.5.5 / 2014-04-14
==================

 * fix length when .body is missing
 * fix: make sure all intermediate stream bodies will be destroyed

0.5.4 / 2014-04-12
==================

 * fix header stripping in a few cases

0.5.3 / 2014-04-09
==================

 * change res.type= to always default charset. Closes #252
 * remove ctx.inspect() implementation. Closes #164

0.5.2 / 2014-03-23
==================

 * fix: inspection of `app` and `app.toJSON()`
 * fix: let `this.throw`n errors provide their own status
 * fix: overwriting of `content-type` w/ `HEAD` requests
 * refactor: use statuses
 * refactor: use escape-html
 * bump dev deps

0.5.1 / 2014-03-06
==================

 * add request.hostname(getter). Closes #224
 * remove response.charset and ctx.charset (too confusing in relation to ctx.type) [breaking change]
 * fix a debug() name

0.5.0 / 2014-02-19
==================

 * add context.charset
 * add context.charset=
 * add request.charset
 * add response.charset
 * add response.charset=
 * fix response.body= html content sniffing
 * change ctx.length and ctx.type to always delegate to response object [breaking change]

0.4.0 / 2014-02-11
==================

 * remove app.jsonSpaces settings - moved to [koa-json](https://github.com/koajs/json)
 * add this.response=false to bypass koa's response handling
 * fix response handling after body has been sent
 * changed ctx.throw() to no longer .expose 5xx errors
 * remove app.keys getter/setter, update cookies, and remove keygrip deps
 * update fresh
 * update koa-compose

0.3.0 / 2014-01-17
==================

 * add ctx.host= delegate
 * add req.host=
 * add: context.throw supports Error instances
 * update co
 * update cookies

0.2.1 / 2013-12-30
==================

 * add better 404 handling
 * add check for fn._name in debug() output
 * add explicit .toJSON() calls to ctx.toJSON()

0.2.0 / 2013-12-28
==================

 * add support for .throw(status, msg). Closes #130
 * add GeneratorFunction assertion for app.use(). Closes #120
 * refactor: move `.is()` to `type-is`
 * refactor: move content negotiation to "accepts"
 * refactor: allow any streams with .pipe method
 * remove `next` in callback for now

0.1.2 / 2013-12-21
==================

 * update co, koa-compose, keygrip
 * use on-socket-error
 * add throw(status, msg) support
 * assert middleware is GeneratorFunction
 * ducktype stream checks
 * remove `next` is `app.callback()`

0.1.1 / 2013-12-19
==================

 * fix: cleanup socker error handler on response
