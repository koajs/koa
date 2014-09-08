
var context = require('../context');

describe('ctx.inspect()', function(){
  it('should return a json representation', function(){
    var ctx = context();
    var toJSON = ctx.toJSON(ctx);

    toJSON.should.eql(ctx.inspect());
  })
})
