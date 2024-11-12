import {type IncomingMessage, type ServerResponse} from 'node:http';
import type httpAssert from 'http-assert';
import type Cookies from 'cookies';
import type {SetOptional} from 'type-fest';
import {type HttpError, type UnknownError} from 'http-errors';
import type {Response} from './response.types.js';
import type {Request} from './request.types.js';
import type Application from './application.js';
import {type COOKIES} from './context.js';

/**
 * The types for the base context object
 */
export interface ContextBase {
  /**
   * Context can be used to store data
   * and pass it between middleware. Context properties
   * can be added globally at anytime using `app.context` or
   * per request within middleware.
   *
   * To add typed properties to Context, declare them in
   * the module of your choosing:
   *
   * ```ts
   * declare module '@kosmic/koa' {
   *   interface Context {
   *     myProperty: string;
   *   }
   * }
   * ```
   */
  [key: string | symbol]: any;
  /**
   * Similar to .throw(), adds assertion.
   *
   *    this.assert(this.user, 401, 'Please login!');
   *
   * See: https://github.com/jshttp/http-assert
   */
  assert: typeof httpAssert;
  /**
   * get and set cookies
   */
  cookies: Cookies | undefined;
  /**
   * util.inspect() implementation, which
   * just returns the JSON output.
   */
  inspect(): any;
  /**
   * Return JSON representation.
   *
   * Here we explicitly invoke .toJSON() on each
   * object, as iteration will otherwise fail due
   * to the getters and cause utilities such as
   * clone() to fail.
   */
  toJSON(): {
    request: any;
    response: any;
    app: any;
    originalUrl: any;
    req: string;
    res: string;
    socket: string;
  };
  /**
   * Throw an error with `status` (default 500) and
   * `msg`. Note that these are user-level
   * errors, and the message may be exposed to the client.
   *
   *    this.throw(403)
   *    this.throw(400, 'name required')
   *    this.throw('something exploded')
   *    this.throw(new Error('invalid'))
   *    this.throw(400, new Error('invalid'))
   *
   * See: https://github.com/jshttp/http-errors
   *
   * Note: `status` should only be passed as the first parameter.
   */
  throw(n: number | UnknownError, ...args: UnknownError[]): never;
  /**
   * Default error handling.
   *
   * Not for public use, avoid using this function
   *
   * @private
   */
  onerror(
    error: SetOptional<HttpError, 'status' | 'statusCode' | 'expose'> | null,
  ): void;
}

/**
 * The context object delgate for the response
 */
export interface ContextResponseDelegation {
  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   *
   * @example
   *
   * ctx.attachment('path/to/logo.png');
   */
  attachment: Response['attachment'];
  /**
   * Perform a [302] redirect to url.
   *
   * The string "back" is special-cased to provide Referrer support, when Referrer is not present alt or "/" is used.
   *
   * @example
   * ```ts
   * ctx.redirect('back');
   * ctx.redirect('back', '/index.html');
   * ctx.redirect('/login');
   * ctx.redirect('http://google.com');
   * ```
   *
   * To alter the default status of 302, simply assign the status before or after this call. To alter the body, assign it after this call:
   *
   * @example
   * ```ts
   * ctx.status = 301;
   * ctx.redirect('/cart');
   * ctx.body = 'Redirecting to shopping cart';
   * ```
   *
   * @param url - the url to redirect to or 'back'
   * @param alt - the url to redirect to if 'back' is used
   */
  redirect: Response['redirect'];
  /**
   * Remove header `field`.
   *
   * @param field - the field name to remove
   */
  remove: Response['remove'];
  /**
   * Vary on `field`.
   *
   * @param field - the field name to vary on
   */
  vary: Response['vary'];
  /**
   * Returns true if the header identified by name is currently set in the outgoing headers.
   * The header name matching is case-insensitive.
   *
   * Examples:
   *
   *     this.has('Content-Type');
   *     // => true
   *
   *     this.get('content-type');
   *     // => true
   *
   * @param field
   */
  has: Response['has'];
  /**
   * Set header `field` to `val` or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    this.set('Foo', ['bar', 'baz']);
   *    this.set('Accept', 'application/json');
   *    this.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * @param {String|Object|Array} field
   * @param {String} val
   */
  set: Response['set'];
  /**
   * Append additional header `field` with value `val`.
   *
   * Examples:
   *
   * ```
   * this.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
   * this.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   * this.append('Warning', '199 Miscellaneous warning');
   * ```
   *
   * @param field
   * @param val
   */
  append: Response['append'];
  /**
   * Flush any set headers and begin the body
   */

