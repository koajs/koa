
'use strict';

const Stream = require('stream');
const Koa = require('../..');

module.exports = (req, res) => {
  const socket = new Stream.Duplex();
  req = req || { headers: {}, socket: socket, __proto__: Stream.Readable.prototype };
  res = res || { _headers: {}, socket: socket, __proto__: Stream.Writable.prototype };
  res.getHeader = k => res._headers[k.toLowerCase()];
  res.setHeader = (k, v) => res._headers[k.toLowerCase()] = v;
  res.removeHeader = (k, v) => delete res._headers[k.toLowerCase()];
  return (new Koa()).createContext(req, res);
};

module.exports.request = (req, res) => module.exports(req, res).request;

module.exports.response = (req, res) => module.exports(req, res).response;
