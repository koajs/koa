/**
 * Module dependencies.
 */

var debug = require('debug')('koa:application');
var onFinished = require('finished');
var Emitter = require('events').EventEmitter;
var compose = require('koa-compose');
var context = require('./context');
var request = require('./request');
var response = require('./response');
var Cookies = require('cookies');
var accepts = require('accepts');
var status = require('statuses');
var assert = require('assert');
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
  this.on('error', this.onerror);
  this.outputErrors = 'test' != this.env;
  this.subdomainOffset = 2;
  this.poweredBy = true;
  this.middleware = [];
  this.context = Object.create(context);
  this.request = Object.create(request);
  this.response = Object.create(response);
}

/**
 * Inherit from `Emitter.prototype`.
 */

Application.prototype.__proto__ = Emitter.prototype;

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
 *
 * @return {Object}
 * @api public
 */

app.toJSON = function(){
  return only(this, [
    'outputErrors',
    'subdomainOffset',
    'poweredBy',
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
  assert('GeneratorFunction' == fn.constructor.name, 'app.use() requires a generator function');
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
  var gen = compose(mw);
  var fn = co(gen);
  var self = this;

  return function(req, res){
    var ctx = self.createContext(req, res);
    onFinished(ctx, ctx.onerror);
    fn.call(ctx, ctx.onerror);
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
  return context;
};

/**
 * Default error handler.
 *
 * @param {Error} err
 * @api private
 */

app.onerror = function(err){
  if (!this.outputErrors) return;
  if (404 == err.status) return;
  console.error(err.stack);
};

/**
 * Response middleware.
 */

function *respond(next){
  if (this.app.poweredBy) this.set('X-Powered-By', 'koa');

  yield *next;

  if (false === this.respond) return;

  var res = this.res;
  if (res.headersSent || !this.writable) return;

  var body = this.body;
  var code = this.status = this.status || 404;
  var head = 'HEAD' == this.method;

  // ignore body
  if (status.empty[code]) return res.end();

  if (null == body) {
    // empty body
    if (head) return res.end();

    // status body
    this.type = 'text';
    body = status[code];
  }

  // Buffer body
  if (Buffer.isBuffer(body)) {
    if (head) return res.end();
    return res.end(body);
  }

  // string body
  if ('string' == typeof body) {
    if (head) return res.end();
    return res.end(body);
  }

  // Stream body
  if ('function' == typeof body.pipe) {
    if (!~body.listeners('error').indexOf(this.onerror)) body.on('error', this.onerror);

    if (head) {
      if (body.close) body.close();
      return res.end();
    }

    return body.pipe(res);
  }

  // body: json
  body = JSON.stringify(body);
  this.length = Buffer.byteLength(body);
  if (head) return res.end();
  res.end(body);
}