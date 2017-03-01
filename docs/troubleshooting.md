# Troubleshooting Koa

- [Whenever I try to access my route, it sends back a 404](#whenever-i-try-to-access-my-route-it-sends-back-a-404)
- [My response or context changes have no effect](#my-response-or-context-changes-have-no-effect)
- [My middleware is not called](#my-middleware-is-not-called)

See also [debugging Koa](guide.md#debugging-koa).

If you encounter a problem and later learn how to fix it, and think others might also encounter that problem, please 
consider contributing to this documentation.

## Whenever I try to access my route, it sends back a 404

This is a common but troublesome problem when working with Koa middleware. First, it is critical to understand when Koa generates a 404. Koa does not care which or how much middleware was run, in many cases a 200 and 404 trigger the same number of middleware. Instead, the default status for any response is 404. The most obvious way this is changed is through `ctx.status`. However, if `ctx.body` is set when the status has not been explicitly defined (through `ctx.status`), the status is set to 200. This explains why simply setting the body results in a 200. Once the middleware is done (when the middleware and any returned promises are complete), Koa sends out the response. After that, nothing can alter the response. If it was a 404 at the time, it will be a 404 at the end, even if `ctx.status` or `ctx.body` are set afterwords.

Even though we now understand the basis of a 404, it might not be as clear why a 404 is generated in a specific case. This can be especially troublesome when it seems that `ctx.status` or `ctx.body` are set. 

The unexpected 404 is a specific symptom of one of these more general problems:

- [My response or context changes have no effect](#my-response-or-context-changes-have-no-effect)
- [My middleware is not called](#my-middleware-is-not-called)

## My response or context changes have no effect

This can be caused when the response is sent before the code making the change is
executed.  If the change is to the `ctx.body` or `ctx.status` setter, this can cause a 404 and
is by far the most common cause of these problems.

### Problematic code

```js
router.get('/fetch', function (ctx, next) {
  models.Book.findById(parseInt(ctx.query.id)).then(function (book) {
    ctx.body = book;
  });
});
```

When used, this route will always send back a 404, even though `ctx.body` is set.

The same behavior would occur in this `async` version:

```js
router.get('/fetch', async (ctx, next) => {
  models.Book.findById(parseInt(ctx.query.id)).then(function (book) {
    ctx.body = book;
  });
});
```

### Cause

`ctx.body` is not set until *after* the response has been sent. The code doesn't tell Koa to wait for the database to return the record. Koa sends the response after the middleware has been run, but not after the callback inside the middleware has been run. In the gap there, `ctx.body` has not yet been set, so Koa responds with a 404.

### Identifying this as the issue

Adding another piece of middleware and some logging can be extremely helpful in identifying this issue.

```js
router.use('/fetch', function (ctx, next) {
  return next().then(function () {
    console.log('Middleware done'); 
  }); 
});

router.get('/fetch', function (ctx, next) {
  models.Book.findById(parseInt(ctx.query.id)).then(function (book) {
    ctx.body = book;
    console.log('Body set');
  });
});
```

If you see this in the logs:

```
Middleware done 
Body set
```

It means that the body is being set after the middleware is done, and after the response has been sent. If you see only one or none of these logs, proceed to [My middleware is not called](#my-middleware-is-not-called). If they are in the right order, make sure you haven't explicitly set the status to 404, make sure that it actually is a 404, and if that fails feel free to ask for help.

### Solution

```js
router.get('/fetch', function (ctx, next) {
  return models.Book.findById(parseInt(ctx.query.id)).then(function (book) {
    ctx.body = book;
  });
});
```

Returning the promise given by the database interface tells Koa to wait for the promise to finish before responding. At that time, the body will have been set. This results in Koa sending back a 200 with a proper response.

The fix in the `async` version is to add an `await` statement:

```js
router.get('/fetch', async (ctx, next) => {
  await models.Book.findById(parseInt(ctx.query.id)).then(function (book) {
    ctx.body = book;
  });
});
```

## My middleware is not called

This can be due to an interrupted chain of middleware calls.  This can cause a 404 if the
middleware that is skipped is responsible for the `ctx.body` or `ctx.status` setter.
This is less common than [My response or context changes have no effect](#my-response-or-context-changes-have-no-effect),
but it can be a much bigger pain to troubleshoot.

### Problematic code

```js
router.use(function (ctx, next) {
  // Don't Repeat Yourself! Let's parse the ID here for all our middleware
  if (ctx.query.id) {
    ctx.state.id = parseInt(ctx.query.id);
  }
});

router.get('/fetch', function (ctx, next) {
  return models.Book.findById(ctx.state.id).then(function (book) {
    ctx.body = book;
  });
});
```

### Cause

In the code above, the book is never fetched from the database, and in fact our route was never called. Look closely at our helper middleware. We forgot to `return next()`! This causes the middleware flow to never reach our route, ending our "helper" middleware.

### Identifying this as the issue

Identifying this problem is easier than most, add a log at the beginning of the route. If it doesn't trigger, your route was never reached in the middleware chain.

```js
router.use(function (ctx, next) {
  // Don't Repeat Yourself! Let's parse the ID here for all our middleware
  if (ctx.query.id) {
    ctx.state.id = parseInt(ctx.query.id);
  }
});

router.get('/fetch', function (ctx, next) {
  console.log('Route called'); // Never happens
  return models.Book.findById(ctx.state.id).then(function (book) {
    ctx.body = book;
  });
});
```

To find the middleware causing the problem, try adding logging at various points in the middleware chain.

### Solution

The solution for this is rather easy, simply add `return next()` to the end of your helper middleware.

```js
router.use(function (ctx, next) {
  if (ctx.query.id) {
    ctx.state.id = parseInt(ctx.query.id);
  }
  return next();
});

router.get('/fetch', function (ctx, next) {
  return models.Book.findById(ctx.state.id).then(function (book) {
    ctx.body = book;
  });
});
```
