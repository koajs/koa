
var context = require('../context');

describe('ctx.acceptsCharsets()', function(){
  describe('with no arguments', function(){
    describe('when Accept-Charset is populated', function(){
      it('should return accepted types', function(){
        var ctx = context();
        ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
        ctx.acceptsCharsets().should.eql(['utf-8', 'utf-7', 'iso-8859-1']);
      })
    })

    describe('when Accept-Charset is not populated', function(){
      it('should return an empty array', function(){
        var ctx = context();
        ctx.acceptsCharsets().should.eql([]);
      })
    })
  })

  describe('with multiple arguments', function(){
    it('should return the best fit', function(){
      var ctx = context();
      ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
      ctx.acceptsCharsets('utf-7', 'utf-8').should.equal('utf-8');
    })
  })

  describe('with an array', function(){
    it('should return the best fit', function(){
      var ctx = context();
      ctx.req.headers['accept-charset'] = 'utf-8, iso-8859-1;q=0.2, utf-7;q=0.5';
      ctx.acceptsCharsets(['utf-7', 'utf-8']).should.equal('utf-8');
    })
  })
})