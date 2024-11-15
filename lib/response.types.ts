import {
  type OutgoingHttpHeaders,
  type IncomingMessage,
  type ServerResponse,
  type OutgoingMessage,
} from 'node:http';
import {type TLSSocket} from 'node:tls';
import {type Stream} from 'node:stream';
import {type Buffer} from 'node:buffer';
import {type Socket} from 'node:net';
import {type UnknownRecord, type Simplify} from 'type-fest';
import {type Options as ContentDispositionOptions} from 'content-disposition';
import {type Context} from './context.types.js';
import type Application from './application.js';
import {type Request} from './request.types.js';

interface ResponseExtras extends UnknownRecord {
  app: Application;
  res: ServerResponse;
  req: IncomingMessage;
  request: Request;
  _explicitNullBody: boolean;
  _explicitStatus: boolean;
  _body: Stream | Buffer | string | UnknownRecord | null;
  ctx: Context;
}

export interface BaseResponse {
  /**
   * Return the request socket.
   *
   * @return {Connection}
   * @api public
   */
  readonly socket: TLSSocket | Socket | null;
  /**
   * Return response header.
   *
   * @return {Object}
   * @api public
   */
  readonly header: OutgoingHttpHeaders | undefined;
  /**
   * Return response header, alias as response.header
   *
   * @return {Object}
   * @api public
   */
  readonly headers: OutgoingHttpHeaders | undefined;
  /**
   * Get response status code.
   *
   * @return {Number}
   * @api public
   */
  status: number;
  /**
   * Get response status message
   *
   * @return {String}
   * @api public
   */
  message: string;
  /**
   * Get response body.
   *
   * @return {Mixed}
   * @api public
   */
  body:
    | string
    | Buffer
    | Stream
    | Response
    | Blob
    | null
    | any[]
    | Record<string, any>;
  /**
   * Return parsed response Content-Length when present.
   *
   * @return {Number}
   * @api public
   */
  length: number | undefined;
  /**
   * Get the Last-Modified date in Date form, if it exists.
   *
   * @return {Date}
   * @api public
   */
  lastModified?: Date | string;
  /**
   * Get the ETag of a response.
   *
   * @return {String}
   * @api public
   */
  etag: string;
  /**
   * Return the response mime type void of
   * parameters such as "charset".
   *
   * @return {String}
   * @api public
   */
  type: string;
  /**
   * Check if a header has been written to the socket.
   *
   * @return {Boolean}
   * @api public
   */
  readonly headerSent: boolean;
  /**
   * Checks if the request is writable.
   * Tests for the existence of the socket
   * as node sometimes does not set it.
   *
   * @return {Boolean}
   * @api private
   */
  readonly writable: boolean;
  /**
   * Vary on `field`.
   *
   * @param {String} field
   * @api public
   */
  vary(field: string): void;
  /**
   * Perform a 302 redirect to `url`.
   *
   * The string "back" is special-cased
   * to provide Referrer support, when Referrer
   * is not present `alt` or "/" is used.
   *
   * Examples:
   *
   *    that.redirect('back');
   *    that.redirect('back', '/index.html');
   *    that.redirect('/login');
   *    that.redirect('http://google.com');
   *
   * @param {String} url
   * @param {String} [alt]
   * @api public
   */
  redirect(url: string, alt?: string): void;
  /**
   * Set Content-Disposition header to "attachment" with optional `filename`.
   *
   * @param {String} filename
   * @api public
   */
  attachment(filename?: string, options?: ContentDispositionOptions): void;
  /**
   * Check whether the response is one of the listed types.
   * Pretty much the same as `that.request.is()`.
   *
   * @param {String|String[]} [type]
   * @param {String[]} [types]
   * @return {String|false}
   * @api public
   */
  is(type: string, ...types: string[]): string | boolean;
  /**
   * Return response header.
   *
   * Examples:
   *
   *     that.get('Content-Type');
   *     // => "text/plain"
   *
   *     that.get('content-type');
   *     // => "text/plain"
   *
   * @param {String} field
   * @api public
   */
  get(field: string): ReturnType<OutgoingMessage['getHeader']>;
  /**
   * Returns true if the header identified by name is currently set in the outgoing headers.
   * The header name matching is case-insensitive.
   *
   * Examples:
   *
   *     that.has('Content-Type');
   *     // => true
   *
   *     that.get('content-type');
   *     // => true
   *
   * @param {String} field
   * @return {boolean}
   * @api public
   */
  has(field: string): boolean;
  /**
   * Set header `field` to `val` or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    that.set('Foo', ['bar', 'baz']);
   *    that.set('Accept', 'application/json');
   *    that.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * @param {String|Object|Array} field
   * @param {String} val
   * @api public
   */
  set(
    field: string | Record<string, string | string[]> | string[],
    value?: string | string[] | number,
  ): void;
  /**
   * Append additional header `field` with value `val`.
   *
   * Examples:
   *
   * ```
   * that.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
   * that.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   * that.append('Warning', '199 Miscellaneous warning');
   * ```
   *
   * @param {String} field
   * @param {String|Array} val
   * @api public
   */
  append(field: string, value: string | string[]): void;
  /**
   * Remove header `field`.
   *
   * @param {String} name
   * @api public
   */
  remove(field: string): void;
  /**
   * Inspect implementation.
   *
   * @return {Object}
   * @api public
   */
  inspect(): UnknownRecord | undefined;
  /**
   * Return JSON representation.
   *
   * @return {Object}
   * @api public
   */
  toJSON(): UnknownRecord;
  /**
   * Flush any set headers and begin the body
   */
  flushHeaders(): void;
}

/**
 * @private
 * This type is meant to be used internally by Koa.
 */
export type InternalKoaResponse = BaseResponse & Partial<ResponseExtras>;

/**
 * The extendable type for the response object.
 */
export interface Response extends ResponseExtras, BaseResponse {}
