
## Writing Middleware

  Koa middleware are simple functions which return a `GeneratorFunction`, and accept another. When
  the middleware is run by an "upstream" middleware, it must manually `yield` to the "downstream" middleware.

  For example if you wanted to track how long it takes for a request to propagate through Koa by adding an
  `X-Response-Time` header field the middleware would look like the following:

```js
function *responseTime(next){
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

![koa middleware](https://i.cloudup.com/N7L5UakJo0.gif)

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
function logger(format){
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

  Naming middleware is optional, however it's useful for debugging purposes to
  assign a name.

```js
function logger(format){
  return function *logger(next){

  }
}
```

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

