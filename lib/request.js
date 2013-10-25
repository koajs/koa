/**
 * Module dependencies.
 */

var debug = require('debug')('koa:request');
var Negotiator = require('negotiator');
var qs = require('querystring');
var fresh = require('fresh');
var mime = require('mime');
var url = require('url');
var parse = url.parse;
var stringify = url.format;

/**
 * Prototype.
 *
 * Properties are defined in the following order:
 *
 *   - URL properties
 *   - Method properties
 *   - General header properties
 *   - Specific header properties
 */

module.exports = {

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
   * Return request header.
   *
   * @return {Object}
   * @api public
   */

  get header() {
    return this.req.headers;
  },

  get headers() {
    return this.req.headers;
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
   * Get the trailing headers to a request.
   *
   * @param {Object}
   * @api public
   */

  get trailers() {
    return this.req.trailers;
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
    // TODO: memoize
    if (!Array.isArray(types)) types = [].slice.call(arguments);
    var normalized = types.map(extToMime);
    var n = new Negotiator(this.req);
    var accepts = n.preferredMediaTypes(normalized);
    var first = accepts[0];
    if (!first) return false;
    return types[normalized.indexOf(first)];
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
    var n = new Negotiator(this.req);
    return n.preferredEncodings();
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
    var n = new Negotiator(this.req);
    return n.preferredCharsets();
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
    var n = new Negotiator(this.req);
    return n.preferredLanguages();
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
    var n = new Negotiator(this.req);
    return n.preferredMediaTypes();
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
}

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