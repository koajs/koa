
var Context = require('../lib/context');
var Response = require('../lib/response');
var koa = require('..');

function context(req, res) {
  req = req || { headers: {} };
  res = res || { _headers: {} };
  res.setHeader = function(k, v){ res._headers[k.toLowerCase()] = v };
  var ctx = new Context({}, req, res);
  return ctx;
}

function response(req, res) {
  return new Response(context(req, res));
}

module.exports = response;