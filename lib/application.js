
/**
 * Module dependencies.
 */

var debug = require('debug')('koa:app');
var Emitter = require('events').EventEmitter;
var compose = require('koa-compose');
var context = require('./context');
var Stream = require('stream');
var http = require('http');
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
  this.outputErrors = 'development' == this.env;
  this.subdomainOffset = 2;
  this.poweredBy = true;
  this.jsonSpaces = 2;
  this.middleware = [];
  this.Context = createContext(); 
  this.context(context);
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
  var server = http.createServer(this.callback());
  return server.listen.apply(server, arguments);
};

/**
 * Use the given middleware `fn`.
 *
 * @param {Function} fn
 * @return {Application} self
 * @api public
 */

app.use = function(fn){
  debug('use %s', fn.name || 'unnamed');
  this.middleware.push(fn);
  return this;
};

/**
 * Mixin `obj` to this app's context.
 *
 *   app.context({
 *     get something(){
 *       return 'hi';
 *     },
 *
 *     set something(val){
 *       this._something = val;
 *     },
 *
 *     render: function(){
 *       this.body = '<html></html>';
 *     }
 *   });
 *
 * @param {Object} obj
 * @return {Application} self
 * @api public
 */

app.context = function(obj){
  var ctx = this.Context.prototype;
  Object.getOwnPropertyNames(obj).forEach(function(name){
    var descriptor = Object.getOwnPropertyDescriptor(obj, name);
    Object.defineProperty(ctx, name, descriptor);
  });
  return this;
};

/**
 * Return a request handler callback
 * for node's native htto server.
 *
 * @return {Function}
 * @api public
 */

app.callback = function(){
  var mw = [respond].concat(this.middleware);
  var fn = compose(mw)(downstream);
  var self = this;

  return function(req, res){
    var ctx = new self.Context(self, req, res);

    function done(err) {
      if (err) ctx.error(err);
    }

    co.call(ctx, function *(){
      yield fn;
    }, done);
  }
};

/**
 * Response middleware.
 */

function respond(next){
  return function *(){
    yield next;

    var res = this.res;
    var body = this.body;
    var head = 'HEAD' == this.method;
    var ignore = 204 == this.status || 304 == this.status;

    // 404
    if (null == body && 200 == this.status) {
      this.status = 404;
    }

    // ignore body
    if (ignore) return res.end();

    // status body
    if (null == body) {
      this.set('Content-Type', 'text/plain');
      body = http.STATUS_CODES[this.status];
    }

    // Buffer body
    if (Buffer.isBuffer(body)) {
      var ct = this.responseHeader['content-type'];
      if (!ct) this.set('Content-Type', 'application/octet-stream');
      this.set('Content-Length', body.length);
      if (head) return res.end();
      return res.end(body);
    }

    // string body
    if ('string' == typeof body) {
      var ct = this.responseHeader['content-type'];
      if (!ct) this.set('Content-Type', 'text/plain; charset=utf-8');
      this.set('Content-Length', Buffer.byteLength(body));
      if (head) return res.end();
      return res.end(body);
    }

    // Stream body
    if (body instanceof Stream) {
      body.on('error', this.error.bind(this));
      if (head) return res.end();
      return body.pipe(res);
    }

    // body: json
    body = JSON.stringify(body, null, this.app.jsonSpaces);
    this.set('Content-Length', body.length);
    this.set('Content-Type', 'application/json');
    if (head) return res.end();
    res.end(body);
  }
}

/**
 * Default downstream middleware.
 *
 * @api private
 */

function *downstream() {
  this.status = 200;
  if (this.app.poweredBy) this.set('X-Powered-By', 'koa');
}

/**
 * Create a new `Context` constructor.
 *
 * @return {Function}
 * @api private
 */

function createContext() {
  return function Context(app, req, res){
    this.app = app;
    this.req = req;
    this.res = res;
  }
}
