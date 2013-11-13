
var request = require('../request');

describe('req.host', function(){
  it('should return host void of port', function(){
    var req = request();
    req.header.host = 'foo.com:3000';
    req.host.should.equal('foo.com');
  })

  describe('when X-Forwarded-Host is present', function(){
    describe('and proxy is not trusted', function(){
      it('should be ignored', function(){
        var req = request();
        req.header['x-forwarded-host'] = 'bar.com';
        req.header['host'] = 'foo.com';
        req.host.should.equal('foo.com')
      })
    })

    describe('and proxy is trusted', function(){
      it('should be used', function(){
        var req = request();
        req.app.proxy = true;
        req.header['x-forwarded-host'] = 'bar.com, baz.com';
        req.header['host'] = 'foo.com';
        req.host.should.equal('bar.com')
      })
    })
  })
})