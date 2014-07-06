
var request = require('../context').request;

describe('req.ips', function(){
  describe('when X-Forwarded-For is present', function(){
    describe('and proxy is not trusted', function(){
      it('should be ignored', function(){
        var req = request();
        req.app.proxy = false;
        req.header['x-forwarded-for'] = '127.0.0.1,127.0.0.2';
        req.ips.should.eql([]);
      })
    })

    describe('and proxy is trusted', function(){
      it('should be used', function(){
        var req = request();
        req.app.proxy = true;
        req.header['x-forwarded-for'] = '127.0.0.1,127.0.0.2';
        req.ips.should.eql(['127.0.0.1', '127.0.0.2']);
      })
    })
  })
})
