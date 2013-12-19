
# Frequently Asked Questions

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

## Do Generators Decrease Performance?

  Barely - check out the benchmarks in our readme, the numbers
  are more than fine, and there's no substition for proper
  horizontal scaling.