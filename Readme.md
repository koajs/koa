<img src="https://dl.dropboxusercontent.com/u/6396913/koa/logo.png" alt="koa middleware framework for nodejs" width="255px" />

  [![gitter][gitter-image]][gitter-url]
  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
  [![OpenCollective Backers][backers-image]](#backers)
  [![OpenCollective Sponsors][sponsors-image]](#sponsors)

  Expressive HTTP middleware framework for node.js to make web applications and APIs more enjoyable to write. Koa's middleware stack flows in a stack-like manner, allowing you to perform actions downstream then filter and manipulate the response upstream.

  Only methods that are common to nearly all HTTP servers are integrated directly into Koa's small ~570 SLOC codebase. This
  includes things like content negotiation, normalization of node inconsistencies, redirection, and a few others.

  Koa is not bundled with any middleware.

## Installation

Koa requires __node v7.6.0__ or higher for ES2015 and async function support.

```
$ npm install koa
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

Koa is a middleware framework that can take two different kinds of functions as middleware:

  * async function
  * common function

Here is an example of logger middleware with each of the different functions:

### ___async___ functions (node v7.6+)

```js
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});
```

### Common function

```js
// Middleware normally takes two parameters (ctx, next), ctx is the context for one request,
// next is a function that is invoked to execute the downstream middleware. It returns a Promise with a then function for running code after completion.

app.use((ctx, next) => {
  const start = Date.now();
  return next().then(() => {
    const ms = Date.now() - start;
    console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
  });
});
```

### Koa v1.x Middleware Signature

The middleware signature changed between v1.x and v2.x.  The older signature is deprecated.

**Old signature middleware support will be removed in v3**

Please see the [Migration Guide](docs/migration.md) for more information on upgrading from v1.x and
using v1.x middleware with v2.x.

## Context, Request and Response

Each middleware receives a Koa `Context` object that encapsulates an incoming
http message and the corresponding response to that message.  `ctx` is often used
as the parameter name for the context object.

```js
app.use(async (ctx, next) => { await next(); });
```

Koa provides a `Request` object as the `request` property of the `Context`.  
Koa's `Request` object provides helpful methods for working with
http requests which delegate to an [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
from the node `http` module.

Here is an example of checking that a requesting client supports xml.

```js
app.use(async (ctx, next) => {
  ctx.assert(ctx.request.accepts('xml'), 406);
  // equivalent to:
  // if (!ctx.request.accepts('xml')) ctx.throw(406);
  await next();
});
```

Koa provides a `Response` object as the `response` property of the `Context`.  
Koa's `Response` object provides helpful methods for working with
http responses which delegate to a [ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse)
.  

Koa's pattern of delegating to Node's request and response objects rather than extending them
provides a cleaner interface and reduces conflicts between different middleware and with Node
itself as well as providing better support for stream handling.  The `IncomingMessage` can still be
directly accessed as the `req` property on the `Context` and `ServerResponse` can be directly
accessed as the `res` property on the `Context`.

Here is an example using Koa's `Response` object to stream a file as the response body.

```js
app.use(async (ctx, next) => {
  await next();
  ctx.response.type = 'xml';
  ctx.response.body = fs.createReadStream('really_large.xml');
});
```

The `Context` object also provides shortcuts for methods on its `request` and `response`.  In the prior
examples,  `ctx.type` can be used instead of `ctx.request.type` and `ctx.accepts` can be used
instead of `ctx.request.accepts`.

For more information on `Request`, `Response` and `Context`, see the [Request API Reference](docs/api/request.md),
[Response API Reference](docs/api/response.md) and [Context API Reference](docs/api/context.md).

## Koa Application

The object created when executing `new Koa()` is known as the Koa application object.

The application object is Koa's interface with node's http server and handles the registration
of middleware, dispatching to the middleware from http, default error handling, as well as
configuration of the context, request and response objects.

Learn more about the application object in the [Application API Reference](docs/api/index.md).

## Documentation

 - [Usage Guide](docs/guide.md)
 - [Error Handling](docs/error-handling.md)
 - [Koa for Express Users](docs/koa-vs-express.md)
 - [FAQ](docs/faq.md)
 - [API documentation](docs/api/index.md)

## Babel setup

If you're not using `node v7.6+`, we recommend setting up `babel` with [`babel-preset-env`](https://github.com/babel/babel-preset-env):

```bash
$ npm install babel-register babel-preset-env --save
```

Setup `babel-register` in your entry file:

```js
require('babel-register');
```

And have your `.babelrc` setup:

```json
{
  "presets": [
    ["env", {
      "targets": {
        "node": true
      }
    }]
  ]
}
```

## Troubleshooting

Check the [Troubleshooting Guide](docs/troubleshooting.md) or [Debugging Koa](docs/guide.md#debugging-koa) in
the general Koa guide.

## Running tests

```
$ make test
```

## Authors

See [AUTHORS](AUTHORS).

## Community

 - [Badgeboard](https://koajs.github.io/badgeboard) and list of official modules
 - [Examples](https://github.com/koajs/examples)
 - [Middleware](https://github.com/koajs/koa/wiki) list
 - [Wiki](https://github.com/koajs/koa/wiki)
 - [G+ Community](https://plus.google.com/communities/101845768320796750641)
 - [Reddit Community](https://www.reddit.com/r/koajs)
 - [Mailing list](https://groups.google.com/forum/#!forum/koajs)
 - [中文文档](https://github.com/guo-yu/koa-guide)
 - __[#koajs]__ on freenode

## Job Board

Looking for a career upgrade?

<a href="https://astro.netlify.com/automattic"><img src="https://astro.netlify.com/static/automattic.png"></a>
<a href="https://astro.netlify.com/segment"><img src="https://astro.netlify.com/static/segment.png"></a>
<a href="https://astro.netlify.com/auth0"><img src="https://astro.netlify.com/static/auth0.png"/></a>

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
