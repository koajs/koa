# Error Handling

## Try-Catch

  Using generators means that you can try-catch `next`. For example,
  this example prepends all error messages with "Error: "

  ```js
  app.use(function*(next){
    try {
      yield next;
    } catch (error) {
      error.message = 'Error: ' + error.message;
      throw error;
    }
  });
  ```

### Default Error Handler

  The default error handler is essentially a try-catch at
  the very beginning of the middleware chain. To use a
  different error handler, simply put another try-catch at
  the beginning of the middleware chain, and handle the error
  there. However, the default error handler is good enough for
  most use cases. It will use a status code of `err.status`,
  or by default 500. If `err.expose` is true, then `err.message`
  will be the reply. Otherwise, a message generated from the
  error code will be used (e.g. for the code 500 the message
  "Internal Server Error" will be used). All headers will be
  cleared from the request, but any headers in `err.headers`
  will then be set. You can use a try-catch, as specified
  above, to add a header to this list.

## The Error Event

  Error handlers can be specified with `app.on('error')`.
  If no error handler is specified, a default error handler
  is used. Error handlers recieve all errors that make their
  way back through the middleware chain, if an error is caught
  and not thrown again, it will not be handled by the error
  handler. If not error event handler is specified, then
  `app.onerror` will be used, which simply log the error if
  `error.expose` is true and `app.silent` is false.