  flushHeaders: Response['flushHeaders'];
  /**
   * ctx.status=
   *
   * Get/set response status code.
   */
  status: Response['status'];
  /**
   * ctx.message
   *
   * Get/Set response status message
   */
  message: Response['message'];
  /**
   * ctx.body
   *
   * Get/Set response body.
   *
   * Set response body to one of the following:
   *
   * - `string` written
   * - `Buffer` written
   * - `Stream` piped
   * - `Object || Array` json-stringified
   * - `null || undefined` no content response
   *
   * If response.status has not been set, Koa will automatically set the status to 200 or 204 depending on response.body. Specifically, if response.body has not been set or has been set as null or undefined, Koa will automatically set response.status to 204. If you really want to send no content response with other status, you should override the 204 status as the following way:
   *
   * @exmple
   * ```ts
   * // This must be always set first before status, since null | undefined
   * // body automatically sets the status to 204
   * ctx.body = null;
   *
   * // Now we override the 204 status with the desired one
   * ctx.status = 200;
   * ```
   *
   * Koa doesn't guard against everything that could be put as a response body -- a function doesn't serialise meaningfully, returning a boolean may make sense based on your application, and while an error works, it may not work as intended as some properties of an error are not enumerable. We recommend adding middleware in your app that asserts body types per app. A sample middleware might be:
   *
   * @example
   * ```ts
   * app.use(async (ctx, next) => {
   *   await next()
   *   ctx.assert.equal('object', typeof ctx.body, 500, 'some dev did something wrong')
   * })
   * ```
   */
  body: Response['body'];
  /**
   * ctx.length
   *
   * Get/Set response Content-Length
   *
   * @example
   * ```ts
   * console.log(ctx.length); // 512
   * ctx.length = 1024;
   * ```
   */
  length: Response['length'];
  /**
   * Return the response mime type void of
   * parameters such as "charset".
   */
  type: Response['type'];
  /**
   * Set the Last-Modified date using a string or a Date.
   * Get the Last-Modified date in Date form, if it exists.
   *
   * @exmaple
   * ```ts
   * this.response.lastModified // => Mon, 15 Jun 2020 20:51:45 GMT
   * this.response.lastModified = new Date();
   * this.response.lastModified = '2013-09-13';
   * ```
   */
  lastModified: Response['lastModified'];
  /**
   * Get/Set the ETag of a response.
   * This will normalize the quotes if necessary.
   *
   * @example
   * ```ts
   *     this.response.etag = 'md5hashsum';
   *     this.response.etag = '"md5hashsum"';
   *     this.response.etag = 'W/"123456789"';
   * ```
   */
  etag: Response['etag'];
  // response getter delegation
  /**
   * Check if a header has been written to the socket.
   *
   * @return {Boolean}
   */
  readonly headerSent: Response['headerSent'];
  /**
   * Checks if the request is writable.
   * Tests for the existence of the socket
   * as node sometimes does not set it.
   *
   * @return {Boolean}
   * @private
   */
  readonly writable: Response['writable'];
}

/**
 * The context object delegate for the request
 */
export interface ContextRequestDelegation {
  // request method delegation

  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   *
   * @param {String|Array} lang(s)...
   * @return {Array|String}
   * @api public
   */
  acceptsLanguages: Request['acceptsLanguages'];
  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   *
   * @param {String|Array} encoding(s)...
   * @return {String|Array}
   * @api public
   */
  acceptsEncodings: Request['acceptsEncodings'];
  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   *
   * @param {String|Array} charset(s)...
   * @return {String|Array}
   * @api public
   */
  acceptsCharsets: Request['acceptsCharsets'];
  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `false`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json" or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * @example
   * ```ts
   *     // Accept: text/html
   *     this.accepts('html');
   *     // => "html"
   *
   *     // Accept: text/*, application/json
   *     this.accepts('html');
   *     // => "html"
   *     this.accepts('text/html');
   *     // => "text/html"
   *     this.accepts('json', 'text');
   *     // => "json"
   *     this.accepts('application/json');
   *     // => "application/json"
   *
   *     // Accept: text/*, application/json
   *     this.accepts('image/png');
   *     this.accepts('png');
   *     // => false
   *
   *     // Accept: text/*;q=.5, application/json
   *     this.accepts(['html', 'json']);
   *     this.accepts('html', 'json');
   *     // => "json"
   * ```
   *
   * @param {String|Array} type(s)...
   * @return {String|Array|false}
   * @api public
   */
  accepts: Request['accepts'];
  /**
   * Return request header.
   *
   * The `Referrer` header field is special-cased,
   * both `Referrer` and `Referer` are interchangeable.
   *
   * Examples:
   *
   *     this.get('Content-Type');
   *     // => "text/plain"
   *
   *     this.get('content-type');
   *     // => "text/plain"
   *
   *     this.get('Something');
   *     // => ''
   *
   * @param {String} field
   * @return {String}
   * @api public
   */
  get: Request['get'];
  /**
   * Check if the incoming request contains the "Content-Type"
   * header field and if it contains any of the given mime `type`s.
   * If there is no request body, `null` is returned.
   * If there is no content type, `false` is returned.
   * Otherwise, it returns the first `type` that matches.
   *
   * @example
   * ```ts
   *     // With Content-Type: text/html; charset=utf-8
   *     this.is('html'); // => 'html'
   *     this.is('text/html'); // => 'text/html'
   *     this.is('text/*', 'application/json'); // => 'text/html'
   *
   *     // When Content-Type is application/json
   *     this.is('json', 'urlencoded'); // => 'json'
   *     this.is('application/json'); // => 'application/json'
   *     this.is('html', 'application/*'); // => 'application/json'
   *
   *     this.is('html'); // => false
   * ```
   * @param {String|String[]} [type]
   * @param {String[]} [types]
   * @return {String|false|null}
   * @api public
   */
  is: Request['is'];
  /**
   * Get/set query string.
   */
  querystring: Request['querystring'];
  /**
   * check if the request is idempotent
   */
  readonly idempotent: Request['idempotent'];
  /**
   * Return the request socket.
   */
  readonly socket: Request['socket'];
  /**
   * Get/set the search string. Same as
   * request.querystring= but included for ubiquity.
   */
  search: Request['search'];
  /**
   * Get/set the reqest method
   */
  method: Request['method'];
  /**
   * Get/set the parsed query-string
   */
  query: Request['query'];
  /**
   * Get/set the pathname, retaining the querystring when present
   */
  path: Request['path'];
  /**
   * Get/set the request URL.
   */
  url: Request['url'];
  /**
   * Get/set accept object.
   * Lazily memoized.
   */
  accept: Request['accept'];
  // request getter delegation
  /**
   * Get origin of URL.
   */
  readonly origin: Request['origin'];
  /**
   * Get full request URL.
   */
  readonly href: Request['href'];
  /**
   * Return subdomains as an array.
   *
   * Subdomains are the dot-separated parts of the host before the main domain
   * of the app. By default, the domain of the app is assumed to be the last two
   * parts of the host. This can be changed by setting `app.subdomainOffset`.
   *
   * For example, if the domain is "tobi.ferrets.example.com":
   * If `app.subdomainOffset` is not set, this.subdomains is
   * `["ferrets", "tobi"]`.
   * If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.
   */
  readonly subdomains: Request['subdomains'];
  /**
   * Return the protocol string "http" or "https"
   * when requested with TLS. When the proxy setting
   * is enabled the "X-Forwarded-Proto" header
   * field will be trusted. If you're running behind
   * a reverse proxy that supplies https for you this
   * may be enabled.
   */
  readonly protocol: Request['protocol'];
  /**
   * Parse the "Host" header field host
   * and support X-Forwarded-Host when a
   * proxy is enabled.
   */
  readonly host: Request['host'];
  /**
   * Parse the "Host" header field hostname
   * and support X-Forwarded-Host when a
   * proxy is enabled.
   */

