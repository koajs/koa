
var request = require('../request');

describe('req.protocol', function(){
  describe('when encrypted', function(){
    it('should return "https"', function(){
      var req = request();
      req.req.socket = { encrypted: true };
      req.protocol.should.equal('https');
    })
  })

  describe('when unencrypted', function(){
    it('should return "http"', function(){
      var req = request();
      req.req.socket = {};
      req.protocol.should.equal('http');
    })
  })

  describe('when X-Forwarded-Proto is set', function(){
    describe('and proxy is trusted', function(){
      it('should be used', function(){
        var req = request();
        req.app.proxy = true;
        req.req.socket = {};
        req.header['x-forwarded-proto'] = 'https, http';
        req.protocol.should.equal('https');
      })
    })

    describe('and proxy is not trusted', function(){
      it('should not be used', function(){
        var req = request();
        req.req.socket = {};
        req.header['x-forwarded-proto'] = 'https, http';
        req.protocol.should.equal('http');
      })
    })
  })
})