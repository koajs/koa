
'use strict';

const Stream = require('stream');
const context = require('../helpers/context');

describe('ctx.origin', () => {
  it('should return the origin of url', () => {
    const socket = new Stream.Duplex();
    const req = {
      url: '/users/1?next=/dashboard',
      headers: {
        host: 'localhost'
      },
      socket: socket,
      __proto__: Stream.Readable.prototype
    };
    const ctx = context(req);
    ctx.origin.should.equal('http://localhost');
    // change it also work
    ctx.url = '/foo/users/1?next=/dashboard';
    ctx.origin.should.equal('http://localhost');
  });
});
