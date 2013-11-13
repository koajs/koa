
var response = require('../response');

describe('res.header', function(){
  it('should return the response header object', function(){
    var res = response();
    res.set('X-Foo', 'bar');
    res.header.should.eql({ 'x-foo': 'bar' });
  })
})