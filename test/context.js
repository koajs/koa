
var Stream = require('stream');
var koa = require('..');

exports = module.exports = function(req, res){
  var socket = new Stream.Duplex();
  req = req || { headers: {}, socket: socket, __proto__: Stream.Readable.prototype };
  res = res || { _headers: {}, socket: socket, __proto__: Stream.Writable.prototype };
  res.getHeader = function(k){ return res._headers[k.toLowerCase()] };
  res.setHeader = function(k, v){ res._headers[k.toLowerCase()] = v };
  res.removeHeader = function(k, v){ delete res._headers[k.toLowerCase()] };
  return koa().createContext(req, res);
}

exports.request = function(req, res){
  return exports(req, res).request;
}

exports.response = function(req, res){
  return exports(req, res).response;
}
