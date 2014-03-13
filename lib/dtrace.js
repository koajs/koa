/**
 * Module dependencies
 */

var dtrace;
var debug = require('debug')('koa:dtrace');

/**
 * provider, probes
 */

var provider;
var probes = {
  // id, method, url
  routeStart: ['int', 'char *', 'char *'],
  // id, statusCode
  routeEnd: ['int', 'int']
};

var ID = 0;
var MAX_INT = Math.pow(2, 32) - 1;

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
        debug('Fire');
      },
      enable: function () {
        debug('Enable');
      },
      addProbe: function () {
        debug('Add probe');
        var p = {
          fire: function () {
          }
        };
        return (p);
      },
      removeProbe: function () {
        debug('Remove probe');
      },
      disable: function () {
        debug('Disable');
      }
    };
  }

  Object.keys(probes).forEach(function (probe) {
    provider.addProbe.apply(provider, probes[probe]);
  });

  provider.nextId = function nextId() {
    if (++ID >= MAX_INT) {
      ID = 1;
    }
    return ID;
  };

  return provider;
}();

/**
 * Expose `staticProvider`.
 */

module.exports = staticProvider;
