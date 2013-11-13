
var context = require('../context');

describe('ctx.acceptsLanguages(langs)', function(){
  describe('with no arguments', function(){
    describe('when Accept-Language is populated', function(){
      it('should return accepted types', function(){
        var ctx = context();
        ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
        ctx.acceptsLanguages().should.eql(['es', 'pt', 'en']);
      })
    })

    describe('when Accept-Language is not populated', function(){
      it('should return an empty array', function(){
        var ctx = context();
        ctx.acceptsLanguages().should.eql([]);
      })
    })
  })

  describe('with multiple arguments', function(){
    it('should return the best fit', function(){
      var ctx = context();
      ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
      ctx.acceptsLanguages('es', 'en').should.equal('es');
    })
  })

  describe('with an array', function(){
    it('should return the best fit', function(){
      var ctx = context();
      ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
      ctx.acceptsLanguages(['es', 'en']).should.equal('es');
    })
  })
})