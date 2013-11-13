
var Context = require('../lib/context');
var Request = require('../lib/request');
var koa = require('..');

function context(req, res) {
  req = req || { headers: {} };
  res = res || { _headers: {} };
  res.setHeader = function(k, v){ res._headers[k.toLowerCase()] = v };
  var ctx = new Context({}, req, res);
  return ctx;
}

function request(req, res) {
  return new Request(context(req, res));
}

module.exports = request;