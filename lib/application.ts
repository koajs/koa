/* eslint-disable promise/prefer-await-to-then */
/* eslint-disable @typescript-eslint/member-ordering */
import {AsyncLocalStorage} from 'node:async_hooks';
import {Buffer} from 'node:buffer';
import Emitter from 'node:events';
import util from 'node:util';
import Stream from 'node:stream';
import http, {type IncomingMessage, type ServerResponse} from 'node:http';
import process from 'node:process';
import {type UnknownRecord} from 'type-fest';
import statuses from 'statuses';
import onFinished from 'on-finished';
import {HttpError} from 'http-errors';
import _debug from 'debug';
import compose, {type Middleware} from 'koa-compose';
import only from './only.js';
import koaContext, {type Context} from './context.js';
import request, {type Request} from './request.js';
import response, {type Response} from './response.js';

/**
 * Module dependencies.
 */

const debug = _debug('koa:application');

export type Options = {
  env?: string;
  keys?: string[];
  proxy?: boolean;
  subdomainOffset?: number;
  proxyIpHeader?: string;
  maxIpsCount?: number;
  compose?: typeof compose;
  asyncLocalStorage?: boolean;
};

class Application extends Emitter {
  /**
   * Make HttpError available to consumers of the library so that consumers don't
   * have a direct dependency upon `http-errors`
   */
  static HttpError = HttpError;
  /**
   * App.proxy
   *
   * when true proxy header fields will be trusted
   */
  proxy: boolean;
  /**
   * App.subdomainOffset
   *
   * offset of .subdomains to ignore, default to 2
   */
  subdomainOffset: number;
  /**
   * App.proxyIpHeader
   *
   * proxy ip header, default to X-Forwarded-For
   */
  proxyIpHeader: string;
  /**
   * App.maxIpsCount
   * max ips read from proxy ip header, default to 0 (means infinity)
   */
  maxIpsCount: number;
  /**
   * App.env
   * Defaults to NODE_ENV or "development"
   */
  env: string;
  /**
   * Exposes koa-compose
   */
  compose: typeof compose;
  /**
   * The extendable koa ctx prototype object.
   */
  context: Context;
  /**
   * The koa request object.
   */
  request: Request;
  /**
   * The incoming node request object.
   */
  req?: IncomingMessage;
  /**
   * The node response object.
   */
  res?: ServerResponse;
  /**
   * The koa response object.
   */
  response: Response;
  /**
   * @prop app.keys
   * array of signed cookie keys
   */
  keys?: string[];
  /**
   * Middleware
   * @private
   */
  private readonly middleware: Middleware[];
  /**
   * @name app.silent
   * By default outputs all errors to stderr unless app.silent is true.
   */
  silent?: boolean;
  /**
   * Async local storage
   * @private
   */
  private readonly ctxStorage?: AsyncLocalStorage<Context>;
  [util.inspect.custom]?: () => UnknownRecord;
  /**
   * Application constructor.
   *
   * create a new koa application.
   *
   * @example
   * ```ts
   * import App from '@kosmic/koa';
   * const app = new App();
   * ```
   * @param options
   */
  constructor(options?: Options) {
    super();
    options = options || {};
    this.proxy = options.proxy || false;
    this.subdomainOffset = options.subdomainOffset || 2;
    this.proxyIpHeader = options.proxyIpHeader || 'X-Forwarded-For';
    this.maxIpsCount = options.maxIpsCount || 0;
    this.env = options.env || process.env.NODE_ENV || 'development';
    this.compose = options.compose || compose;
    if (options.keys) this.keys = options.keys;
    this.middleware = [];
    this.context = Object.create(koaContext) as Context;
    this.request = Object.create(request) as Request;
    this.response = Object.create(response) as Response;

    // util.inspect.custom support for node 6+
    /* istanbul ignore else */
    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }

