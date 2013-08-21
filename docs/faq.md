
# Frequently Asked Questions

## Does Koa replace Express?

  No, it's more like Connect.

## Does Koa replace Connect?

  No, just a different take on similar functionality
  now that generators allow us to write code with less
  callbacks. Connect is equally capable, and some may still prefer it.

## Why does Koa have functionality similar to Express?

  Many of the Express request/response methods have been moved to Koa because
  they are more useful at the middleware level. If you make the edges smart,
  the intermediaries can do less and become more dumb, this reduces and conflicts
  when middleware constantly attempt to re-invent the same behaviours such as parsing
  signed cookies.

  Additionally it makes writing middleware and applications more enjoyable, when the
  mundane every-day HTTP work is less in your face.

  Finally certain behaviours such as signed cookie secret management, and upstream
  HTTPS proxy authorization benift greatly from app-level control. Configuring these
  for each end-point would be extremely annoying and error-prone.