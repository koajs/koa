
var response = require('../context').response;
var assert = require('assert');
var fs = require('fs');

describe('res.body=', function(){
  describe('when Content-Type is set', function(){
    it('should not override', function(){
      var res = response();
      res.type = 'png';
      res.body = new Buffer('something');
      assert('image/png' == res.header['content-type']);
    })

    describe('when body is an object', function(){
      it('should override as json', function(){
        var res = response();

        res.body = '<em>hey</em>';
        assert('text/html; charset=utf-8' == res.header['content-type']);

        res.body = { foo: 'bar' };
        assert('application/json; charset=utf-8' == res.header['content-type']);
      })
    })

    it('should override length', function(){
      var res = response();
      res.type = 'html';
      res.body = 'something';
      res.length.should.equal(9);
    })
  })

  describe('when a string is given', function(){
    it('should default to text', function(){
      var res = response();
      res.body = 'Tobi';
      assert('text/plain; charset=utf-8' == res.header['content-type']);
    })

    it('should set length', function(){
      var res = response();
      res.body = 'Tobi';
      assert('4' == res.header['content-length']);
    })

    describe('and contains a non-leading <', function(){
      it('should default to text', function(){
        var res = response();
        res.body = 'aklsdjf < klajsdlfjasd';
        assert('text/plain; charset=utf-8' == res.header['content-type']);
      })
    })
  })

  describe('when an html string is given', function(){
    it('should default to html', function(){
      var res = response();
      res.body = '<h1>Tobi</h1>';
      assert('text/html; charset=utf-8' == res.header['content-type']);
    })

    it('should set length', function(){
      var string = '<h1>Tobi</h1>';
      var res = response();
      res.body = string;
      assert.equal(res.length, Buffer.byteLength(string));
    })

    it('should set length when body is overridden', function(){
      var string = '<h1>Tobi</h1>';
      var res = response();
      res.body = string;
      res.body = string + string;
      assert.equal(res.length, 2 * Buffer.byteLength(string));
    })

    describe('when it contains leading whitespace', function(){
      it('should default to html', function(){
        var res = response();
        res.body = '    <h1>Tobi</h1>';
        assert('text/html; charset=utf-8' == res.header['content-type']);
      })
    })
  })

  describe('when an xml string is given', function(){
    it('should default to html', function(){
      /**
       * This test is to show that we're not going
       * to be stricter with the html sniff
       * or that we will sniff other string types.
       * You should `.type=` if this simple test fails.
       */

      var res = response();
      res.body = '<?xml version="1.0" encoding="UTF-8"?>\n<俄语>данные</俄语>';
      assert('text/html; charset=utf-8' == res.header['content-type']);
    })
  })

  describe('when a stream is given', function(){
    it('should default to an octet stream', function(){
      var res = response();
      res.body = fs.createReadStream('LICENSE');
      assert('application/octet-stream' == res.header['content-type']);
    })
  })

  describe('when a buffer is given', function(){
    it('should default to an octet stream', function(){
      var res = response();
      res.body = new Buffer('hey');
      assert('application/octet-stream' == res.header['content-type']);
    })

    it('should set length', function(){
      var res = response();
      res.body = new Buffer('Tobi');
      assert('4' == res.header['content-length']);
    })
  })

  describe('when an object is given', function(){
    it('should default to json', function(){
      var res = response();
      res.body = { foo: 'bar' };
      assert('application/json; charset=utf-8' == res.header['content-type']);
    })
  })
})
