
# Guide

  This guide covers Koa topics are not directly API related, such as best practices for writing middleware,
  application structure suggestions.

## Writing Middleware

  Koa middleware are simple functions which return a `GeneratorFunction`, and accept another. When
  the middleware is run by an "upstream" middleware, it must manually `yield` to the "downstream" middleware.

  For example if you wanted to track how long it takes for a request to propagate through Koa by adding an
  `X-Response-Time` header field the middleware would look like the following:

```js
function *responseTime(next) {
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
}

app.use(responseTime);
```

  Here's another way to write the same thing, inline:

```js
app.use(function *(next){
  var start = new Date;
  yield next;
  var ms = new Date - start;
  this.set('X-Response-Time', ms + 'ms');
});
```

  If you're a front-end developer you can think any code before `yield next;` as the "capture" phase,
  while any code after is the "bubble" phase. This crude gif illustrates how ES6 generators allow us
  to properly utilize stack flow to implement request and response flows:

![koa middleware](/docs/middleware.gif)

   1. Create a date to track duration
   2. Yield control to the next middleware
   3. Create another date to track response time
   4. Yield control to the next middleware
   5. Yield immediately since `contentLength` only works with responses
   6. Yield upstream to Koa's noop middleware
   7. Ignore setting the body unless the path is "/"
   8. Set the response to "Hello World"
   9. Ignore setting `Content-Length` when no body is present
   10. Set the field
   11. Output log line
   12. Set `X-Response-Time` header field before response
   13. Hand off to Koa to handle the response


Note that the final middleware (step __6__) yields to what looks to be nothing - it's actually
yielding to a no-op generator within Koa. This is so that every middleware can conform with the
same API, and may be placed before or after others. If you removed `yield next;` from the furthest
"downstream" middleware everything would function appropritaely, however it would no longer conform
to this behaviour.

 For example this would be fine:

```js
app.use(function *response(){
  if ('/' != this.url) return;
  this.body = 'Hello World';
});
```

 Next we'll look at the best practices for creating Koa middleware.

## Middleware Best Practices

  This section covers middleware authoring best practices, such as middleware
  accepting options, named middleware for debugging, among others.

### Middleware options

  When creating public middleware it's useful to conform to the convention of
  wrapping the middleware in a function that accepts options, allowing users to
  extend functionality. Even if your middleware accepts _no_ options, this is still
  a good idea to keep things uniform.

  Here our contrived `logger` middleware accepts a `format` string for customization,
  and returns the middleware itself:

```js
function logger(format) {
  format = format || ':method ":url"';

  return function *(next){
    var str = format
      .replace(':method', this.method)
      .replace(':url', this.url);

    console.log(str);

    yield next;
  }
}

app.use(logger());
app.use(logger(':method :url'));
```

### Named middleware

  Naming middleware is optional, however it's useful for debugging purposes to assign a name.

```js
function logger(format) {
  return function *logger(next){

  }
}
```

### Combining multiple middleware

  Sometimes you want to "compose" multiple middleware into a single middleware for easy re-use or exporting. To do so, you may chain them together with `.call(this, next)`s, then return another function that yields the chain.

```js
function *random(next) {
  if ('/random' == this.path) {
    this.body = Math.floor(Math.random()*10);
  } else {
    yield next;
  }
};

function *backwards(next) {
  if ('/backwards' == this.path) {
    this.body = 'sdrawkcab';
  } else {
    yield next;
  }
}

function *pi(next) {
  if ('/pi' == this.path) {
    this.body = String(Math.PI);
  } else {
    yield next;
  }
}

function *all(next) {
  yield random.call(this, backwards.call(this, pi.call(this, next)));
}

app.use(all);
```

  This is exactly what [koa-compose](https://github.com/koajs/compose) does, which Koa internally uses to create and dispatch the middleware stack.

### Response Middleware

  Middleware that decide to respond to a request and wish to bypass downstream middleware may
  simply omit `yield next`. Typically this will be in routing middleware, but this can be performed by
  any. For example the following will respond with "two", however all three are executed, giving the
  downstream "three" middleware a chance to manipulate the response.

```js
app.use(function *(next){
  console.log('>> one');
  yield next;
  console.log('<< one');
});

app.use(function *(next){
  console.log('>> two');
  this.body = 'two';
  yield next;
  console.log('<< two');
});

app.use(function *(next){
  console.log('>> three');
  yield next;
  console.log('<< three');
});
```

  The following configuration omits `yield next` in the second middleware, and will still respond
  with "two", however the third (and any other downstream middleware) will be ignored:

```js
app.use(function *(next){
  console.log('>> one');
  yield next;
  console.log('<< one');
});

app.use(function *(next){
  console.log('>> two');
  this.body = 'two';
  console.log('<< two');
});

app.use(function *(next){
  console.log('>> three');
  yield next;
  console.log('<< three');
});
```

  When the furthest downstream middleware executes `yield next;` it's really yielding to a noop
  function, allowing the middleware to compose correctly anywhere in the stack.

## Async operations

  The [Co](https://github.com/visionmedia/co) forms Koa's foundation for generator delegation, allowing
  you to write non-blocking sequential code. For example this middleware reads the filenames from `./docs`,
  and then reads the contents of each markdown file in parallel before assigning the body to the joint result.


```js
var fs = require('co-fs');

app.use(function *(){
  var paths = yield fs.readdir('docs');

  var files = yield paths.map(function(path){
    return fs.readFile('docs/' + path, 'utf8');
  });

  this.type = 'markdown';
  this.body = files.join('');
});
```

## Debugging Koa

  Koa along with many of the libraries it's built with support the __DEBUG__ environment variable from [debug](https://github.com/visionmedia/debug) which provides simple conditional logging.

  For example
  to see all koa-specific debugging information just pass `DEBUG=koa*` and upon boot you'll see the list of middleware used, among other things.

```
$ DEBUG=koa* node --harmony examples/simple
  koa:application use responseTime +0ms
  koa:application use logger +4ms
  koa:application use contentLength +0ms
  koa:application use notfound +0ms
  koa:application use response +0ms
  koa:application listen +0ms
```

  Since JavaScript does not allow defining function names at
  runtime, you can also set a middleware's name as `._name`.
  This useful when you don't have control of a middleware's name.
  For example:

```js
var path = require('path');
var static = require('koa-static');

var publicFiles = static(path.join(__dirname, 'public'));
publicFiles._name = 'static /public';

app.use(publicFiles);
```

  Now, instead of just seeing "static" when debugging, you will see:

```
  koa:application use static /public +0ms
```
