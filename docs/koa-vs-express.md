
THIS DOCUMENT IS IN PROGRESS. THIS PARAGRAPH SHALL BE REMOVED WHEN THIS DOCUMENT IS DONE.

TO DO:

- Remove benchmark from readme

# Koa vs Express

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

## Is Koa faster than Express?

  Koa and Express have very similar benchmark results, both of which are more than enough for most applications. This is especially true for applications with high traffic running multiple instances, because you are scaling horizontally right?

  The following results were produced on a Retina Macbook Pro, showing only the cost of running noop middleware.

```
  1 middleware
  8849.36

  5 middleware
  8685.74

  10 middleware
  8511.08

  15 middleware
  8456.86

  20 middleware
  8211.93

  30 middleware
  8102.98

  50 middleware
  7617.67

  100 middleware
  6899.45
```

  Here are the benchmarks for Express:

```
  1 middleware
  7805.19

  5 middleware
  7707.15

  10 middleware
  7475.08

  15 middleware
  7261.73

  20 middleware
  7012.07

  30 middleware
  6672.76

  50 middleware
  6255.92

  100 middleware
  5000.98
```

## How is Koa different than Connect/Express?

### Generated-based control flow

  Thanks to co.

  No callback hell.

  Better error handling through try/catch.

  No need for domains.

### Koa is barebone

  Unlike both Connect and Express, Koa does not include any middleware.

  Unlike Express, routing is not provided.

  Unlike Express, many convenience utilities are not provided. For example, sending files.

  More modular.

### Koa relies less middleware

  For example, instead of a "body parsing" middleware, you would instead use a body parsing function.

### Koa abstracts node's request/response

  Less hackery.

  Proper stream handling.
