
/**
 * Module dependencies.
 */

var debug = require('debug')('koa:context');
var Negotiator = require('negotiator');
var qs = require('querystring');
var fresh = require('fresh');
var mime = require('mime');
var url = require('url');
var parse = url.parse;
var stringify = url.format;

/**
 * Prototype.
 */

module.exports = {

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
   * Get the search string. Same as the querystring
   * except it includes the leading ?.
   *
   * @return {String}
   * @api public
   */

  get search() {
    if (!this.querystring) return '';
    return '?' + this.querystring;
  },

  /**
   * Set the search string. Same as
   * response.querystring= but included for ubiquity.
   *
   * @param {String} str
   * @api public
   */

  set search(str) {
    this.querystring = str;
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
    var s = this.ctx.status;

    // GET or HEAD for weak freshness validation only
    if ('GET' != method && 'HEAD' != method) return false;

    // 2xx or 304 as per rfc2616 14.26
    if ((s >= 200 && s < 300) || 304 == s) {
      return fresh(this.header, this.ctx.response.header);
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
    return this.ips[0] || this.socket.remoteAddress;
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
    if (!this.header.accept) return types[0];
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
    return n.preferredEncodings(encodings)[0] || 'identity';
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
    if (!this.header['accept-charset']) return charsets[0];
    return n.preferredCharsets(charsets)[0] || false;
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
    if (!this.header['accept-language']) return langs[0];
    return n.preferredLanguages(langs)[0] || false;
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
   * header field, and it contains any of the give mime `type`s.
   * If there is no request body, `null` is returned.
   * If there is no content type, `false` is returned.
   * Otherwise, it returns the first `type` that matches.
   *
   * Examples:
   *
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
   *
   * @param {String|Array} types...
   * @return {String|false|null}
   * @api public
   */

  is: function(types){
    // no request body
    if (!(this.length || 'transfer-encoding' in this.header)) return;

    var ct = this.type;
    // no content-type
    if (!ct) return false;

    // paramless
    ct = ct.split(';')[0];

    if (!types) return ct;

    // ensure array
    if (!Array.isArray(types)) types = [].slice.call(arguments);

    var mt;
    for (var i = 0; i < types.length; i++) {
      var type = types[i];

      switch (type) {
        case 'urlencoded':
          mt = 'application/x-www-form-urlencoded';
          break;
        default:
          mt = ~type.indexOf('/') ? type : mime.lookup(type);
      }

      if (mimeMatch(mt, ct)) return ct;
    }

    // no matches
    return false;
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
   * @param {String} field
   * @return {String}
   * @api public
   */

  get: function(field){
    var req = this.req;
    switch (field = field.toLowerCase()) {
      case 'referer':
      case 'referrer':
        return req.headers.referrer || req.headers.referer;
      default:
        return req.headers[field];
    }
  },

  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */

  inspect: function(){
    return this.toJSON();
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
      url: this.url,
      header: this.header
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
 * Check if `exected` mime type
 * matches `actual` mime type with
 * wildcard support.
 *
 * @param {String} expected
 * @param {String} actual
 * @return {Boolean}
 * @api private
 */

function mimeMatch(expected, actual) {
  if (expected == actual) return true;

  if (!~expected.indexOf('*')) return false;

  actual = actual.split('/');
  expected = expected.split('/');

  if ('*' == expected[0] && expected[1] == actual[1]) return true;
  if ('*' == expected[1] && expected[0] == actual[0]) return true;
}
