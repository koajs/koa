'use strict'

import Stream from 'stream'
import Koa from '../dist/application.js'

/**
 * @param {import('../lib/request.types.ts').Request=} req
 * @param {import('../lib/response.types.ts').Response=} res
 * @param {import('../lib/application.ts').default=} app
 * @returns {import('../lib/context.types.ts').Context}
 */
const ctx = (req, res, app) => {
  const socket = new Stream.Duplex()
  req = Object.assign({ headers: {}, socket }, Stream.Readable.prototype, req)
  res = Object.assign({ _headers: {}, socket }, Stream.Writable.prototype, res)
  req.socket.remoteAddress = req.socket.remoteAddress || '127.0.0.1'
  app = app || new Koa()
  res.getHeader = k => res._headers[k.toLowerCase()]
  res.setHeader = (k, v) => { res._headers[k.toLowerCase()] = v }
  res.removeHeader = (k, v) => delete res._headers[k.toLowerCase()]
  return app.createContext(req, res)
}

/**
 *
 * @param {import('../lib/request.types.ts').Request=} req
 * @param {import('../lib/response.types.ts').Response=} res
 * @param {import('../lib/application.ts').default=} app
 * @returns {import('../lib/request.types.ts').Request}
 */
export const request = (req, res, app) => ctx(req, res, app).request

ctx.request = request

/**
 *
 * @param {import('../lib/request.types.ts').Request=} req
 * @param {import('../lib/response.types.ts').Response=} res
 * @param {import('../lib/application.ts').default=} app
 * @returns {import('../lib/response.types.ts').Response}
 */
export const response = (req, res, app) => ctx(req, res, app).response

ctx.response = response

export default ctx
