
var response = require('../context').response;

describe('res.writable', function(){
  it('should return the request is writable', function(){
    var res = response();
    res.writable.should.be.ok;
  })

  describe('when res.socket not present', function (){
    it('should return the request is not writable', function (){
      var res = response();
      res.res.socket = null;
      res.writable.should.not.be.ok;
    })
  })
})
