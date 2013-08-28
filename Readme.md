
![koa middleware framework for nodejs](https://dsz91cxz97a03.cloudfront.net/uXIzgVnPWG-150x150.png)

  Expressive middleware for node.js using generators via [co](https://github.com/visionmedia/co)
  to make writing web applications and REST APIs more enjoyable to write. 

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

 - [API](docs/api.md) documentation
 - [Middleware](https://github.com/koajs/koa/wiki/Koa) list
 - [Wiki](https://github.com/koajs/koa/wiki/Koa)
 - [G+ Community](https://plus.google.com/communities/101845768320796750641)
 - [Mailing list](https://groups.google.com/forum/#!forum/koajs)
 - [FAQ](docs/faq.md)
 - __#koajs__ on freenode

## Example

```js
var koa = require('koa');
var app = koa();

// logger

app.use(function(next){
  return function *(){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
  }
});

// response

app.use(function(next){
  return function *(){
    yield next;
    this.body = 'Hello World';
  }
});

app.listen(3000);
```

## Running tests

```
$ make test
```

## Benchmarks

  Average latency with one middleware:

    0.628ms

  Average latency with __400__ noop middleware:

    1.5ms

  If you like silly benchmarks, here's the requests per second:

```
1 middleware
8083.45

5 middleware
7449.95

10 middleware
7166.66

15 middleware
6992.18

20 middleware
6650.28

30 middleware
6113.57

50 middleware
5117.46
```

  With __50__ middleware (likely much more than you'll need), that's __307,020__ requests per minute, and __18,421,200__ per hour, so unless you're a facebook and can't manage to spin up more
  than one process to scale horizontally you'll be fine ;)

## Authors

  - [TJ Holowaychuk](https://github.com/visionmedia)
  - [Julian Gruber](https://github.com/juliangruber)
  - [Jonathan Ong](https://github.com/jonathanong)

# License

  MIT
