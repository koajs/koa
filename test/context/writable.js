
var context = require('../context');

describe('ctx.writable', function(){
  it('should not crash when the socket does not exist', function(){
    var ctx = context();
    ctx.socket = null;
    ctx.writable.should.equal(false);
  })
})