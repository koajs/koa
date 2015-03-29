
var context = require('../context');

describe('ctx.append(name, val)', function(){
  it('should append multiple headers', function(){
    var ctx = context();
    ctx.append('x-foo', 'bar1');
    ctx.append('x-foo', 'bar2');
    ctx.response.header['x-foo'].should.eql(['bar1', 'bar2']);
  })

 it('should accept array of values', function (){
    var ctx = context();

    ctx.append('Set-Cookie', ['foo=bar', 'fizz=buzz']);
    ctx.append('Set-Cookie', 'hi=again');
    ctx.response.header['set-cookie'].should.eql(['foo=bar', 'fizz=buzz', 'hi=again']);
  })

  it('should get reset by res.set(field, val)', function (){
    var ctx = context();

    ctx.append('Link', '<http://localhost/>');
    ctx.append('Link', '<http://localhost:80/>');

    ctx.set('Link', '<http://127.0.0.1/>');

    ctx.response.header.link.should.equal('<http://127.0.0.1/>');
  })

  it('should work with res.set(field, val) first', function (){
    var ctx = context();

    ctx.set('Link', '<http://localhost/>');
    ctx.append('Link', '<http://localhost:80/>');

    ctx.response.header.link.should.eql(['<http://localhost/>', '<http://localhost:80/>']);
  })
})
