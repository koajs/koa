
var context = require('../context');

describe('ctx.set(name, val)', function(){
  it('should set a field value', function(){
    var ctx = context();
    ctx.set('x-foo', 'bar');
    ctx.response.header['x-foo'].should.equal('bar');
  })

  it('should coerce to a string', function(){
    var ctx = context();
    ctx.set('x-foo', 5);
    ctx.response.header['x-foo'].should.equal('5');
  })

  it('should set a field value of array', function(){
    var ctx = context();
    ctx.set('x-foo', ['foo', 'bar']);
    ctx.response.header['x-foo'].should.eql([ 'foo', 'bar' ]);
  })

  describe('ctx.set("Content-Type", val)', function(){
    describe('without a charset', function () {
      it('should default the charset', function(){
        var ctx = context();
        ctx.set('Content-Type', 'text/html');
        ctx.response.header['content-type'].should.equal('text/html; charset=utf-8');
      })
    })

    describe('with an unknown extension', function(){
      it('should default to application/octet-stream',function(){
        var ctx = context();
        ctx.set('content-type', 'asdf');
        ctx.type.should.equal('application/octet-stream');
        ctx.response.header['content-type'].should.equal('application/octet-stream');
      })
    })
  })
})

describe('ctx.set(object)', function(){
  it('should set multiple fields', function(){
    var ctx = context();

    ctx.set({
      foo: '1',
      bar: '2'
    });

    ctx.response.header.foo.should.equal('1');
    ctx.response.header.bar.should.equal('2');
  })
})
