/**
 * Module dependencies.
 */

var debug = require('debug')('koa:application');
var Emitter = require('events').EventEmitter;
var compose_es7 = require('composition');
var onFinished = require('on-finished');
var response = require('./response');
var compose = require('koa-compose');
var isJSON = require('koa-is-json');
var context = require('./context');
var request = require('./request');
var statuses = require('statuses');
var Cookies = require('cookies');
var accepts = require('accepts');
var assert = require('assert');
var Stream = require('stream');
var http = require('http');
var only = require('only');
var co = require('co');

/**
 * Application prototype.
 */

var app = Application.prototype;

/**
 * Expose `Application`.
 */

exports = module.exports = Application;

/**
 * Initialize a new `Application`.
 *
 * @api public
 */

function Application() {
  if (!(this instanceof Application)) return new Application;
  this.env = process.env.NODE_ENV || 'development';
  this.subdomainOffset = 2;
  this.middleware = [];
  this.context = Object.create(context);
  this.request = Object.create(request);
  this.response = Object.create(response);
}

/**
 * Inherit from `Emitter.prototype`.
 */

Object.setPrototypeOf(Application.prototype, Emitter.prototype);

/**
 * Shorthand for:
 *
 *    http.createServer(app.callback()).listen(...)
 *
 * @param {Mixed} ...
 * @return {Server}
 * @api public
 */

app.listen = function(){
  debug('listen');
  var server = http.createServer(this.callback());
  return server.listen.apply(server, arguments);
};

/**
 * Return JSON representation.
 * We only bother showing settings.
 *
 * @return {Object}
 * @api public
 */

app.inspect =
app.toJSON = function(){
  return only(this, [
    'subdomainOffset',
    'env'
  ]);
};

/**
 * Use the given middleware `fn`.
 *
 * @param {GeneratorFunction} fn
 * @return {Application} self
 * @api public
 */

app.use = function(fn){
  if (!this.experimental) {
    // es7 async functions are allowed
    assert(fn && 'GeneratorFunction' == fn.constructor.name, 'app.use() requires a generator function');
  }
  debug('use %s', fn._name || fn.name || '-');
  this.middleware.push(fn);
  return this;
};

/**
 * Return a request handler callback
 * for node's native http server.
 *
 * @return {Function}
 * @api public
 */

app.callback = function(){
  var mw = [respond].concat(this.middleware);
  var fn = this.experimental
    ? compose_es7(mw)
    : co.wrap(compose(mw));
  var self = this;

  if (!this.listeners('error').length) this.on('error', this.onerror);

  return function(req, res){
    res.statusCode = 404;
    var ctx = self.createContext(req, res);
    onFinished(res, ctx.onerror);
    fn.call(ctx).catch(ctx.onerror);
  }
};

/**
 * Initialize a new context.
 *
 * @api private
 */

app.createContext = function(req, res){
  var context = Object.create(this.context);
  var request = context.request = Object.create(this.request);
  var response = context.response = Object.create(this.response);
  context.app = request.app = response.app = this;
  context.req = request.req = response.req = req;
  context.res = request.res = response.res = res;
  request.ctx = response.ctx = context;
  request.response = response;
  response.request = request;
  context.onerror = context.onerror.bind(context);
  context.originalUrl = request.originalUrl = req.url;
  context.cookies = new Cookies(req, res, this.keys);
  context.accept = request.accept = accepts(req);
  context.state = {};
  return context;
};

/**
 * Default error handler.
 *
 * @param {Error} err
 * @api private
 */

app.onerror = function(err){
  assert(err instanceof Error, 'non-error thrown: ' + err);

  if (404 == err.status || err.expose) return;
  if ('test' == this.env) return;

  var msg = err.stack || err.toString();
  console.error();
  console.error(msg.replace(/^/gm, '  '));
  console.error();
};

/**
 * Response middleware.
 */

function *respond(next) {
  yield *next;

  // allow bypassing koa
  if (false === this.respond) return;

  var res = this.res;
  if (res.headersSent || !this.writable) return;

  var body = this.body;
  var code = this.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    this.body = null;
    return res.end();
  }

  if ('HEAD' == this.method) {
    if (isJSON(body)) this.length = Buffer.byteLength(JSON.stringify(body));
    return res.end();
  }

  // status body
  if (null == body) {
    this.type = 'text';
    body = this.message || String(code);
    this.length = Buffer.byteLength(body);
    return res.end(body);
  }

  // responses
  if (Buffer.isBuffer(body)) return res.end(body);
  if ('string' == typeof body) return res.end(body);
  if (body instanceof Stream) return body.pipe(res);

  // body: json
  body = JSON.stringify(body);
  this.length = Buffer.byteLength(body);
  res.end(body);
}
