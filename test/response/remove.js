
var context = require('../context');

describe('ctx.remove(name)', function(){
  it('should remove a field', function(){
    var ctx = context();
    ctx.set('x-foo', 'bar');
    ctx.remove('x-foo');
    ctx.response.header.should.eql({});
  })
})
