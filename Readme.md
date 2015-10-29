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

  Koa requires __node v4.0.0__ or higher for (partial) ES2015 support.

## Community

 - [API](docs/api/index.md) documentation
 - [Badgeboard](https://koajs.github.io/badgeboard) and list of official modules
 - [Examples](https://github.com/koajs/examples)
 - [Middleware](https://github.com/koajs/koa/wiki) list
 - [Wiki](https://github.com/koajs/koa/wiki)
 - [G+ Community](https://plus.google.com/communities/101845768320796750641)
 - [Reddit Community](http://reddit.com/r/koajs)
 - [Mailing list](https://groups.google.com/forum/#!forum/koajs)
 - [Guide](docs/guide.md)
 - [FAQ](docs/faq.md)
 - [中文文档](https://github.com/turingou/koa-guide)
 - __[#koajs]__ on freenode

## Getting started

 - [Kick-Off-Koa](https://github.com/koajs/kick-off-koa) - An intro to koa via a set of self-guided workshops.
 - [Workshop](https://github.com/koajs/workshop) - A workshop to learn the basics of koa, Express' spiritual successor.
 - [Introduction Screencast](http://knowthen.com/episode-3-koajs-quickstart-guide/) - An introduction to installing and getting started with Koa

## Example
```js
const Koa = require('koa');
const app = new Koa();

// logger

app.use((ctx, next) => {
  const start = new Date;
  return next().then(() => {
    const ms = new Date - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}`);
  });
});

// response

app.use(ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

## Example with ___async___ functions (Babel required)

```js
const Koa = require('koa');
const app = new Koa();

// logger

app.use(async (ctx, next) => {
  const start = new Date;
  await next();
  const ms = new Date - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
});

// response

app.use(ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

## Example with generator

To use generator functions, you must use a wrapper such as [co](https://github.com/tj/co) that is no longer supplied with Koa.

```js
const Koa = require('koa');
const app = new Koa();
const co = require('co');

// logger

app.use(co.wrap(function *(ctx, next){
  const start = new Date;
  yield next();
  const ms = new Date - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}`);
}));

// response

app.use(ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

## Example with old signature

If you want to use old signature or be compatible with old middleware, you must use [koa-convert](https://github.com/gyson/koa-convert) to convert legacy generator middleware to promise middleware.

```js
const Koa = require('koa');
const app = new Koa();
const convert = require('koa-convert')

// logger

app.use(convert(function *(next){
  const start = new Date;
  yield next;
  const ms = new Date - start;
  console.log(`${this.method} ${this.url} - ${ms}`);
}));

// response

app.use(ctx => {
  ctx.body = 'Hello World';
});

app.listen(3000);
```

## Running tests

```
$ make test
```

## Authors

See [AUTHORS](AUTHORS).

# License

  MIT

[npm-image]: https://img.shields.io/npm/v/koa.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa
[travis-image]: https://img.shields.io/travis/koajs/koa/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/koa
[coveralls-image]: https://img.shields.io/coveralls/koajs/koa/master.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/koajs/koa?branch=master
[gitter-image]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/koajs/koa?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[#koajs]: https://webchat.freenode.net/?channels=#koajs