    if (options.asyncLocalStorage) {
      this.ctxStorage = new AsyncLocalStorage();
    }
  }

  /**
   * Shorthand for:
   *
   *    http.createServer(app.callback()).listen(...)
   *
   * @param {Mixed} ...
   * @return {import('http').Server}
   * @api public
   */
  listen(...args: Parameters<http.Server['listen']>) {
    debug('listen');
    const server = http.createServer(this.callback());
    return server.listen(...args);
  }

  /**
   * Return JSON representation.
   * We only bother showing settings.
   *
   * @return {Object}
   * @api public
   */
  toJSON() {
    return only(this, ['subdomainOffset', 'proxy', 'env']);
  }

  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */
  inspect() {
    return this.toJSON();
  }

  /**
   * Use the given middleware `fn`.
   *
   * all function are async (or Promise returning) functions.
   *
   * @example
   *
   * app.use(async (ctx, next) => {
   *  await next();
   *  ctx.body = 'Hello World';
   * })
   */
  use(fn: Middleware): this {
    if (typeof fn !== 'function') {
      throw new TypeError('middleware must be a function!');
    }

    // @ts-expect-error something legacy? not sure
    debug('use %s', fn._name || fn.name || '-');
    this.middleware.push(fn);
    return this;
  }

  /**
   * Return a request handler callback
   * for node's native http server.
   *
   * @return {Function}
   * @api public
   */
  callback() {
    const fn = this.compose(this.middleware);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    const handleRequest = (req: IncomingMessage, res: ServerResponse) => {
      const ctx = this.createContext(req, res);
      if (!this.ctxStorage) {
        return this.handleRequest(ctx, fn);
      }

      return this.ctxStorage.run(ctx, async () => {
        // eslint-disable-next-line @typescript-eslint/return-await, no-return-await
        return await this.handleRequest(ctx, fn);
      });
    };

    return handleRequest;
  }

  /**
   * Return current ctx from async local storage
   */
  // eslint-disable-next-line getter-return
  get currentContext() {
    if (this.ctxStorage) return this.ctxStorage.getStore();
  }

  /**
   * Handle request in callback.
   *
   * @api private
   */

  private async handleRequest(
    ctx: Context,
    fnMiddleware: ReturnType<typeof compose>,
  ) {
    const res = ctx.res;
    res.statusCode = 404;
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const onerror = (err: Error | null) => ctx.onerror(err);
    const handleResponse = () => respond(ctx);
    onFinished(res, onerror);
    // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
    return fnMiddleware(ctx).then(handleResponse).catch(onerror);
  }

  /**
   * Initialize a new ctx.
   *
   * @api private
   */

  createContext(req: IncomingMessage, res: ServerResponse): Context {
    const context: Context = Object.create(this.context) as Context;
    const request = (context.request = Object.create(this.request) as Request);
    const response = (context.response = Object.create(
      this.response,
    ) as Response);
    context.app = request.app = response.app = this;
    context.req = request.req = response.req = req;
    context.res = request.res = response.res = res;
    request.ctx = response.ctx = context;
    request.response = response;
    response.request = request;
    context.originalUrl = request.originalUrl = req.url;
    context.state = {};
    return context;
  }

  /**
   * Default error handler.
   *
   * @param {Error} err
   * @api private
   */

  onerror(err: HttpError) {
    // When dealing with cross-globals a normal `instanceof` check doesn't work properly.
    // See https://github.com/koajs/koa/issues/1466
    // We can probably remove it once jest fixes https://github.com/facebook/jest/issues/2549.
    const isNativeError =
      Object.prototype.toString.call(err) === '[object Error]' ||
      err instanceof Error;
    if (!isNativeError)
      throw new TypeError(util.format('non-error thrown: %j', err));

    if (err.status === 404 || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string
    console.error(`\n${msg.replaceAll(/^/gm, '  ')}\n`);
  }

  static get default() {
    return Application;
  }
}

function respond(ctx: Context) {
  // allow bypassing koa
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
  if (ctx.respond === false) return;

  if (!ctx.writable) return;

  const res = ctx.res;
  let body = ctx.body;
  const code = ctx.status;

  // ignore body
  if (statuses.empty[code]) {
    // strip headers
    ctx.body = null;
    return res.end();
  }

  if (ctx.method === 'HEAD') {
    if (!res.headersSent && !ctx.response.has('Content-Length')) {
      const {length} = ctx.response;
      if (Number.isInteger(length)) ctx.length = length;
    }

    return res.end();
  }

  // status body
  if (body === null || body === undefined) {
    if (ctx.response._explicitNullBody) {
      ctx.response.remove('Content-Type');
      ctx.response.remove('Transfer-Encoding');
      ctx.length = 0;
      return res.end();
    }

    if (ctx.req.httpVersionMajor >= 2) {
      body = String(code);
    } else {
      body = ctx.message || String(code);
    }

    if (!res.headersSent) {
      ctx.type = 'text';
      ctx.length = Buffer.byteLength(body);
    }

    return res.end(body);
  }

  // responses

  if (Buffer.isBuffer(body)) return res.end(body);
  if (typeof body === 'string') return res.end(body);
  if (body instanceof Stream) return body.pipe(res);
  if (body instanceof Blob)
    return Stream.Readable.from(body.stream()).pipe(res);
  if (body instanceof ReadableStream)
    return Stream.Readable.from(body).pipe(res);
  if (body instanceof Response)
    return Stream.Readable.from(body?.body || '').pipe(res);

  // body: json
  body = JSON.stringify(body);
  if (!res.headersSent) {
    ctx.length = Buffer.byteLength(body);
  }

  res.end(body);
}

/**
 * Export types
 */
export {type Middleware, type Next} from 'koa-compose';
export {type Context, type State} from './context.js';
export {type Request} from './request.js';
export {type Response} from './response.js';

export default Application;
