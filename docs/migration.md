# Migrating from Koa v1.x to v2.x

## New middleware signature 

Koa v2 introduces a new signature for middleware.

**Old signature middleware (v1.x) support will be removed in v3**

The new middleware signature is:

```js
// uses async arrow functions
app.use(async (ctx, next) => {
  try {
    await next() // next is now a function
  } catch (err) {
    ctx.body = { message: err.message }
    ctx.status = err.status || 500
  }
})

app.use(async ctx => {
  const user = await User.getById(this.session.userid) // await instead of yield
  ctx.body = user // ctx instead of this
})
```

You don't have to use asynchronous functions - you just have to pass a function that returns a promise. 
A regular function that returns a promise works too!

The signature has changed to pass `Context` via an explicit parameter, `ctx` above, instead of via
`this`.  The context passing change makes Koa more compatible with es6 arrow functions, which capture `this`.

## Using v1.x Middleware in v2.x

Koa v2.x will try to convert legacy signature, generator middleware on `app.use`, using [koa-convert](https://github.com/koajs/convert).
It is however recommended that you choose to migrate all v1.x middleware as soon as possible.

```js
// Koa will convert
app.use(function *(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
});
```

You could do it manually as well, in which case Koa will not convert.

```js
const convert = require('koa-convert');

app.use(convert(function *(next) {
  const start = Date.now();
  yield next;
  const ms = Date.now() - start;
  console.log(`${this.method} ${this.url} - ${ms}ms`);
}));
```

## Upgrading middleware

You will have to convert your generators to async functions with the new middleware signature:

```js
app.use(async (ctx, next) => {
  const user = await Users.getById(this.session.user_id);
  await next();
  ctx.body = { message: 'some message' };
})
```

Upgrading your middleware may require some work. One migration path is to update them one-by-one.

1. Wrap all your current middleware in `koa-convert`
2. Test
3. `npm outdated` to see which Koa middleware is outdated
4. Update one outdated middleware, remove using `koa-convert`
5. Test
6. Repeat steps 3-5 until you're done


## Updating your code

You should start refactoring your code now to ease migrating to Koa v2:

- Return promises everywhere!
- Do not use `yield*`
- Do not use `yield {}` or `yield []`.
  - Convert `yield []` into `yield Promise.all([])`
  - Convert `yield {}` into `yield Bluebird.props({})`

You could also refactor your logic outside of Koa middleware functions. Create functions like 
`function* someLogic(ctx) {}` and call it in your middleware as 
`const result = yield someLogic(this)`.
Not using `this` will help migrations to the new middleware signature, which does not use `this`.

## Application object constructor requires new 

In v1.x, the Application constructor function could be called directly, without `new` to 
instantiate an instance of an application.  For example:

```js
var koa = require('koa');
var app = module.exports = koa();
```

v2.x uses es6 classes which require the `new` keyword to be used.

```js
var koa = require('koa');
var app = module.exports = new koa();
```

## ENV specific logging behavior removed

An explicit check for the `test` environment was removed from error handling. 

## Dependency changes

- [co](https://github.com/tj/co) is no longer bundled with Koa.  Require or import it directly.
- [composition](https://github.com/thenables/composition) is no longer used and deprecated.

## v1.x support

The v1.x branch is still supported but should not receive feature updates.  Except for this migration
guide, documentation will target the latest version.

## Help out

If you encounter migration related issues not covered by this migration guide, please consider 
submitting a documentation pull request.
