
var response = require('../context').response;

describe('res.etag=', function(){
  it('should not modify an etag with quotes', function(){
    var res = response();
    res.etag = '"asdf"';
    res.header.etag.should.equal('"asdf"');
  })

  it('should not modify a weak etag', function(){
    var res = response();
    res.etag = 'W/"asdf"';
    res.header.etag.should.equal('W/"asdf"');
  })

  it('should add quotes around an etag if necessary', function(){
    var res = response();
    res.etag = 'asdf';
    res.header.etag.should.equal('"asdf"');
  })
})

describe('res.etag', function(){
  it('should return etag', function(){
    var res = response();
    res.etag = '"asdf"';
    res.etag.should.equal('"asdf"');
  })
})
