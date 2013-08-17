
/**
 * Module dependencies.
 */

var http = require('http');
var codes = http.STATUS_CODES;

/**
 * Produce exports[STATUS] = CODE map.
 */

Object.keys(codes).forEach(function(code){
  var n = ~~code;
  var s = codes[n].toLowerCase();
  exports[s] = n;
});
