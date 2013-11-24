
var context = require('../lib/context');
var request = require('../lib/request');
var response = require('../lib/response');
var koa = require('..');

exports = module.exports = function(req, res){
  req = req || { headers: {} };
  res = res || { _headers: {} };
  res.setHeader = function(k, v){ res._headers[k.toLowerCase()] = v };
  res.removeHeader = function(k, v){ delete res._headers[k.toLowerCase()] };
  return koa().createContext(req, res);
}

exports.context = function(req, res){
  return exports(req, res);
}

exports.request = function(req, res){
  return exports(req, res).request;
}

exports.response = function(req, res){
  return exports(req, res).response;
}