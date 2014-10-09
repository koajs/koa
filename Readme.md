<img src="https://dl.dropboxusercontent.com/u/6396913/koa/logo.png" alt="koa middleware framework for nodejs" width="255px" />

  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]

  Expressive middleware for node.js using generators via [co](https://github.com/visionmedia/co)
  to make web applications and APIs more enjoyable to write. Koa's middleware flow in a stack-like manner allowing you to perform actions downstream, then filter and manipulate the response upstream. Koa's use of generators also greatly increases the readability and robustness of your application.

  Only methods that are common to nearly all HTTP servers are integrated directly into Koa's small ~550 SLOC codebase. This
  includes things like content-negotiation, normalization of node inconsistencies, redirection, and a few others.

  No middleware are bundled with koa. If you prefer to only define a single dependency for common middleware, much like Connect, you may use
  [koa-common](https://github.com/koajs/common).

## Installation

```
$ npm install koa
```

  To use Koa you must be running __node 0.11.9__ or higher for generator support, and must run node(1)
  with the `--harmony` flag. If you don't like typing this, add an alias to your shell profile:

```
alias node='node --harmony'
```

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
 - [中文文档](http://koajs.cn/)
 - __#koajs__ on freenode

## Getting started

 - [kick-off-koa](https://github.com/koajs/kick-off-koa) - An intro to koa via a set of self-guided workshops.
 - [workshop](https://github.com/koajs/workshop) - A workshop to learn the basics of koa, Express' spiritual successor.

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

  - [TJ Holowaychuk](https://github.com/visionmedia)
  - [Jonathan Ong](https://github.com/jonathanong)
  - [Julian Gruber](https://github.com/juliangruber)
  - [Yiyu He](https://github.com/dead-horse)

# License

  MIT

[npm-image]: https://img.shields.io/npm/v/koa.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa
[travis-image]: https://img.shields.io/travis/koajs/koa.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/koa
[coveralls-image]: https://img.shields.io/coveralls/koajs/koa.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/koajs/koa?branch=master
