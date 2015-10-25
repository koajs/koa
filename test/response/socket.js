
'use strict';

const response = require('../helpers/context').response;
const Stream = require('stream');

describe('res.socket', () => {
  it('should return the request socket object', () => {
    const res = response();
    res.socket.should.be.instanceOf(Stream);
  });
});
