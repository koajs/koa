/**
 * Module dependencies.
 */

var debug = require('debug')('koa:context');
var Negotiator = require('negotiator');
var statuses = require('./status');
var Cookies = require('cookies');
var qs = require('querystring');
var Stream = require('stream');
var fresh = require('fresh');
var http = require('http');
var path = require('path');
var mime = require('mime');
var basename = path.basename;
var extname = path.extname;
var url = require('url');
var parse = url.parse;
var stringify = url.format;

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
 */

Context.prototype = {

  /**
   * Return request header.
   *
   * @return {Object}
   * @api public
   */

  get header() {
    return this.req.headers;
  },

  /**
   * Return response header.
   *
   * @return {Object}
   * @api public
   */

  get responseHeader() {
    // TODO: wtf
    return this.res._headers || {};
  },

  /**
   * Return response status string.
   *
   * @return {String}
   * @api public
   */

  get statusString() {
    return http.STATUS_CODES[this.status];
  },

  /**
   * Get request URL.
   *
   * @return {String}
   * @api public
   */

  get url() {
    return this.req.url;
  },

  /**
   * Set request URL.
   *
   * @api public
   */

  set url(val) {
    this.req.url = val;
  },

  /**
   * Get request method.
   *
   * @return {String}
   * @api public
   */

  get method() {
    return this.req.method;
  },

  /**
   * Set request method.
   *
   * @param {String} val
   * @api public
   */

  set method(val) {
    this.req.method = val;
  },

  /**
   * Get response status code.
   *
   * @return {Number}
   * @api public
   */

  get status() {
    return this.res.statusCode;
  },

  get statusCode() {
    return this.res.statusCode;
  },

  /**
   * Set response status code.
   *
   * @param {Number|String} val
   * @api public
   */

  set status(val) {
    if ('string' == typeof val) {
      var n = statuses[val.toLowerCase()];
      if (!n) throw new Error(statusError(val));
      val = n;
    }

    this.res.statusCode = val;

    var noContent = 304 == this.status || 204 == this.status;
    if (noContent && this.body) this.body = null;
  },

  set statusCode(val) {
    this.status = val;
  },

  /**
   * Get response body.
   *
   * @return {Mixed}
   * @api public
   */

  get body() {
    return this._body;
  },

  /**
   * Set response body.
   *
   * @param {String|Buffer|Object|Stream} val
   * @api public
   */

  set body(val) {
    this._body = val;

    // no content
    if (null == val) {
      var s = this.status;
      this.status = 304 == s ? 304 : 204;
      this.res.removeHeader('Content-Type');
      this.res.removeHeader('Content-Length');
      this.res.removeHeader('Transfer-Encoding');
      return;
    }

    // set the content-type only if not yet set
    var setType = !this.responseHeader['content-type'];

    // string
    if ('string' == typeof val) {
      if (setType) this.type = ~val.indexOf('<') ? 'html' : 'text';
      this.length = Buffer.byteLength(val);
      return;
    }

    // buffer
    if (Buffer.isBuffer(val)) {
      if (setType) this.type = 'bin';
      this.length = val.length;
      return;
    }

    // stream
    if (val instanceof Stream) {
      if (setType) this.type = 'bin';
      return;
    }

    // json
    this.type = 'json';
  },

  /**
   * Get request pathname.
   *
   * @return {String}
   * @api public
   */

  get path() {
    var c = this._pathcache = this._pathcache || {};
    return c[this.url] || (c[this.url] = parse(this.url).pathname);
  },

  /**
   * Set pathname, retaining the query-string when present.
   *
   * @param {String} path
   * @api public
   */

  set path(path) {
    var url = parse(this.url);
    url.pathname = path;
    this.url = stringify(url);
  },

  /**
   * Get parsed query-string.
   *
   * @return {Object}
   * @api public
   */

  get query() {
    var str = this.querystring;
    if (!str) return {};

    var c = this._querycache = this._querycache || {};
    return c[str] || (c[str] = qs.parse(str));
  },

  /**
   * Set query-string as an object.
   *
   * @param {Object} obj
   * @api public
   */

  set query(obj) {
    this.querystring = qs.stringify(obj);
  },

  /**
   * Get query string.
   *
   * @return {String}
   * @api public
   */

  get querystring() {
    var c = this._qscache = this._qscache || {};
    return c[this.url] || (c[this.url] = parse(this.url).query || '');
  },

  /**
   * Set querystring.
   *
   * @param {String} str
   * @api public
   */

  set querystring(str) {
    var url = parse(this.url);
    url.search = str;
    this.url = stringify(url);
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
    var proxy = this.app.proxy;
    var host = proxy && this.get('X-Forwarded-Host');
    host = host || this.get('Host');
    if (!host) return;
    return host.split(/\s*,\s*/)[0].split(':')[0];
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
    var method = this.method;
    var s = this.status;

    // GET or HEAD for weak freshness validation only
    if ('GET' != method && 'HEAD' != method) return false;

    // 2xx or 304 as per rfc2616 14.26
    if ((s >= 200 && s < 300) || 304 == s) {
      return fresh(this.header, this.responseHeader);
    }

    return false;
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
    return !this.fresh;
  },

  /**
   * Check if the request is idempotent.
   *
   * @return {Boolean}
   * @api public
   */

  get idempotent() {
    return 'GET' == this.method
      || 'HEAD' == this.method;
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
    var len = this.get('Content-Length');
    if (null == len) return;
    return ~~len;
  },

  /**
   * Set Content-Length field to `n`.
   *
   * @param {Number} n
   * @api public
   */

  set length(n) {
    this.set('Content-Length', n);
  },

  /**
   * Return parsed response Content-Length when present.
   *
   * @return {Number}
   * @api public
   */

  get responseLength() {
    var len = this.responseHeader['content-length'];
    var body = this.body;

    if (null == len) {
      if (!body) return;
      if ('string' == typeof body) return Buffer.byteLength(body);
      return body.length;
    }

    return ~~len;
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
    var proxy = this.app.proxy;
    if (this.socket.encrypted) return 'https';
    if (!proxy) return 'http';
    var proto = this.get('X-Forwarded-Proto') || 'http';
    return proto.split(/\s*,\s*/)[0];
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
    return 'https' == this.protocol;
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
    return this.ips[0] || this.connection.remoteAddress;
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
    var proxy = this.app.proxy;
    var val = this.get('X-Forwarded-For');
    return proxy && val
      ? val.split(/ *, */)
      : [];
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
    var offset = this.app.subdomainOffset;
    return (this.host || '')
      .split('.')
      .reverse()
      .slice(offset);
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
   * @return {String|Array|Boolean}
   * @api public
   */

  accepts: function(types){
    if (!Array.isArray(types)) types = [].slice.call(arguments);
    var n = new Negotiator(this.req);
    if (!types.length) return n.preferredMediaTypes();
    var mimes = types.map(extToMime);
    var accepts = n.preferredMediaTypes(mimes);
    var first = accepts[0];
    if (!first) return false;
    return types[mimes.indexOf(first)];
  },

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

  acceptsEncodings: function(encodings) {
    if (!Array.isArray(encodings)) encodings = [].slice.call(arguments);
    var n = new Negotiator(this.req);
    if (!encodings.length) return n.preferredEncodings();
    return n.preferredEncodings(encodings)[0];
  },

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

  acceptsCharsets: function(charsets) {
    if (!Array.isArray(charsets)) charsets = [].slice.call(arguments);
    var n = new Negotiator(this.req);
    if (!charsets.length) return n.preferredCharsets();
    return n.preferredCharsets(charsets)[0];
  },

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

  acceptsLanguages: function(langs) {
    if (!Array.isArray(langs)) langs = [].slice.call(arguments);
    var n = new Negotiator(this.req);
    if (!langs.length) return n.preferredLanguages();
    return n.preferredLanguages(langs)[0];
  },

  /**
   * Check if a header has been written to the socket.
   *
   * @return {Boolean}
   * @api public
   */

  get headerSent() {
    return this.res.headersSent;
  },

  /**
   * Alias of `.headerSent`
   *
   * @return {Boolean}
   * @api public
   */

  get headersSent() {
    return this.res.headersSent;
  },

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
   * Vary on `field`.
   *
   * @param {String} field
   * @api public
   */

  vary: function(field){
    this.append('Vary', field);
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
    var ct = this.type;
    if (!ct) return false;
    ct = ct.split(';')[0];

    // extension given
    if (!~type.indexOf('/')) type = mime.lookup(type);

    // type or subtype match
    if (~type.indexOf('*')) {
      type = type.split('/');
      ct = ct.split('/');
      if ('*' == type[0] && type[1] == ct[1]) return true;
      if ('*' == type[1] && type[0] == ct[0]) return true;
      return false;
    }

    // exact match
    return type == ct;
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
    if ('back' == url) url = this.get('Referrer') || alt || '/';
    this.set('Location', url);
    if (!~[300, 301, 302, 303, 305, 307].indexOf(this.status)) this.status = 302;

    // html
    if (this.accepts('html')) {
      url = escape(url);
      this.type = 'text/html; charset=utf-8';
      this.body = 'Redirecting to <a href="' + url + '">' + url + '</a>.';
      return;
    }

    // text
    this.body = 'Redirecting to ' + url + '.';
  },

  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   *
   * @param {String} filename
   * @api public
   */

  attachment: function(filename){
    if (filename) this.type = extname(filename);
    this.set('Content-Disposition', filename
      ? 'attachment; filename="' + basename(filename) + '"'
      : 'attachment');
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
    if (!~type.indexOf('/')) {
      type = mime.lookup(type);
      var cs = mime.charsets.lookup(type);
      if (cs) type += '; charset=' + cs.toLowerCase();
    }

    this.set('Content-Type', type);
  },

  /**
   * Return the request mime type void of
   * parameters such as "charset".
   *
   * @return {String}
   * @api public
   */

  get type() {
    var type = this.get('Content-Type');
    if (!type) return;
    return type.split(';')[0];
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
    var req = this.req;
    switch (name = name.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return req.headers.referrer || req.headers.referer;
      default:
        return req.headers[name];
    }
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
    if (2 == arguments.length) {
      if (Array.isArray(val)) val = val.map(String);
      else val = String(val);
      this.res.setHeader(field, val);
    } else {
      for (var key in field) {
        this.set(key, field[key]);
      }
    }
  },

  /**
   * Append `val` to header `field`.
   *
   * @param {String} field
   * @param {String} val
   * @api public
   */

  append: function(field, val){
    field = field.toLowerCase();
    var header = this.responseHeader;
    var list = header[field];

    // not set
    if (!list) return this.set(field, val);

    // append
    list = list.split(/ *, */);
    if (!~list.indexOf(val)) list.push(val);
    this.set(field, list.join(', '));
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
  }
};

/**
 * Convert extnames to mime.
 *
 * @param {String} type
 * @return {String}
 * @api private
 */

function extToMime(type) {
  if (~type.indexOf('/')) return type;
  return mime.lookup(type);
}

/**
 * Return status error message.
 *
 * @param {String} val
 * @return {String}
 * @api private
 */

function statusError(val) {
  var s = 'invalid status string "' + val + '", try:\n\n';

  Object.keys(statuses).forEach(function(name){
    var n = statuses[name];
    s += '  - ' + n + ' "' + name + '"\n';
  });

  return s;
}

/**
 * Escape special characters in the given string of html.
 *
 * @param  {String} html
 * @return {String}
 * @api private
 */

function escape(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
