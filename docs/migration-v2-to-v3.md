# Migrating from Koa v2.x to v3.x

## Breaking Changes

### Node.js Version Requirement

Koa v3 requires **Node.js v18.0.0** or higher.

### Removal of v1.x Middleware Support

As announced in Koa v2.x, support for the old middleware signature (generator functions) has been removed in v3.

If you were still using generator middleware with `koa-convert`, you'll need to update all middleware to use async functions or functions that return promises.

### HTTP Errors Update

Koa v3 updates `http-errors` to v2.0.0, which changes the signature of `ctx.throw()`:

```js
// Old format in Koa v2.x
ctx.throw(status, message, properties)

// New format in Koa v3.x
ctx.throw(status, error, properties)
```

See the [http-errors documentation](https://www.npmjs.com/package/http-errors) for more details.

### Redirect Changes

The `res.redirect('back')` method has been removed. Instead, use the new `ctx.back()` method:

```js
// Old way in Koa v2.x
ctx.response.redirect('back')

// New way in Koa v3.x
ctx.back()
```

### QueryString Replacement

Node's querystring module has been replaced with `URLSearchParams`. This should be mostly transparent to users, but might cause subtle differences in query string parsing.

## New Features

### AsyncLocalStorage Support

Koa v3 adds support for AsyncLocalStorage, which allows you to access the current context from anywhere in your application:

```js
// Enable AsyncLocalStorage
const app = new Koa({ asyncLocalStorage: true })

app.use(async (ctx, next) => {
  callSomeFunction()
  await next()
})

function callSomeFunction() {
  // Access the current context
  const ctx = app.currentContext
  // Do something with ctx
}
```

You can also pass your own AsyncLocalStorage instance:

```js
const { AsyncLocalStorage } = require('async_hooks')
const asyncLocalStorage = new AsyncLocalStorage()
const app = new Koa({ asyncLocalStorage })

app.use(async (ctx, next) => {
  callSomeFunction()
  await next()
})

function callSomeFunction() {
  // Access the current context
  const ctx = asyncLocalStorage.getStore()
  // Do something with ctx
}
```

### Web WHATWG Support

Koa v3 adds support for Web WHATWG standards, including:

- Support for `Blob` objects as response bodies
- Support for `ReadableStream` objects as response bodies
- Support for `Response` objects as response bodies

```js
app.use(async ctx => {
  // Using a Blob
  ctx.body = new Blob(['Hello World'], { type: 'text/plain' })
  
  // Using a ReadableStream
  ctx.body = new ReadableStream({
    start(controller) {
      controller.enqueue('Hello World')
      controller.close()
    }
  })
  
  // Using a Response object
  ctx.body = new Response('Hello World', { 
    headers: { 'Content-Type': 'text/plain' } 
  })
})
```

## Upgrading Guide

1. Update your Node.js version to v18.0.0 or higher
2. Update all generator middleware to use async functions
3. Update any calls to `ctx.throw()` to use the new signature
4. Replace `ctx.response.redirect('back')` with `ctx.back()`
5. Test your application thoroughly to ensure compatibility
