![koa middleware framework for nodejs](https://i.cloudup.com/uXIzgVnPWG-150x150.png)

  [![Build Status](https://travis-ci.org/koajs/koa.png)](https://travis-ci.org/koajs/koa)

  Expressive middleware for node.js using generators via [co](https://github.com/visionmedia/co)
  to make web applications and REST APIs more enjoyable to write.

  Only methods that are common to nearly all HTTP servers are integrated directly into Koa's small ~400 SLOC codebase. This
  includes things like content-negotiation, normalization of node inconsistencies, redirection, and a few others.

  No middleware are bundled with koa. If you prefer to only define a single dependency for common middleware, much like Connect, you may use
  [koa-common](https://github.com/koajs/common).

## Installation

```
$ npm install koa
```

  To use Koa you must be running __node 0.11.4__ or higher for generator support, and must run node(1)
  with the `--harmony-generators` flag. If you don't like typing this, add an alias to your shell profile:

```
alias node='node --harmony-generators'
```

## Community

 - [API](docs/api/index.md) documentation
 - [Middleware](https://github.com/koajs/koa/wiki) list
 - [Wiki](https://github.com/koajs/koa/wiki)
 - [G+ Community](https://plus.google.com/communities/101845768320796750641)
 - [Mailing list](https://groups.google.com/forum/#!forum/koajs)
 - [Guide](docs/guide.md)
 - [FAQ](docs/faq.md)
 - __#koajs__ on freenode

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

## Benchmarks

  If you like silly benchmarks, here's the requests per second using
  [wrk](https://github.com/wg/wrk) 3.x on my MBP.

```
1 middleware
8367.03

5 middleware
8074.10

10 middleware
7526.55

15 middleware
7399.92

20 middleware
7055.33

30 middleware
6460.17

50 middleware
5671.98

100 middleware
4349.37
```

  With __50__ middleware (likely much more than you'll need), that's __340,260__ requests per minute, and __20,415,600__ per hour,  and over __440 million__ per day, so unless you're a Facebook and can't manage to spin up more
  than one process to scale horizontally you'll be fine ;)

## Authors

  - [TJ Holowaychuk](https://github.com/visionmedia)
  - [Jonathan Ong](https://github.com/jonathanong)
  - [Julian Gruber](https://github.com/juliangruber)

# License

  MIT
