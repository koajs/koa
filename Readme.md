
![koa middleware framework for nodejs](https://dsz91cxz97a03.cloudfront.net/uXIzgVnPWG-150x150.png)

  Expressive middleware for node.js using generators via [co](https://github.com/visionmedia/co)
  to make writing web applications and REST APIs more enjoyable to write. 

  Koa provides a useful set of methods that make day to day web application and API design much
  faster, and less error-prone than "raw" nodejs. Many of these utilities were extracted from [Express](https://github.com/visionmedia/express),
  however moving them to this layer allows middleware developers to avoid boilerplate and refrain from re-implementing
  many of these features, sometimes incorrectly or incomplete.

  Only methods that are common to nearly all HTTP servers are integrated directly into Koa's small ~400 SLOC codebase. No middleware
  are bundled with koa. If you prefer to only define a single dependency for common middleware, much like Connect, you may use
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
 - [Middleware](https://github.com/koajs/koa/wiki/Middleware) list
 - [Wiki](https://github.com/koajs/koa/wiki)
 - [G+ Community](https://plus.google.com/communities/101845768320796750641)
 - [Mailing list](https://groups.google.com/forum/#!forum/koajs)
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

# License

  MIT
