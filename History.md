
2.8.2 / 2019-09-28
==================

**fixes**
  * [[`54e8fab`](http://github.com/koajs/koa/commit/54e8fab3e3d907bbb264caf3e28a24773d0d6fdb)] - fix: encode redirect url if not already encoded (#1384) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`817b498`](http://github.com/koajs/koa/commit/817b49830571b45a8aec6b1fc1525434f5798c58)] - test: fix body test (#1375) (Robert Nagy <<ronagy@icloud.com>>)
  * [[`f75d445`](http://github.com/koajs/koa/commit/f75d4455359ecdf30eeb676e2c7f31d4cf7b42ed)] - test: fix end after end (#1374) (Robert Nagy <<ronagy@icloud.com>>)

2.8.1 / 2019-08-19
==================

**fixes**
  * [[`287e589`](http://github.com/koajs/koa/commit/287e589ac773d3738b2aa7d40e0b6d43dde5261b)] - fix: make options more compatibility (dead-horse <<dead_horse@qq.com>>)

2.8.0 / 2019-08-19
==================

**features**
  * [[`5afff89`](http://github.com/koajs/koa/commit/5afff89eca0efe7081309dc2d123309e825df221)] - feat: accept options in the Application constructor (#1372) (Jake <<djakelambert@gmail.com>>)

**fixes**
  * [[`ff70bdc`](http://github.com/koajs/koa/commit/ff70bdc75a30a37f63fc1f7d8cbae3204df3d982)] - fix: typo on document (#1355) (Jeff <<jeff.tian@outlook.com>>)

**others**
  * [[`3b23865`](http://github.com/koajs/koa/commit/3b23865340cfba075f61f7dba0ea31fcc27260ec)] - docs: parameter of request.get is case-insensitive (#1373) (Gunnlaugur Thor Briem <<gunnlaugur@gmail.com>>)
  * [[`a245d18`](http://github.com/koajs/koa/commit/a245d18a131341feec4f87659746954e78cae780)] - docs: Update response.socket (#1357) (Jeff <<jeff.tian@outlook.com>>)
  * [[`d1d65dd`](http://github.com/koajs/koa/commit/d1d65dd29d7bbaf9ea42eaa5fcb0da3fb4df98e9)] - chore(deps): install egg-bin, mm as devDeps not deps (#1366) (Edvard Chen <<pigeon73101@gmail.com>>)
  * [[`2c86b10`](http://github.com/koajs/koa/commit/2c86b10feafd868ebd071dda3a222e6f51972b5d)] - test: remove jest and use egg-bin(mocha) (#1363) (Yiyu He <<dead_horse@qq.com>>)
  * [[`219bf22`](http://github.com/koajs/koa/commit/219bf22237b11bc375e2e110b93db512f1acfdd4)] - docs(context): update link (#1354) (Peng Jie <<bivinity.pengzjie@gmail.com>>)
  * [[`52a6737`](http://github.com/koajs/koa/commit/52a673703a87a93c0f6a8552e6bd73caba66d2eb)] - chore: ignore Intellij IDEA project files (#1361) (Imon-Haque <<38266345+Imon-Haque@users.noreply.github.com>>)
  * [[`b9e3546`](http://github.com/koajs/koa/commit/b9e35469d3bbd0a1ee92e0a815ce2512904d4a18)] - docs(api): fix keygrip link (#1350) (Peng Jie <<bivinity.pengzjie@gmail.com>>)
  * [[`d4bdb5e`](http://github.com/koajs/koa/commit/d4bdb5ed9e2fe06ec44698b66c029f624135a0ab)] - chore: update eslint and fix lint errors (dead-horse <<dead_horse@qq.com>>)
  * [[`12960c4`](http://github.com/koajs/koa/commit/12960c437cc25c53e682cfe5bff06d74a5bb1eb9)] - build: test on 8/10/12 (dead-horse <<dead_horse@qq.com>>)
  * [[`00e8f7a`](http://github.com/koajs/koa/commit/00e8f7a1b7603aabdb7fb3567f485cb1c2076702)] - docs: ctx.type aliases ctx.response, not ctx.request (#1343) (Alex Berk <<berkalexanderc@gmail.com>>)
  * [[`62f29eb`](http://github.com/koajs/koa/commit/62f29eb0c4dee01170a5511615e5bcc9faca26ca)] - docs(context): update cookies link (#1348) (Peng Jie <<dean.leehom@gmail.com>>)
  * [[`b7fc526`](http://github.com/koajs/koa/commit/b7fc526ea49894f366153bd32997e02568c0b8a6)] - docs: fix typo in cookie path default value docs (#1340) (Igor Adamenko <<igoradamenko@users.noreply.github.com>>)
  * [[`23f7f54`](http://github.com/koajs/koa/commit/23f7f545abfe1fb6499cd61cc8ff41fd86cef4a0)] - chore: simplify variable (#1332) (kzhang <<godky@users.noreply.github.com>>)
  * [[`132c9ee`](http://github.com/koajs/koa/commit/132c9ee63f92a586a120ed3bd6b7ef023badb8bb)] - docs: Clarify the format of request.headers (#1325) (Dobes Vandermeer <<dobesv@gmail.com>>)
  * [[`5810f27`](http://github.com/koajs/koa/commit/5810f279a4caeda115f39e429c9671795613abf8)] - docs: Removed Document in Progress note in Koa vs Express (#1336) (Andrew Peterson <<andrew@andpeterson.com>>)
  * [[`75233d9`](http://github.com/koajs/koa/commit/75233d974a30af6e3b8ab38a73e5ede67172fc1c)] - chore: Consider removing this return statement; it will be ignored. (#1322) (Vern Brandl <<tkvern@users.noreply.github.com>>)
  * [[`04e07fd`](http://github.com/koajs/koa/commit/04e07fdc620841068f12b8edf36f27e6592a0a18)] - test: Buffer() is deprecated due to security and usability issues. so use the Buffer.alloc() instead (#1321) (Vern Brandl <<tkvern@users.noreply.github.com>>)
  * [[`130e363`](http://github.com/koajs/koa/commit/130e363856747b487652f04b5550056d7778e43a)] - docs: use 'fs-extra' instead of 'fs-promise' (#1309) (rosald <<35028438+rosald@users.noreply.github.com>>)
  * [[`2f2078b`](http://github.com/koajs/koa/commit/2f2078bf998bd3f44289ebd17eeccf5e12e4c134)] - chore: Update PR-welcome badge url (#1299) (James George <<jamesgeorge998001@gmail.com>>)

2.7.0 / 2019-01-28
==================

**features**
  * [[`b7bfa71`](http://github.com/koajs/koa/commit/b7bfa7113b8d1af49a57ab767f24a599ed92044f)] - feat: change set status assert, allowing valid custom statuses (#1308) (Martin Iwanowski <<martin@iwanowski.se>>)

**others**
  * [[`72f325b`](http://github.com/koajs/koa/commit/72f325b78edd0dc2aac940a76ce5f644005ce4c3)] - chore: add pr welcoming badge (#1291) (James George <<jamesgeorge998001@gmail.com>>)
  * [[`b15115b`](http://github.com/koajs/koa/commit/b15115b2cbfffe15827cd5e4368267d417b72f08)] - chore: Reduce unnecessary variable declarations (#1298) (call me saisai <<1457358080@qq.com>>)
  * [[`ad91ce2`](http://github.com/koajs/koa/commit/ad91ce2346cb34e5d5a49d07dd952d15f6c832a3)] - chore: license 2019 (dead-horse <<dead_horse@qq.com>>)
  * [[`b25e79d`](http://github.com/koajs/koa/commit/b25e79dfb599777a38157bd419395bd28369ee86)] - Mark two examples as live for the corresponding documentation change in https://github.com/koajs/koajs.com/pull/38. (#1031) (Francisco Ryan Tolmasky I <<tolmasky@gmail.com>>)
  * [[`d9ef603`](http://github.com/koajs/koa/commit/d9ef60398e88f2c2f958ab2b159d38052ffe7f8a)] - chore: Optimize array split (#1295) (Mikhail Bodrov <<connormiha1@gmail.com>>)
  * [[`9be8583`](http://github.com/koajs/koa/commit/9be858312553002841725b617050aaff3c48951d)] - chore: replace ~~ with Math.trunc in res.length (option) (#1288) (jeremiG <<gendronjeremi@gmail.com>>)
  * [[`7e46c20`](http://github.com/koajs/koa/commit/7e46c2058cb5994809eab5f4dbb12f21e937c72b)] - docs: add link to the license file (#1290) (James George <<jamesgeorge998001@gmail.com>>)
  * [[`48993ad`](http://github.com/koajs/koa/commit/48993ade9b0831fbce28d94b3b0963a4b0dccbdd)] - docs: Document other body types (#1285) (Douglas Wade <<douglas.b.wade@gmail.com>>)
  * [[`acb388b`](http://github.com/koajs/koa/commit/acb388bc0546b48fca11dce8aa7a595af2cda5e2)] - docs: Add security vulnerability disclosure instructions to the Readme (#1283) (Douglas Wade <<douglas.b.wade@gmail.com>>)
  * [[`a007198`](http://github.com/koajs/koa/commit/a007198fa23c19902b1f3ffb81498629e0e9c875)] - docs: Document ctx.app.emit (#1284) (Douglas Wade <<douglas.b.wade@gmail.com>>)
  * [[`f90e825`](http://github.com/koajs/koa/commit/f90e825da9d505c11b4262c50cd54553f979c300)] - docs: response.set(fields) won't overwrites previous header fields(#1282) (Douglas Wade <<douglas.b.wade@gmail.com>>)
  * [[`fc93c05`](http://github.com/koajs/koa/commit/fc93c05f68398f30abc46fd16ae6c673a1eee099)] - docs: update readme to add babel 7 instructions (#1274) (Vikram Rangaraj <<vik120@icloud.com>>)
  * [[`5560f72`](http://github.com/koajs/koa/commit/5560f729124f022ffed00085aafea43dded7fb03)] - chore: use the ability of `content-type` lib directly (#1276) (Jordan <<mingmingwon@gmail.com>>)

2.6.2 / 2018-11-10
==================

**fixes**
  * [[`9905199`](http://github.com/koajs/koa/commit/99051992a9f45eb0dd79e062681d6f5d366deb41)] - fix: Status message is not supported on HTTP/2 (#1264) (André Cruz <<andre@cabine.org>>)

**others**
  * [[`325792a`](http://github.com/koajs/koa/commit/325792aee92de0ba6fea306657933fc63dc00474)] - docs: add table of contents for guide.md (#1267) (ZYSzys <<zyszys98@gmail.com>>)
  * [[`71aaa29`](http://github.com/koajs/koa/commit/71aaa29591d6681f8579486f18d32ba1ee651a5b)] - docs: fix spelling in throw docs (#1269) (Martin Iwanowski <<martin@iwanowski.se>>)
  * [[`bc81ca9`](http://github.com/koajs/koa/commit/bc81ca9414296234c764b7306a19ba72b2e59b52)] - chore: use res instead of this.res (#1271) (Jordan <<mingmingwon@gmail.com>>)
  * [[`0251b38`](http://github.com/koajs/koa/commit/0251b38a8405471892c5eeaba7c8d54bd7028214)] - test: node v11 on travis (#1265) (Martin Iwanowski <<martin@iwanowski.se>>)
  * [[`88b92b4`](http://github.com/koajs/koa/commit/88b92b43153f21609aee71d47abcd4dc27a6586d)] - doc: updated docs for throw() to pass status as first param. (#1268) (Waleed Ashraf <<waleedashraf@outlook.com>>)

2.6.1 / 2018-10-23
==================

**fixes**
  * [[`4964242`](http://github.com/koajs/koa/commit/49642428342e5f291eb9d690802e83ed830623b5)] - fix: use X-Forwarded-Host first on app.proxy present (#1263) (fengmk2 <<fengmk2@gmail.com>>)

2.6.0 / 2018-10-23
==================

**features**
  * [[`9c5c58b`](http://github.com/koajs/koa/commit/9c5c58b18363494976185e7ddc790ac63de840ed)] - feat: use :authority header of http2 requests as host (#1262) (Martin Michaelis <<code@mgjm.de>>)
  * [[`9146024`](http://github.com/koajs/koa/commit/9146024e1094e8bb871ab15d1b7fc556a710732f)] - feat: response.attachment append a parameter: options from contentDisposition (#1240) (小雷 <<863837949@qq.com>>)

**others**
  * [[`d32623b`](http://github.com/koajs/koa/commit/d32623baa7a6273d47be67d587ad4ea0ecffc5de)] - docs: Update error-handling.md (#1239) (urugator <<j.placek@centrum.cz>>)

2.5.3 / 2018-09-11
==================

**fixes**
  * [[`2ee32f5`](http://github.com/koajs/koa/commit/2ee32f50b88b383317e33cc0a4bfaa5f2eadead7)] - fix: pin debug@~3.1.0 avoid deprecated warnning (#1245) (fengmk2 <<fengmk2@gmail.com>>)

**others**
  * [[`2180839`](http://github.com/koajs/koa/commit/2180839eda2cb16edcfda46ccfe24711680af850)] - docs: Update koa-vs-express.md (#1230) (Clayton Ray <<iamclaytonray@gmail.com>>)

2.5.2 / 2018-07-12
==================

  * deps: upgrade all dependencies
  * perf: avoid stringify when set header (#1220)
  * perf: cache content type's result (#1218)
  * perf: lazy init cookies and ip when first time use it (#1216)
  * chore: fix comment & approve cov (#1214)
  * docs: fix grammar
  * test&cov: add test case (#1211)
  * Lazily initialize `request.accept` and delegate `context.accept` (#1209)
  * fix: use non deprecated custom inspect (#1198)
  * Simplify processes in the getter `request.protocol` (#1203)
  * docs: better demonstrate middleware flow (#1195)
  * fix: Throw a TypeError instead of a AssertionError (#1199)
  * chore: mistake in a comment (#1201)
  * chore: use this.res.socket insteadof this.ctx.req.socket (#1177)
  * chore: Using "listenerCount" instead of "listeners" (#1184)

2.5.1 / 2018-04-27
==================

  * test: node v10 on travis (#1182)
  * fix tests: remove unnecessary assert doesNotThrow and api calls (#1170)
  * use this.response insteadof this.ctx.response (#1163)
  * deps: remove istanbul (#1151)
  * Update guide.md (#1150)

2.5.0 / 2018-02-11
==================

  * feat: ignore set header/status when header sent (#1137)
  * run coverage using --runInBand (#1141)
  * [Update] license year to 2018 (#1130)
  * docs: small grammatical fix in api docs index (#1111)
  * docs: fixed typo (#1112)
  * docs: capitalize K in word koa (#1126)
  * Error handling: on non-error throw try to stringify if error is an object (#1113)
  * Use eslint-config-koa (#1105)
  * Update mgol's name in AUTHORS, add .mailmap (#1100)
  * Avoid generating package locks instead of ignoring them (#1108)
  * chore: update copyright year to 2017 (#1095)


2.4.1 / 2017-11-06
==================

 * fix bad merge w/ 2.4.0

2.4.0 / 2017-11-06
==================

UNPUBLISHED

 * update `package.engines.node` to be more strict
 * update `fresh@^0.5.2`
 * fix: `inspect()` no longer crashes `context`
 * fix: gated `res.statusMessage` for HTTP/2
 * added: `app.handleRequest()` is exposed

2.3.0 / 2017-06-20
==================

 * fix: use `Buffer.from()`
 * test on node 7 & 8
 * add `package-lock.json` to `.gitignore`
 * run `lint --fix`
 * add `request.header` in addition to `request.headers`
 * add IPv6 hostname support

2.2.0 / 2017-03-14
==================

 * fix: drop `package.engines.node` requirement to >= 6.0.0
   * this fixes `yarn`, which errors when this semver range is not satisfied
 * bump `cookies@~0.7.0`
 * bump `fresh@^0.5.0`

2.1.0 / 2017-03-07
==================

 * added: return middleware chain promise from `callback()` #848
 * added: node v7.7+ `res.getHeaderNames()` support #930
 * added: `err.headerSent` in error handling #919
 * added: lots of docs!

2.0.1 / 2017-02-25
==================

NOTE: we hit a versioning snafu. `v2.0.0` was previously released,
so `v2.0.1` is released as the first `v2.x` with a `latest` tag.

 * upgrade mocha #900
 * add names to `application`'s request and response handlers #805
 * breaking: remove unused `app.name` #899
 * breaking: drop official support for node < 7.6

2.0.0 / ??????????
==================

 * Fix malformed content-type header causing exception on charset get (#898)
 * fix: subdomains should be [] if the host is an ip (#808)
 * don't pre-bound onerror [breaking change] (#800)
 * fix `ctx.flushHeaders()` to use `res.flushHeaders()` instead of `res.writeHead()` (#795)
 * fix(response): correct response.writable logic (#782)
 * merge v1.1.2 and v1.2.0 changes
 * include `koa-convert` so that generator functions still work
   * NOTE: generator functions are deprecated in v2 and will be removed in v3
 * improve linting
 * improve docs

2.0.0-alpha.8 / 2017-02-13
==================

 * Fix malformed content-type header causing exception on charset get (#898)

2.0.0-alpha.7 / 2016-09-07
==================

 * fix: subdomains should be [] if the host is an ip (#808)

2.0.0-alpha.6 / 2016-08-29
==================

  * don't pre-bound onerror [breaking change]

2.0.0-alpha.5 / 2016-08-10
==================

 * fix `ctx.flushHeaders()` to use `res.flushHeaders()` instead of `res.writeHead()`

2.0.0-alpha.4 / 2016-07-23
==================

 * fix `response.writeable` during pipelined requests

1.2.0 / 2016-03-03
==================

  * add support for `err.headers` in `ctx.onerror()`
    - see: https://github.com/koajs/koa/pull/668
    - note: you should set these headers in your custom error handlers as well
    - docs: https://github.com/koajs/koa/blob/master/docs/error-handling.md
  * fix `cookies`' detection of http/https
    - see: https://github.com/koajs/koa/pull/614
  * deprecate `app.experimental = true`. Koa v2 does not use this signature.
  * add a code of conduct
  * test against the latest version of node
  * add a lot of docs

1.1.2 / 2015-11-05
==================

  * ensure parseurl always working as expected
  * fix Application.inspect() – missing .proxy value.

2.0.0-alpha.3 / 2015-11-05
==================

  * ensure parseurl always working as expected. #586
  * fix Application.inspect() – missing .proxy value. Closes #563

2.0.0-alpha.2 / 2015-10-27
==================

 * remove `co` and generator support completely
 * improved documentation
 * more refactoring into ES6

2.0.0-alpha.1 / 2015-10-22
==================

 * change the middleware signature to `async (ctx, next) => await next()`
 * drop node < 4 support and rewrite the codebase in ES6

1.1.1 / 2015-10-22
==================

 * do not send a content-type when the type is unknown #536

1.1.0 / 2015-10-11
==================

 * add `app.silent=<Boolean>` to toggle error logging @tejasmanohar #486
 * add `ctx.origin` @chentsulin #480
 * various refactoring
   - add `use strict` everywhere

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
