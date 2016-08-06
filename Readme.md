<img src="https://dl.dropboxusercontent.com/u/6396913/koa/logo.png" alt="koa middleware framework for nodejs" width="255px" />

  [![gitter][gitter-image]][gitter-url]
  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]

  Expressive HTTP middleware framework for node.js to make web applications and APIs more enjoyable to write. Koa's middleware stack flows in a stack-like manner, allowing you to perform actions downstream then filter and manipulate the response upstream.

  Only methods that are common to nearly all HTTP servers are integrated directly into Koa's small ~570 SLOC codebase. This
  includes things like content negotiation, normalization of node inconsistencies, redirection, and a few others.

  Koa is not bundled with any middleware.

## Installation
Koa requires __node v4.0.0__ or higher for (partial) ES2015 support.

```
$ npm install koa@next
```

## Hello koa

```js
const Koa = require('koa');
const app = new Koa();

// response
app.use(ctx => {
  ctx.body = 'Hello Koa';
});

app.listen(3000);
```

## Getting started

 - [Kick-Off-Koa](https://github.com/koajs/kick-off-koa) - An intro to koa via a set of self-guided workshops.
 - [Workshop](https://github.com/koajs/workshop) - A workshop to learn the basics of koa, Express' spiritual successor.
 - [Introduction Screencast](http://knowthen.com/episode-3-koajs-quickstart-guide/) - An introduction to installing and getting started with Koa


## Middleware
Koa is a middleware framework that can take 3 different kinds of functions as middleware:

  * common function
  * async function
  * generatorFunction

Here is an example of logger middleware with each of the different functions:

### Common function

```js
// Middleware normally takes two parameters (ctx, next), ctx is the context for one request,
// next is a function that is invoked to execute the downstream middleware. It returns a Promise with a then function for running code after completion.

app.use((ctx, next) => {
  const start = new Date();
  return next().then(() => {
    const ms = new Date() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });
});
```

### ___async___ functions (Babel required)

```js
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});
```

### GeneratorFunction

To use generator functions, you must use a wrapper such as [co](https://github.com/tj/co) that is no longer supplied with Koa.

```js
app.use(co.wrap(function *(ctx, next) {
  const start = new Date();
  yield next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
}));
```

### Old signature middleware (v1.x) - Deprecated

**Old signature middleware (v1.x) support will be removed in v3**

Koa v2.x will try to convert legacy signature, generator middleware on `app.use`, using [koa-convert](https://github.com/koajs/convert).
It is however recommended that you choose to migrate all v1.x middleware as soon as possible.

```js
// Koa will convert
app.use(function *(next) {
  const start = new Date();
  yield next;
  const ms = new Date() - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
});
```

You could do it manually as well, in which case Koa will not convert.

```js
const convert = require('koa-convert');

app.use(convert(function *(next) {
  const start = new Date();
  yield next;
  const ms = new Date() - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
}));
```

## Babel setup

For Node 4.0 and Babel 6.0 you can setup like this:

```bash
$ npm install babel-register babel-plugin-transform-async-to-generator --save
```

```js
// set babel in entry file
require('babel-register')({
  plugins: ['transform-async-to-generator']
});
```

Check out an example in koa's [test](test/babel/index.js).

## Running tests

```
$ make test
```

## Authors

See [AUTHORS](AUTHORS).

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
