
var request = require('../context').request;

describe('req.header', function(){
  it('should return the request header object', function(){
    var req = request();
    req.header.should.equal(req.req.headers);
  })
})