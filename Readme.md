<img src="https://dl.dropboxusercontent.com/u/6396913/koa/logo.png" alt="koa middleware framework for nodejs" width="255px" />

  [![gitter][gitter-image]][gitter-url]
  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]

  Expressive HTTP middleware for node.js to make web applications and APIs more enjoyable to write. Koa's middleware stack flows in a stack-like manner, allowing you to perform actions downstream then filter and manipulate the response upstream. Koa's use of generators also greatly increases the readability and robustness of your application.

  Only methods that are common to nearly all HTTP servers are integrated directly into Koa's small ~550 SLOC codebase. This
  includes things like content negotiation, normalization of node inconsistencies, redirection, and a few others.

  Koa is not bundled with any middleware.

## Installation

```
$ npm install koa
```

  Koa is supported in node v4+ and node v0.12 with the `--harmony-generators` or `--harmony` flag.

## v2 Alpha

  Koa v2 is currently in alpha. In this new version, the middleware function signature completely changes in favor of ES2015-2016 syntax:

```js
// Koa application is now a class and requires the new operator.
const app = new Koa()

// uses async arrow functions
app.use(async (ctx, next) => {
  try {
    await next() // next is now a function
  } catch (err) {
    ctx.body = { message: err.message }
    ctx.status = err.status || 500
  }
})

app.use(async ctx => {
  const user = await User.getById(ctx.session.userid) // await instead of yield
  ctx.body = user // ctx instead of this
})
```
  To learn more about Koa v2, follow [this issue](https://github.com/koajs/koa/issues/533).
  To try Koa v2, `npm install koa@next`.

## Community

 - [API](docs/api/index.md) documentation
 - [Badgeboard](https://koajs.github.io/badgeboard) and list of official modules
 - [Examples](https://github.com/koajs/examples)
 - [Middleware](https://github.com/koajs/koa/wiki) list
 - [Wiki](https://github.com/koajs/koa/wiki)
 - [G+ Community](https://plus.google.com/communities/101845768320796750641)
 - [Reddit Community](https://www.reddit.com/r/koajs)
 - [Mailing list](https://groups.google.com/forum/#!forum/koajs)
 - [Guide](docs/guide.md)
 - [FAQ](docs/faq.md)
 - [中文文档](https://github.com/guo-yu/koa-guide)
 - __[#koajs]__ on freenode

## Getting started

 - [Kick-Off-Koa](https://github.com/koajs/kick-off-koa) - An intro to koa via a set of self-guided workshops.
 - [Workshop](https://github.com/koajs/workshop) - A workshop to learn the basics of koa, Express' spiritual successor.
 - [Introduction Screencast](http://knowthen.com/episode-3-koajs-quickstart-guide/) - An introduction to installing and getting started with Koa

## Example

```js
var koa = require('koa');
var app = koa();

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

## Running tests

```
$ make test
```

## Authors

  - [TJ Holowaychuk](https://github.com/tj)
  - [Jonathan Ong](https://github.com/jonathanong)
  - [Julian Gruber](https://github.com/juliangruber)
  - [Yiyu He](https://github.com/dead-horse)

# License

  MIT

[npm-image]: https://img.shields.io/npm/v/koa.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/koa
[travis-image]: https://img.shields.io/travis/koajs/koa/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/koa
[coveralls-image]: https://codecov.io/github/koajs/koa/coverage.svg?branch=master
[coveralls-url]: https://codecov.io/github/koajs/koa?branch=master
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/koajs/koa?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[#koajs]: https://webchat.freenode.net/?channels=#koajs
