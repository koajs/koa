/**
 * Module dependencies.
 */

var debug = require('debug')('koa:context');
var http = require('http');

/**
 * Expose `Context`.
 */

module.exports = Context;

/**
 * Initialie a new Context.
 *
 * @api private
 */

function Context(app, req, res){
  this.cookies = new Cookies(req, res);
  this.onerror = this.onerror.bind(this);
  this.app = app;
  this.req = req;
  this.res = res;
}

/**
 * Prototype.
 *
 * Properties are defined in the following order:
 *
 *   - Context-specific properties
 *   - Request-delegated properties (in request.js's order)
 *   - Response-delegated properties (in response.js's order)
 */

Context.prototype = {

/**
   * Throw an error with `msg` and optional `status`
   * defaulting to 500. Note that these are user-level
   * errors, and the message may be exposed to the client.
   *
   *    this.error(403)
   *    this.error('name required', 400)
   *    this.error('something exploded')
   *
   * @param {String|Number} msg
   * @param {Number} status
   * @api public
   */

  error: function(msg, status){
    // TODO: switch order... feels weird now that im used to express
    if ('number' == typeof msg) {
      var tmp = msg;
      msg = http.STATUS_CODES[tmp];
      status = tmp;
    }

    var err = new Error(msg);
    err.status = status || 500;
    err.expose = true;
    throw err;
  },

  /**
   * Default error handling.
   *
   * @param {Error} err
   * @api private
   */

  onerror: function(err){
    // don't do anything if there is no error.
    // this allows you to pass `this.onerror`
    // to node-style callbacks.
    if (!err) return;

    // nothing we can do here other
    // than delegate to the app-level
    // handler and log.
    if (this.headerSent) {
      err.headerSent = true;
      this.app.emit('error', err, this);
      return;
    }

    // delegate
    this.app.emit('error', err, this);

    // force text/plain
    this.type = 'text';

    // ENOENT support
    if ('ENOENT' == err.code) err.status = 404;

    // default to 500
    err.status = err.status || 500;

    // respond
    var code = http.STATUS_CODES[err.status];
    var msg = err.expose ? err.message : code;
    this.status = err.status;
    this.res.end(msg);
  },

  /**
   * Inspect implementation.
   *
   * TODO: add tests
   *
   * @return {Object}
   * @api public
   */

  inspect: function(){
    var o = this.toJSON();
    o.body = this.body;
    o.statusString = this.statusString;
    return o;
  },

  /**
   * Return JSON representation.
   *
   * @return {Object}
   * @api public
   */

  toJSON: function(){
    return {
      method: this.method,
      status: this.status,
      header: this.header,
      responseHeader: this.responseHeader
    }
  },

  /**
   * Return request header.
   *
   * @return {Object}
   * @api public
   */

  get header() {
    return this.request.headers;
  },

  get headers() {
    return this.request.headers;
  },

  /**
   * Return response header.
   *
   * @return {Object}
   * @api public
   */

  get responseHeader() {
    return this.response.headers;
  },

  get responseHeaders() {
    return this.response.headers;
  },

  /**
   * Return response status string.
   *
   * @return {String}
   * @api public
   */

  get statusString() {
    return this.response.statusString;
  },

  /**
   * Get request URL.
   *
   * @return {String}
   * @api public
   */

  get url() {
    return this.request.url;
  },

  /**
   * Set request URL.
   *
   * @api public
   */

  set url(val) {
    this.request.url = val;
  },

  /**
   * Get request method.
   *
   * @return {String}
   * @api public
   */

  get method() {
    return this.request.method;
  },

  /**
   * Set request method.
   *
   * @param {String} val
   * @api public
   */

  set method(val) {
    this.request.method = val;
  },

  /**
   * Get response status code.
   *
   * @return {Number}
   * @api public
   */

  get status() {
    return this.request.statusCode;
  },

  /**
   * Set response status code.
   *
   * @param {Number|String} val
   * @api public
   */

  set status(val) {
    this.response.status = val;
  },

  /**
   * Get response body.
   *
   * @return {Mixed}
   * @api public
   */

  get body() {
    return this.response.body;
  },

  /**
   * Set response body.
   *
   * @param {String|Buffer|Object|Stream} val
   * @api public
   */

  set body(val) {
    this.response.body = val;
  },

  /**
   * Get request pathname.
   *
   * @return {String}
   * @api public
   */

  get path() {
    return this.request.path;
  },

  /**
   * Set pathname, retaining the query-string when present.
   *
   * @param {String} path
   * @api public
   */

  set path(path) {
    this.request.path = path;
  },

  /**
   * Get parsed query-string.
   *
   * @return {Object}
   * @api public
   */

  get query() {
    return this.request.query;
  },

  /**
   * Set query-string as an object.
   *
   * @param {Object} obj
   * @api public
   */

  set query(obj) {
    this.request.query = obj;
  },

  /**
   * Get query string.
   *
   * @return {String}
   * @api public
   */

  get querystring() {
    return this.request.querystring;
  },

  /**
   * Set querystring.
   *
   * @param {String} str
   * @api public
   */

  set querystring(str) {
    this.request.querystring = str;
  },

  /**
   * Parse the "Host" header field hostname
   * and support X-Forwarded-Host when a
   * proxy is enabled.
   *
   * @return {String}
   * @api public
   */

  get host() {
    return this.request.host;
  },

  /**
   * Check if the request is fresh, aka
   * Last-Modified and/or the ETag
   * still match.
   *
   * @return {Boolean}
   * @api public
   */

  get fresh() {
    return this.request.fresh;
  },

  /**
   * Check if the request is stale, aka
   * "Last-Modified" and / or the "ETag" for the
   * resource has changed.
   *
   * @return {Boolean}
   * @api public
   */

  get stale() {
    return this.request.stale;
  },

  /**
   * Check if the request is idempotent.
   *
   * @return {Boolean}
   * @api public
   */

  get idempotent() {
    return this.request.idempotent;
  },

  /**
   * Return the request socket.
   *
   * @return {Connection}
   * @api public
   */

  get socket() {
    // TODO: TLS
    return this.req.socket;
  },

  /**
   * Return parsed Content-Length when present.
   *
   * @return {Number}
   * @api public
   */

  get length() {
    return this.request.length;
  },

  /**
   * Set Content-Length field to `n`.
   *
   * @param {Number} n
   * @api public
   */

  set length(n) {
    this.response.length = n;
  },

  /**
   * Return parsed response Content-Length when present.
   *
   * @return {Number}
   * @api public
   */

  get responseLength() {
    return this.response.length;
  },

  /**
   * Return the protocol string "http" or "https"
   * when requested with TLS. When the proxy setting
   * is enabled the "X-Forwarded-Proto" header
   * field will be trusted. If you're running behind
   * a reverse proxy that supplies https for you this
   * may be enabled.
   *
   * @return {String}
   * @api public
   */

  get protocol() {
    return this.request.protocol;
  },

  /**
   * Short-hand for:
   *
   *    this.protocol == 'https'
   *
   * @return {Boolean}
   * @api public
   */

  get secure() {
    return this.request.secure;
  },

  /**
   * Return the remote address, or when
   * `app.proxy` is `true` return
   * the upstream addr.
   *
   * @return {String}
   * @api public
   */

  get ip() {
    return this.request.ip;
  },

  /**
   * When `app.proxy` is `true`, parse
   * the "X-Forwarded-For" ip address list.
   *
   * For example if the value were "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream.
   *
   * @return {Array}
   * @api public
   */

  get ips() {
    return this.request.ips;
  },

  /**
   * Return subdomains as an array.
   *
   * Subdomains are the dot-separated parts of the host before the main domain of
   * the app. By default, the domain of the app is assumed to be the last two
   * parts of the host. This can be changed by setting `app.subdomainOffset`.
   *
   * For example, if the domain is "tobi.ferrets.example.com":
   * If `app.subdomainOffset` is not set, this.subdomains is `["ferrets", "tobi"]`.
   * If `app.subdomainOffset` is 3, this.subdomains is `["tobi"]`.
   *
   * @return {Array}
   * @api public
   */

  get subdomains() {
    return this.request.subdomains;
  },

  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `undefined`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json" or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * Examples:
   *
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
   *     // => undefined
   *
   *     // Accept: text/*;q=.5, application/json
   *     this.accepts(['html', 'json']);
   *     this.accepts('html', 'json');
   *     // => "json"
   *
   * @param {String|Array} type(s)...
   * @return {String}
   * @api public
   */

  accepts: function(types){
    return this.request.accepts(types);
  },

  /**
   * Return accepted encodings.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   *
   * @return {Array}
   * @api public
   */

  get acceptedEncodings() {
    return this.request.acceptedEncodings;
  },

  /**
   * Return accepted charsets.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   *
   * @return {Array}
   * @api public
   */

  get acceptedCharsets() {
    return this.request.acceptedCharsets;
  },

  /**
   * Return accepted languages.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   *
   * @return {Array}
   * @api public
   */

  get acceptedLanguages() {
    return this.request.acceptedLanguages;
  },

  /**
   * Return accepted media types.
   *
   * Given `Accept: application/*;q=0.2, image/jpeg;q=0.8, text/html`
   * an array sorted by quality is returned:
   *
   *     ['text/html', 'image/jpeg', 'application/*']
   *
   * @return {Array}
   * @api public
   */

  get accepted() {
    return this.request.accepted;
  },

  /**
   * Check if a header has been written to the socket.
   *
   * @return {Boolean}
   * @api public
   */

  get headerSent() {
    return this.response.headersSent;
  },

  get headersSent() {
    return this.response.headersSent;
  },

  /**
   * Vary on `field`.
   *
   * @param {String} field
   * @api public
   */

  vary: function(field){
    this.response.vary(field);
    return this;
  },

  /**
   * Check if the incoming request contains the "Content-Type"
   * header field, and it contains the give mime `type`.
   *
   * Examples:
   *
   *     // With Content-Type: text/html; charset=utf-8
   *     this.is('html');
   *     this.is('text/html');
   *     this.is('text/*');
   *     // => true
   *
   *     // When Content-Type is application/json
   *     this.is('json');
   *     this.is('application/json');
   *     this.is('application/*');
   *     // => true
   *
   *     this.is('html');
   *     // => false
   *
   * @param {String} type
   * @return {Boolean}
   * @api public
   */

  is: function(type){
    return this.request.is(type);
  },

  /**
   * Perform a 302 redirect to `url`.
   *
   * The string "back" is special-cased
   * to provide Referrer support, when Referrer
   * is not present `alt` or "/" is used.
   *
   * Examples:
   *
   *    this.redirect('back');
   *    this.redirect('back', '/index.html');
   *    this.redirect('/login');
   *    this.redirect('http://google.com');
   *
   * @param {String} url
   * @param {String} alt
   * @api public
   */

  redirect: function(url, alt){
    this.response.redirect(url, alt);
    return this;
  },

  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   *
   * @param {String} filename
   * @api public
   */

  attachment: function(filename){
    this.response.attachment(filename);
    return this;
  },

  /**
   * Set Content-Type response header with `type` through `mime.lookup()`
   * when it does not contain "/", or set the Content-Type to `type` otherwise.
   *
   * Examples:
   *
   *     this.type = '.html';
   *     this.type = 'html';
   *     this.type = 'json';
   *     this.type = 'application/json';
   *     this.type = 'png';
   *
   * @param {String} type
   * @api public
   */

  set type(type){
    this.response.type = type;
  },

  /**
   * Return the request mime type void of
   * parameters such as "charset".
   *
   * @return {String}
   * @api public
   */

  get type() {
    return this.request.type;
  },

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
   *     // => undefined
   *
   * @param {String} name
   * @return {String}
   * @api public
   */

  get: function(name){
    return this.request.get(name);
  },

  /**
   * Set header `field` to `val`, or pass
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
   * @api public
   */

  set: function(field, val){
    this.response.set(field, val);
    return this;
  },

  setHeader: function(field, val){
    this.response.set(field, val);
    return this;
  },

  /**
   * Get the current response header `name`.
   *
   * @param {String} name
   * @api public
   */

  getHeader: function(name){
    this.response.get(name);
    return this;
  },

  /**
   * Remove the current response header `name`.
   *
   * @param {String} name
   * @api public
   */

  removeHeader: function(name){
    this.response.remove(name);
    return this;
  },

  /**
   * Get the trailing headers to a request.
   *
   * @param {Object}
   * @api public
   */

  get trailers() {
    return this.request.trailers;
  },

  /**
   * Add trailing headers to the response.
   *
   * Maybe:
   *   - throw if not chunked encoding
   *
   * @param {object} headers
   * @api public
   */

  addTrailers: function(headers){
    this.response.addTrailers(headers);
    return this;
  },

  /**
   * Append `val` to header `field`.
   *
   * @param {String} field
   * @param {String} val
   * @api public
   */

  append: function(field, val){
    this.response.append(field, val);
  },
};