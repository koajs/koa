
'use strict';

var response = require('../context').response;

describe('res.header', function(){
  it('should return the response header object', function(){
    var res = response();
    res.set('X-Foo', 'bar');
    res.header.should.eql({ 'x-foo': 'bar' });
  })

  it('should use res.getHeaders helper when it is available', function(){
    var res = response(null, {
      _headers: {},
      getHeaders: function(){
        return { 'x-foo': 'baz' }
      }
    });
    res.header.should.eql({ 'x-foo': 'baz' });
  })

  describe('when res._headers not present', function (){
    it('should return empty object', function (){
      var res = response();
      res.res._headers = null;
      res.header.should.eql({});
    })
  })
})
