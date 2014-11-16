
var response = require('../context').response;
var assert = require('assert');

describe('res.inspect()', function(){
  describe('with no response.res present', function(){
    it('should return null', function(){
      var res = response();
      res.body = 'hello';
      delete res.res;
      assert(null == res.inspect());
    })
  })

  it('should return a json representation', function(){
    var res = response();
    res.body = 'hello';

    res.inspect().should.eql({
      body: 'hello',
      status: 200,
      message: 'OK',
      header: {
        'content-length': '5',
        'content-type': 'text/plain; charset=utf-8'
      }
    });
  })
})
