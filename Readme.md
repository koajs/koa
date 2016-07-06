<img src="https://dl.dropboxusercontent.com/u/6396913/koa/logo.png" alt="koa middleware framework for nodejs" width="255px" />

  [![gitter][gitter-image]][gitter-url]
  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
  [![OpenCollective Backers][backers-image]](#backers)
  [![OpenCollective Sponsors][sponsors-image]](#sponsors)

  Expressive, light-weight HTTP framework for node.js to make web applications and APIs more enjoyable to write. Koa requests flow through middleware in a stack-like manner, allowing you to perform actions downstream then filter and manipulate the response upstream. Koa's use of generators also greatly increases the readability and robustness of your application.

  Only methods that are common to nearly all HTTP servers are integrated directly into Koa's small ~550 SLOC codebase. This
  includes things like content negotiation, normalization of node inconsistencies, redirection, and a few others.

  Koa is not bundled with any middleware, but there is a [large collection](https://github.com/koajs/koa/wiki) of community middleware to choose from.

## Installation

```
$ npm install koa
```

  Koa is supported in node v4+ and node v0.12 with the `--harmony-generators` or `--harmony` flag.

## Koa v2

  Koa v2 is currently released with the `next` tag (meaning it will not be marked as latest).
  You can install it with semver:

```bash
npm install koa@2
```

  In this new version, the middleware function signature completely changes in favor of ES2015-2016 syntax:

```js
// Koa application is now a class and requires the new operator.
const app = new Koa();

// uses async arrow functions
app.use(async (ctx, next) => {
  try {
    await next(); // next is now a function
  } catch (err) {
    ctx.body = { message: err.message };
    ctx.status = err.status || 500;
  }
});

app.use(async ctx => {
  const user = await User.getById(ctx.session.userid); // await instead of yield
  ctx.body = user; // ctx instead of this
});
```

  Although deprecated, the older, generator-based middleware signature will still work in v2 via [koa-convert](https://github.com/koajs/convert) and will be removed in v3.

  To learn more about Koa v2, follow [this issue](https://github.com/koajs/koa/issues/533) or read the docs here: https://github.com/koajs/koa/tree/v2.x/docs.

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


## Backers

Support us with a monthly donation and help us continue our activities. 

<a href="https://opencollective.com/koajs/backer/0/website" target="_blank"><img src="https://opencollective.com/koajs/backer/0/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/1/website" target="_blank"><img src="https://opencollective.com/koajs/backer/1/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/2/website" target="_blank"><img src="https://opencollective.com/koajs/backer/2/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/3/website" target="_blank"><img src="https://opencollective.com/koajs/backer/3/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/4/website" target="_blank"><img src="https://opencollective.com/koajs/backer/4/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/5/website" target="_blank"><img src="https://opencollective.com/koajs/backer/5/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/6/website" target="_blank"><img src="https://opencollective.com/koajs/backer/6/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/7/website" target="_blank"><img src="https://opencollective.com/koajs/backer/7/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/8/website" target="_blank"><img src="https://opencollective.com/koajs/backer/8/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/9/website" target="_blank"><img src="https://opencollective.com/koajs/backer/9/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/10/website" target="_blank"><img src="https://opencollective.com/koajs/backer/10/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/11/website" target="_blank"><img src="https://opencollective.com/koajs/backer/11/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/12/website" target="_blank"><img src="https://opencollective.com/koajs/backer/12/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/13/website" target="_blank"><img src="https://opencollective.com/koajs/backer/13/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/14/website" target="_blank"><img src="https://opencollective.com/koajs/backer/14/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/15/website" target="_blank"><img src="https://opencollective.com/koajs/backer/15/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/16/website" target="_blank"><img src="https://opencollective.com/koajs/backer/16/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/17/website" target="_blank"><img src="https://opencollective.com/koajs/backer/17/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/18/website" target="_blank"><img src="https://opencollective.com/koajs/backer/18/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/19/website" target="_blank"><img src="https://opencollective.com/koajs/backer/19/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/20/website" target="_blank"><img src="https://opencollective.com/koajs/backer/20/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/21/website" target="_blank"><img src="https://opencollective.com/koajs/backer/21/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/22/website" target="_blank"><img src="https://opencollective.com/koajs/backer/22/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/23/website" target="_blank"><img src="https://opencollective.com/koajs/backer/23/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/24/website" target="_blank"><img src="https://opencollective.com/koajs/backer/24/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/25/website" target="_blank"><img src="https://opencollective.com/koajs/backer/25/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/26/website" target="_blank"><img src="https://opencollective.com/koajs/backer/26/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/27/website" target="_blank"><img src="https://opencollective.com/koajs/backer/27/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/28/website" target="_blank"><img src="https://opencollective.com/koajs/backer/28/avatar.svg"></a>
<a href="https://opencollective.com/koajs/backer/29/website" target="_blank"><img src="https://opencollective.com/koajs/backer/29/avatar.svg"></a>


## Sponsors

Become a sponsor and get your logo on our README on Github with a link to your site. 

<a href="https://opencollective.com/koajs/sponsor/0/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/1/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/2/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/3/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/4/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/5/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/6/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/7/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/8/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/9/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/9/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/10/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/10/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/11/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/11/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/12/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/12/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/13/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/13/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/14/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/14/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/15/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/15/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/16/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/16/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/17/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/17/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/18/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/18/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/19/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/19/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/20/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/20/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/21/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/21/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/22/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/22/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/23/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/23/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/24/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/24/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/25/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/25/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/26/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/26/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/27/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/27/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/28/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/28/avatar.svg"></a>
<a href="https://opencollective.com/koajs/sponsor/29/website" target="_blank"><img src="https://opencollective.com/koajs/sponsor/29/avatar.svg"></a>

# License

  MIT

[npm-image]: https://img.shields.io/npm/v/koa.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/koa
[travis-image]: https://img.shields.io/travis/koajs/koa/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/koa
[coveralls-image]: https://img.shields.io/codecov/c/github/koajs/koa.svg?style=flat-square
[coveralls-url]: https://codecov.io/github/koajs/koa?branch=master
[backers-image]: https://opencollective.com/koajs/backers/badge.svg?style=flat-square
[sponsors-image]: https://opencollective.com/koajs/sponsors/badge.svg?style=flat-square
[gitter-image]: https://img.shields.io/gitter/room/koajs/koa.svg?style=flat-square
[gitter-url]: https://gitter.im/koajs/koa?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge
[#koajs]: https://webchat.freenode.net/?channels=#koajs
