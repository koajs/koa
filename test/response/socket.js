
var Stream = require('stream');
var response = require('../context').response;

describe('res.socket', function(){
  it('should return the request socket object', function(){
    var res = response();
    res.socket.should.be.instanceOf(Stream);
  })
})
