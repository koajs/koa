
var request = require('../context').request;

describe('req.secure', function(){
  it('should return true when encrypted', function(){
    var req = request();
    req.req.socket = { encrypted: true };
    req.secure.should.be.true;
  })
})