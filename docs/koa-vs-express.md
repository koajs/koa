THIS DOCUMENT IS IN PROGRESS. THIS PARAGRAPH SHALL BE REMOVED WHEN THIS DOCUMENT IS DONE.

# Koa vs Express

  Philosophically, Koa aims to "fix and replace node", whereas Express "augments node".
  Koa uses co to rid apps of callback hell and simplify error handling.
  It exposes its own `this.request` and `this.response` objects instead of node's `req` and `res` objects.

  Express, on the other hand, augments node's `req` and `res` objects with additional properties and methods
  and includes many other "framework" features, such as routing and templating, which Koa does not.

  Thus, Koa can be viewed as an abstraction of node.js's `http` modules, where as Express is an application framework for node.js.

| Feature           | Koa | Express | Connect |
|------------------:|-----|---------|---------|
| Middleware Kernel | ✓   | ✓       | ✓       |
| Routing           |     | ✓       |         |
| Templating        |     | ✓       |         |
| Sending Files     |     | ✓       |         |
| JSONP             |     | ✓       |         |


  Thus, if you'd like to be closer to node.js and traditional node.js-style coding, you probably want to stick to Connect/Express or similar frameworks.
  If you want to dive into the land of generators, use Koa.

  As result of this different philosophy is that traditional node.js "middleware", i.e. functions of the form `(req, res, next)`, are incompatible with Koa. Your application will essentially have to be rewritten from the ground, up.

## Does Koa replace Express?

  It's more like Connect, but a lot of the Express goodies
  were moved to the middleware level in Koa to help form
  a stronger foundation. This makes middleware more enjoyable
  and less error-prone to write, for the entire stack, not
  just the end application code.

  Typically many middleware would
  re-implement similar features, or even worse incorrectly implement them,
  when features like signed cookie secrets among others are typically application-specific,
  not middleware specific.

## Does Koa replace Connect?

  No, just a different take on similar functionality
  now that generators allow us to write code with less
  callbacks. Connect is equally capable, and some may still prefer it,
  it's up to what you prefer.

## Why isn't Koa just Express 4.0?

  Koa is a pretty large departure from what people know about Express,
  the design is fundamentally much different, so the migration from
  Express 3.0 to this Express 4.0 would effectively mean rewriting
  the entire application, so we thought it would be more appropriate
  to create a new library.

## How is Koa different than Connect/Express?

### Generated-based control flow

  Thanks to co.

  No callback hell.

  Better error handling through try/catch.

  No need for domains.

### Koa is barebones

  Unlike both Connect and Express, Koa does not include any middleware.

  Unlike Express, routing is not provided.

  Unlike Express, many convenience utilities are not provided. For example, sending files.

  Koa is more modular.

### Koa relies less on middleware

  For example, instead of a "body parsing" middleware, you would instead use a body parsing function.

### Koa abstracts node's request/response

  Less hackery.

  Better user experience.

  Proper stream handling.
