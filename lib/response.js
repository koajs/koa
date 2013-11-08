/**
 * Module dependencies.
 */

var debug = require('debug')('koa:response');
var statuses = require('./status');
var Stream = require('stream');
var http = require('http');
var mime = require('mime');
var path = require('path');
var basename = path.basename;
var extname = path.extname;
/**
 * Prototype.
 *
 * Properties are defined in the following order:
 *
 *   - Status
 *   - General header properties
 *   - Specific header properties
 *   - Body
 *   - Responses
 */

module.exports = {

  /**
   * Get response status code.
   *
   * @return {Number}
   * @api public
   */

  get status() {
    return this.res.statusCode;
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

  /**
   * Return response header.
   *
   * @return {Object}
   * @api public
   */

  get header() {
    // TODO: wtf
    return this.res._headers || {};
  },

  get headers() {
    return this.res._headers || {};
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

  get headersSent() {
    return this.res.headersSent;
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
   * Get the current response header `name`.
   *
   * @param {String} name
   * @api public
   */

  get: function(name){
    return this.res.getHeader(name);
  },

  /**
   * Remove the current response header `name`.
   *
   * @param {String} name
   * @api public
   */

  remove: function(name){
    return this.res.removeHeader(name);
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
    var header = this.header;
    var list = header[field];

    // not set
    if (!list) return this.set(field, val);

    // append
    list = list.split(/ *, */);
    if (!~list.indexOf(val)) list.push(val);
    this.set(field, list.join(', '));
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
    this.res.addTrailers(headers);
    return this;
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

  get length() {
    var len = this.get('Content-Length');
    var body = this.body;

    if (null == len) {
      if (!body) return;
      if ('string' == typeof body) return Buffer.byteLength(body);
      return body.length;
    }

    return ~~len;
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
   * Get the response type.
   *
   * Examples:
   *
   *     this.type === 'text/html; charset=utf-8'
   *
   * @return {String}
   * @api public
   */

  get type() {
    return this.get('Content-Type');
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
      this.remove('Content-Type');
      this.remove('Content-Length');
      this.remove('Transfer-Encoding');
      return;
    }

    // set the content-type only if not yet set
    var setType = !this.type;

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
    if ('back' == url) url = this.request.get('Referrer') || alt || '/';
    this.set('Location', url);
    this.status = 302;

    // html
    if (this.request.accepts('html')) {
      url = escape(url);
      this.type = 'text/html; charset=utf-8';
      this.body = 'Redirecting to <a href="' + url + '">' + url + '</a>.';
      return;
    }

    // text
    this.body = 'Redirecting to ' + url + '.';
  },
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
