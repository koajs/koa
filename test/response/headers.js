
'use strict';

var response = require('../context').response;

describe('res.header', function(){
  it('should return the response header object', function(){
    var res = response();
    res.set('X-Foo', 'bar');
    res.headers.should.eql({ 'x-foo': 'bar' });
  })

  describe('when res._headers not present', function (){
    it('should return empty object', function (){
      var res = response();
      res.res._headers = null;
      res.headers.should.eql({});
    })
  })
})
