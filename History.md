
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
