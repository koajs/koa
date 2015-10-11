
const request = require('../context').request;

describe('req.header', function(){
  it('should return the request header object', function(){
    const req = request();
    req.header.should.equal(req.req.headers);
  })
})