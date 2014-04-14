
/**
 * Module dependencies.
 */

var ensureErrorHandler = require('error-inject');
var debug = require('debug')('koa:response');
var escape = require('escape-html');
var onfinish = require('finished');
var status = require('statuses');
var destroy = require('dethroy');
var http = require('http');
var path = require('path');
var mime = require('mime');
var basename = path.basename;
var extname = path.extname;

/**
 * Prototype.
 */

module.exports = {

  /**
   * Return the request socket.
   *
   * @return {Connection}
   * @api public
   */

  get socket() {
    // TODO: TLS
    return this.ctx.req.socket;
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

  /**
   * Return response status string.
   *
   * @return {String}
   * @api public
   */

  get statusString() {
    return http.STATUS_CODES[this.status || 404];
  },

  /**
   * Get response status code.
   *
   * @return {Number}
   * @api public
   */

  get status() {
    return this._status;
  },

  /**
   * Set response status code.
   *
   * @param {Number|String} code
   * @api public
   */

  set status(code) {
    if ('number' != typeof code) code = status(code);
    this._status = this.res.statusCode = code;
    if (this.body && status.empty[code]) this.body = null;
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
      if (!status.empty[this.status]) this.status = 204;
      this.res.removeHeader('Content-Type');
      this.res.removeHeader('Content-Length');
      this.res.removeHeader('Transfer-Encoding');
      return;
    }

    // set the status
    if (!this.status) this.status = 200;

    // set the content-type only if not yet set
    var setType = !this.header['content-type'];

    // string
    if ('string' == typeof val) {
      if (setType) this.type = /^\s*</.test(val) ? 'html' : 'text';
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
    if ('function' == typeof val.pipe) {
      onfinish(this, destroy.bind(null, val));
      ensureErrorHandler(val, this.ctx.onerror);
      if (setType) this.type = 'bin';
      return;
    }

    // json
    this.type = 'json';
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
    var len = this.header['content-length'];
    var body = this.body;

    if (null == len) {
      if (!body) return;
      if ('string' == typeof body) return Buffer.byteLength(body);
      return body.length;
    }

    return ~~len;
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
   * Vary on `field`.
   *
   * @param {String} field
   * @api public
   */

  vary: function(field){
    this.append('Vary', field);
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
    // location
    if ('back' == url) url = this.ctx.get('Referrer') || alt || '/';
    this.set('Location', url);

    // status
    if (!status.redirect[this.status]) this.status = 302;

    // html
    if (this.ctx.accepts('html')) {
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
   * when it does not contain a charset.
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

  set type(type) {
    // mime
    if (!~type.indexOf('/')) type = mime.lookup(type);

    // charset
    if (!~type.indexOf('charset')) {
      var cs = mime.charsets.lookup(type);
      if (cs) type += '; charset=' + cs.toLowerCase();
    }

    this.set('Content-Type', type);
  },

  /**
   * Set the Last-Modified date using a string or a Date.
   *
   *     this.response.lastModified = new Date();
   *     this.response.lastModified = '2013-09-13';
   *
   * @param {String|Date} type
   * @api public
   */

  set lastModified(val) {
    if ('string' == typeof val) val = new Date(val);
    this.set('Last-Modified', val.toUTCString());
  },

  /**
   * Get the Last-Modified date in Date form, if it exists.
   *
   * @return {Date}
   * @api public
   */

  get lastModified() {
    var date = this.get('last-modified');
    if (date) return new Date(date);
  },

  /**
   * Set the ETag of a response.
   * This will normalize the quotes if necessary.
   *
   *     this.response.etag = 'md5hashsum';
   *     this.response.etag = '"md5hashsum"';
   *     this.response.etag = 'W/"123456789"';
   *
   * @param {String} etag
   * @api public
   */

  set etag(val) {
    if (!/^(W\/)?"/.test(val)) val = '"' + val + '"';
    this.set('ETag', val);
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
   * Return response header.
   *
   * Examples:
   *
   *     this.get('Content-Type');
   *     // => "text/plain"
   *
   *     this.get('content-type');
   *     // => "text/plain"
   *
   * @param {String} field
   * @return {String}
   * @api public
   */

  get: function(field){
    return this.header[field.toLowerCase()];
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
   * Remove header `field`.
   *
   * @param {String} name
   * @api public
   */

  remove: function(field){
    this.res.removeHeader(field);
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
   * Checks if the request is writable.
   * Tests for the existence of the socket
   * as node sometimes does not set it.
   *
   * @return {Boolean}
   * @api private
   */

  get writable() {
    var socket = this.res.socket;
    if (!socket) return false;
    return socket.writable;
  },

  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */

  inspect: function(){
    if (!this.res) return;
    var o = this.toJSON();
    o.body = this.body;
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
      status: this.status,
      string: this.statusString,
      header: this.header
    }
  }
};
