
## Writing Middleware

  Koa middleware are simple functions which return a `GeneratorFunction`, and accept another. When
  the middleware is run by an "upstream" middleware, it must manually `yield` to the "downstream" middleware.

  For example if you wanted to track how long it takes for a request to propagate through Koa by adding an
  `X-Response-Time` header field the middleware would look like the following:

```js
function responseTime(next){
  return function *(){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    this.set('X-Response-Time', ms + 'ms');
  }
}

app.use(responseTime);
```

  Here's another way to write the same thing, inline:

```js
app.use(function(next){
  return function *(){
    var start = new Date;
    yield next;
    var ms = new Date - start;
    this.set('X-Response-Time', ms + 'ms');
  }
});
```

  If you're a front-end developer you can think any code before `yield next;` as the "capture" phase,
  while any code after is the "bubble" phase. This crude gif illustrates how ES6 generators allow us
  to properly utilize stack flow to implement request and response flows:

![koa middleware](https://i.cloudup.com/N7L5UakJo0.gif)

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

  return function(next){
    return function *(){
      var str = format
        .replace(':method', this.method)
        .replace(':url', this.url);

      console.log(str);
      
      yield next;
    }
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
  return function(next){
    return function *logger(){
      // ^-- name this guy
    }
  }
}
```



