import {
  type IncomingHttpHeaders,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';
import {type TLSSocket} from 'node:tls';
import {type ParsedUrlQuery} from 'node:querystring';
import {type Socket} from 'node:net';
import type accepts from 'accepts';
import {type UnknownRecord, type Simplify} from 'type-fest';
import type Application from './application.js';
import {type Context} from './context.types.js';
import {type Response} from './response.types.js';
import {type IP} from './request.js';

interface RequestExtras extends UnknownRecord {
  req: IncomingMessage;
  res: ServerResponse;
  originalUrl: string | undefined;
  app: Application;
  memoizedURL: URL | {};
  ctx: Context;
  response: Response;
  _accept: accepts.Accepts;
  _querycache: Record<string, ParsedUrlQuery>;
  [IP]: string;
}

interface BaseRequest {
  /**
   * Return request header.
   *
   * @return {Object},
   * @api public
   */
  header: IncomingHttpHeaders;
  /**
   * Return request header, alias as request.header
   *
   * @return {Object},
   * @api public
   */
  headers: IncomingHttpHeaders;
  /**
   * Get request URL.
   */
  url: string | undefined;
  /**
   * Get origin of URL.
   *
   */
  readonly origin: string;
  /**
   * Get full request URL.
   *
   * @return {String},
   * @api public
   */
  readonly href: string | undefined;
  /**
   * Return the request mime type void of
   * parameters such as "charset".
   *
   * @return {String},
   * @api public
   */
  readonly type: string;
  /**
   * Get request method.
   *
   * @return {String},
   * @api public
   */
  method: string | undefined;
  /**
   * Get request pathname.
   *
   * @return {String},
   * @api public
   */
  path: string | null;
  /**
   * Get parsed query string.
   *
   * @return {Object},
   * @api public
   */
  query: ParsedUrlQuery;
  /**
   * Get query string.
   *
   * @return {String},
   * @api public
   */
  querystring: string;
  /**
   * Get the search string. Same as the query string
   * except it includes the leading ?.
   *
   * @return {String},
   * @api public
   */
  search: string;
  /**
   * Parse the "Host" header field host
   * and support X-Forwarded-Host when a
   * proxy is enabled.
   *
   * @return {String}, hostname:port
   * @api public
   */
  readonly host: string;
  /**
   * Parse the "Host" header field hostname
   * and support X-Forwarded-Host when a
   * proxy is enabled.
   *
   * @return {String}, hostname
   * @api public
   */
  readonly hostname: string;
  /**
   * Get WHATWG parsed URL.
   * Lazily memoized.
   *
   * @return {URL},
   * @api public
   */
  readonly URL: URL | UnknownRecord;
  /**
   * Check if the request is fresh, aka
   * Last-Modified and/or the ETag
   * still match.
   *
   * @return {Boolean},
   * @api public
   */
  readonly fresh: boolean;
  /**
   * Check if the request is stale, aka
   * "Last-Modified" and / or the "ETag" for the
   * resource has changed.
   *
   * @return {Boolean},
   * @api public
   */
  readonly stale: boolean;
  /**
   * Check if the request is idempotent.
   *
   * @return {Boolean},
   * @api public
   */
  readonly idempotent: boolean;
  /**
   * Return the request socket.
   *
   * @return {Connection},
   * @api public
   */
  readonly socket: TLSSocket | Socket;
  /**
   * Get the charset when present or undefined.
   *
   * @return {String},
   * @api public
   */
  readonly charset: string;
  /**
   * Return parsed Content-Length when present.
   *
   * @return {Number},
   * @api public
   */
  readonly length?: number;
  /**
   * Return the protocol string "http" or "https"
   * when requested with TLS. When the proxy setting
   * is enabled the "X-Forwarded-Proto" header
   * field will be trusted. If you're running behind
   * a reverse proxy this supplies https for you (this as unknown as Application)
   * may be enabled.
   *
   * @return {String},
   * @api public
   */
  readonly protocol: string;
  /**
   * Shorthand for:
   *
   *    (this as unknown as Application).protocol == 'https'
   *
   * @return {Boolean},
   * @api public
   */
  readonly secure: boolean;
  /**
   * When `app.proxy` is `true`, parse
   * the "X-Forwarded-For" ip address list.
   *
   * For example if the value was "client, proxy1, proxy2"
   * you would receive the array `["client", "proxy1", "proxy2"]`
   * where "proxy2" is the furthest down-stream.
   *
   * @return {Array},
   * @api public
   */
  readonly ips: string[];
  /**
   * Return request's remote address
   * When `app.proxy` is `true`, parse
   * the "X-Forwarded-For" ip address list and return the first one
   *
   * @return {String},
   * @api public
   */
  ip: string;
  /**
   * Return subdomains as an array.
   *
   * Subdomains are the dot-separated parts of the host before the main domain
   * of the app. By default, the domain of the app is assumed to be the last two
   * parts of the host. (this as unknown as Application) can be changed by setting `app.subdomainOffset`.
   *
   * For example, if the domain is "tobi.ferrets.example.com":
   * If `app.subdomainOffset` is not set, (this as unknown as Application).subdomains is
   * `["ferrets", "tobi"]`.
   * If `app.subdomainOffset` is 3, (this as unknown as Application).subdomains is `["tobi"]`.
   *
   * @return {Array},
   * @api public
   */
  readonly subdomains: string[];
  /**
   * Get accept object.
   * Lazily memoized.
   *
   * @return {Object},
   * @api private
   */
  accept: accepts.Accepts;
  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `false`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single mime type string
   * such as "application/json", the extension name
   * such as "json" or an array `["json", "html", "text/plain"]`. When a list
   * or array is given the _best_ match, if any is returned.
   *
   * @example
   * ```ts
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
   *     // => false
   *
   *     // Accept: text/*;q=.5, application/json
   *     this.accepts(['html', 'json']);
   *     this.accepts('html', 'json');
   *     // => "json"
   * ```
   *
   * @param {String|Array} type(s)...
   * @return {String|Array|false}
   * @api public
   */
  accepts(...args: string[]): string | string[] | boolean;
  /**
   * Return accepted encodings or best fit based on `encodings`.
   *
   * Given `Accept-Encoding: gzip, deflate`
   * an array sorted by quality is returned:
   *
   *     ['gzip', 'deflate']
   *
   * @param {String|Array}, encoding(s)...
   * @return {String|Array},
   * @api public
   */
  acceptsEncodings(...args: string[]): ReturnType<accepts.Accepts['encodings']>;
  /**
   * Return accepted charsets or best fit based on `charsets`.
   *
   * Given `Accept-Charset: utf-8, iso-8859-1;q=0.2, utf-7;q=0.5`
   * an array sorted by quality is returned:
   *
   *     ['utf-8', 'utf-7', 'iso-8859-1']
   *
   * @param {String|Array}, charset(s)...
   * @return {String|Array},
   * @api public
   */
  acceptsCharsets(...args: string[]): ReturnType<accepts.Accepts['charset']>;
  /**
   * Return accepted languages or best fit based on `langs`.
   *
   * Given `Accept-Language: en;q=0.8, es, pt`
   * an array sorted by quality is returned:
   *
   *     ['es', 'pt', 'en']
   *
   * @param {String|Array}, lang(s)...
   * @return {Array|String},
   * @api public
   */
  acceptsLanguages(...args: string[]): ReturnType<accepts.Accepts['languages']>;
  /**
   * Check if the incoming request contains the "Content-Type"
   * header field and if it contains any of the given mime `type`s.
   * If there is no request body, `null` is returned.
   * If there is no content type, `false` is returned.
   * Otherwise, it returns the first `type` that matches.
   *
   * @example
   * ```ts
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
   * ```
   * @param {String|String[]} [type]
   * @param {String[]} [types]
   * @return {String|false|null}
   * @api public
   */
  is(type: string, ...types: string[]): string | boolean | null;
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
   *     // => ''
   *
   * @param {String} field
   * @return {String},
   * @api public
   */
  get(field: string): string;
  /**
   * Inspect implementation.
   *
   * @return {Object},
   * @api public
   */
  inspect(): UnknownRecord | undefined;
  /**
   * Return JSON representation.
   *
   * @return {Object},
   * @api public
   */
  toJSON(): UnknownRecord;
}

/** @private */
export type InternalKoaRequest = BaseRequest & Partial<RequestExtras>;

//
// A user can depend on this type to have all the required properties, however, internally, we need to check if they are defined.
//

/**
 * A Koa Request object.
 */
export interface Request extends BaseRequest, RequestExtras {}
