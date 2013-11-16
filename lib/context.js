
/**
 * Module dependencies.
 */

var debug = require('debug')('koa:context');
var Request = require('./request');
var Response = require('./response');
var Cookies = require('cookies');
var http = require('http');
var EventEmitter = require('events').EventEmitter;

/**
 * Prototype.
 */

module.exports = {

  /**
   * Context is an event emitter.
   */

  __proto__: EventEmitter.prototype,

  /**
   * Delegate to Request#header.
   */

  get header() {
    return this.request.header;
  },

  /**
   * Delegate to Request#url.
   */

  get url() {
    return this.request.url;
  },

  /**
   * Delegate to Request#url=.
   */

  set url(val) {
    this.request.url = val;
  },

  /**
   * Delegate to Request#method.
   */

  get method() {
    return this.request.method;
  },

  /**
   * Delegate to Request#method=.
   */

  set method(val) {
    this.request.method = val;
  },

  /**
   * Delegate to Response#status.
   */


  get status() {
    return this.response.status;
  },

  /**
   * Delegate to Response#status=.
   */

  set status(val) {
    this.response.status = val;
  },

  /**
   * Delegate to Response#body.
   */

  get body() {
    return this.response.body;
  },

  /**
   * Delegate to Response#body=.
   */

  set body(val) {
    this.response.body = val;
  },

  /**
   * Delegate to Request#path.
   */

  get path() {
    return this.request.path;
  },

  /**
   * Delegate to Request#path=.
   */

  set path(val) {
    this.request.path = val;
  },

  /**
   * Delegate to Request#query.
   */

  get query() {
    return this.request.query;
  },

  /**
   * Delegate to Request#query=.
   */

  set query(val) {
    this.request.query = val;
  },

  /**
   * Delegate to Request#querystring.
   */

  get querystring() {
    return this.request.querystring;
  },

  /**
   * Delegate to Request#querystring=.
   */

  set querystring(val) {
    this.request.querystring = val;
  },

  /**
   * Delegate to Request#host.
   */

  get host() {
    return this.request.host;
  },

  /**
   * Delegate to Request#fresh.
   */

  get fresh() {
    return this.request.fresh;
  },

  /**
   * Delegate to Request#stale.
   */

  get stale() {
    return this.request.stale;
  },

  /**
   * Delegate to Request#idempotent.
   */

  get idempotent() {
    return this.request.idempotent;
  },

  /**
   * Delegate to Request#socket.
   */

  get socket() {
    return this.request.socket;
  },

  /**
   * Delegate to Request#length.
   */

  get length() {
    return this.request.length;
  },

  /**
   * Delegate to Request#length.
   */

  set length(val) {
    this.response.length = val;
  },

  /**
   * Delegate to Request#protocol.
   */

  get protocol() {
    return this.request.protocol;
  },

  /**
   * Delegate to Request#secure.
   */

  get secure() {
    return this.request.secure;
  },

  /**
   * Delegate to Request#ip.
   */

  get ip() {
    return this.request.ip;
  },

  /**
   * Delegate to Request#ips.
   */

  get ips() {
    return this.request.ips;
  },

  /**
   * Delegate to Request#subdomains.
   */

  get subdomains() {
    return this.request.subdomains;
  },

  /**
   * Delegate to Response#headerSent.
   */

  get headerSent() {
    return this.response.headerSent;
  },

  /**
   * Delegate to Response#type=.
   */

  set type(val) {
    this.response.type = val;
  },

  /**
   * Delegate to Request#type.
   */

  get type() {
    return this.request.type;
  },

  /**
   * Delegate to Request#accepts().
   */

  accepts: function() {
    return this.request.accepts.apply(this.request, arguments);
  },

  /**
   * Delegate to Request#acceptsCharsets().
   */

  acceptsCharsets: function() {
    return this.request.acceptsCharsets.apply(this.request, arguments);
  },

  /**
   * Delegate to Request#acceptsEncodings().
   */

  acceptsEncodings: function() {
    return this.request.acceptsEncodings.apply(this.request, arguments);
  },

  /**
   * Delegate to Request#acceptsLanguages().
   */

  acceptsLanguages: function() {
    return this.request.acceptsLanguages.apply(this.request, arguments);
  },

  /**
   * Delegate to Response#vary().
   */

  vary: function() {
    return this.response.vary.apply(this.response, arguments);
  },

  /**
   * Delegate to Request#is().
   */

  is: function() {
    return this.request.is.apply(this.request, arguments);
  },

  /**
   * Delegate to Response#append().
   */

  append: function() {
    return this.response.append.apply(this.response, arguments);
  },

  /**
   * Delegate to Request#get().
   */

  get: function() {
    return this.request.get.apply(this.request, arguments);
  },

  /**
   * Delegate to Response#set().
   */

  set: function() {
    return this.response.set.apply(this.response, arguments);
  },

  /**
   * Delegate to Response#redirect().
   */

  redirect: function() {
    return this.response.redirect.apply(this.response, arguments);
  },

  /**
   * Delegate to Response#attachment().
   */

  attachment: function() {
    return this.response.attachment.apply(this.response, arguments);
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
      request: this.request.toJSON(),
      response: this.response.toJSON()
    }
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
      this.emit('error', err);
      return;
    }

    // delegate
    this.emit('error', err);

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
  }
};