  readonly hostname: Request['hostname'];
  /**
   * Get WHATWG parsed URL.
   * Lazily memoized.
   */
  readonly URL: Request['URL'];
  /**
   * Return request header.
   */
  readonly header: Request['header'];
  /**
   * Return request headers, same as request.header
   */
  readonly headers: Request['headers'];
  /**
   * Shorthand for:
   *
   *    this.protocol == 'https'
   */
  readonly secure: Request['secure'];
  /**
   * Check if the request is stale, aka
   * "Last-Modified" and / or the "ETag" for the
   * resource has changed.
   */
  readonly stale: Request['stale'];
  /**
   * Check if the request is fresh, aka
   * Last-Modified and/or the ETag
   * still match.
   */
  readonly fresh: Request['fresh'];
  /**
   * When `app.proxy` is `true`, parse
   * the "X-Forwarded-For" ip address list.
   *
   * For example if the value was "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream.
   */
  readonly ips: Request['ips'];
  /**
   * Return request's remote address
   * When `app.proxy` is `true`, parse
   * the "X-Forwarded-For" ip address list and return the first one
   */
  readonly ip: Request['ip'];
}

export interface ContextExtras<UserState = State> {
  /**
   * A Koa Response object
   */
  response: Response;
  /**
   * A Koa Request object
   */
  request: Request;
  /**
   * The node js request object
   *
   * Avoid changing this object and prefer using the ctx.request object instead.
   */
  req: IncomingMessage;
  /**
   * The node js response object
   *
   * Bypassing Koa's response handling is not supported. Avoid using the following node properties:
   *  - res.statusCode
   *  - res.writeHead()
   *  - res.write()
   *  - res.end()
   */
  res: ServerResponse;
  /**
   * A reference to the current application instance
   */
  app: Application;
  /**
   * Allow bypassing the Koa response handling when setting this property to true.
   *
   * You must end the response manually when using this option.
   */
  respond: boolean;
  /**
   * The original request URL
   */
  originalUrl?: string;
  /**
   * @private
   */
  [COOKIES]?: Cookies;
  /**
   * State is the recommended namespace for passing information
   * through middleware and to your frontend views.
   *
   * State can be used to store data
   * and pass it between middleware. State properties
   * can be added globally at anytime using `app.context` or
   * per request within middleware.
   *
   * To add typed properties to State, declare them in
   * the module of your choosing:
   *
   * @example
   * ```ts
   * declare module '@kosmic/koa' {
   *   interface State {
   *     myProperty: string;
   *   }
   * }
   * ```
   */
  state: UserState;
}

/**
 * extendable ctx.state interface
 */
export interface State {}

/**
 * The extendable context object
 */
export interface Context<CtxState extends State = State>
  extends ContextBase,
    ContextExtras<CtxState>,
    ContextResponseDelegation,
    ContextRequestDelegation {}
