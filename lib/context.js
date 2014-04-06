
/**
 * Module dependencies.
 */

var debug = require('debug')('koa:context');
var delegate = require('delegates');
var http = require('http');

/**
 * Context prototype.
 */

var proto = module.exports = {

  /**
   * Return JSON representation.
   *
   * Here we explicitly invoke .toJSON() on each
   * object, as iteration will otherwise fail due
   * to the getters and cause utilities such as
   * clone() to fail.
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
   *    this.throw(403)
   *    this.throw('name required', 400)
   *    this.throw(400, 'name required')
   *    this.throw('something exploded')
   *    this.throw(new Error('invalid'), 400);
   *    this.throw(400, new Error('invalid'));
   *
   * @param {String|Number|Error} err, msg or status
   * @param {String|Number|Error} err, msg or status
   * @api public
   */

  throw: function(msg, status){
    if ('number' == typeof msg) {
      var tmp = msg;
      msg = status || http.STATUS_CODES[tmp];
      status = tmp;
    }

    var err = msg instanceof Error ? msg : new Error(msg);
    err.status = status || err.status || 500;
    err.expose = err.status < 500;
    throw err;
  },

  /**
   * Alias for .throw() for backwards compatibility.
   * Do not use - will be removed in the future.
   *
   * @param {String|Number} msg
   * @param {Number} status
   * @api private
   */

  error: function(msg, status){
    console.warn('ctx.error is deprecated, use ctx.throw');
    this.throw(msg, status);
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
    if (this.headerSent || !this.writable) {
      err.headerSent = true;
      this.app.emit('error', err, this);
      return;
    }

    // delegate
    this.app.emit('error', err, this);

    // unset all headers
    this.res._headers = {};

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
    this.length = Buffer.byteLength(msg);
    this.res.end(msg);
  }
};

/**
 * Response delegation.
 */

delegate(proto, 'response')
  .method('attachment')
  .method('redirect')
  .method('append')
  .method('remove')
  .method('vary')
  .method('set')
  .access('status')
  .access('body')
  .access('length')
  .access('type')
  .getter('headerSent')
  .getter('writable')
  .setter('lastModified')
  .setter('etag');

/**
 * Request delegation.
 */

delegate(proto, 'request')
  .method('acceptsLanguages')
  .method('acceptsEncodings')
  .method('acceptsCharsets')
  .method('accepts')
  .method('get')
  .method('is')
  .access('querystring')
  .access('idempotent')
  .access('socket')
  .access('search')
  .access('method')
  .access('query')
  .access('path')
  .access('host')
  .access('url')
  .getter('subdomains')
  .getter('protocol')
  .getter('hostname')
  .getter('header')
  .getter('secure')
  .getter('stale')
  .getter('fresh')
  .getter('ips')
  .getter('ip');
