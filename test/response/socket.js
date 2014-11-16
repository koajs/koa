
var response = require('../context').response;
var Stream = require('stream');

describe('res.socket', function(){
  it('should return the request socket object', function(){
    var res = response();
    res.socket.should.be.instanceOf(Stream);
  })
})
