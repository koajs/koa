/**
 * Module dependencies
 */

var dtrace;

/**
 * provider, probes
 */

var provider;
var probes = {
  // pathname, id, method, url
  routeStart: ['char *', 'int', 'char *', 'char *'],
  // pathname, id, statusCode
  routeEnd: ['char *', 'int', 'int']
}

/**
 * Load the dtrace-provider (do this way, because it is an optional dependency only)
 */


/**
 * staticProvider
 */

var staticProvider = function () {
  try {
    dtrace = require('dtrace-provider');
    provider = dtrace.createDTraceProvider('koa');
  } catch (e) {
    provider = {
      fire: function () {
      },
      enable: function () {
      },
      addProbe: function () {
        var p = {
          fire: function () {
          }
        };
        return (p);
      },
      removeProbe: function () {
      },
      disable: function () {
      }
    };
  }

  Object.keys(probes).forEach(function (probe) {
    console.log(probe, probes[probe])
    provider.addProbe.apply(provider, probes[probe]);
  });

  return provider;
}();

/**
 * Expose `staticProvider`.
 */

module.exports = staticProvider;
