
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
