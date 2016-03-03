
'use strict';

var Stream = require('stream');
var context = require('../context');

describe('ctx.origin', function(){
  it('should return the origin of url', function(){
    var socket = new Stream.Duplex();
    var req = {
      url: '/users/1?next=/dashboard',
      headers: {
        host: 'localhost'
      },
      socket: socket,
      __proto__: Stream.Readable.prototype
    };
    var ctx = context(req);
    ctx.origin.should.equal('http://localhost');
    // change it also work
    ctx.url = '/foo/users/1?next=/dashboard';
    ctx.origin.should.equal('http://localhost');
  });
});
