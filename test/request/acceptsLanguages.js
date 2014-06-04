
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
  })

  describe('with multiple arguments', function(){
    describe('when Accept-Language is populated', function(){
      describe('if any types types match', function(){
        it('should return the best fit', function(){
          var ctx = context();
          ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
          ctx.acceptsLanguages('es', 'en').should.equal('es');
        })
      })

      describe('if no types match', function(){
        it('should return false', function(){
          var ctx = context();
          ctx.req.headers['accept-language'] = 'en;q=0.8, es, pt';
          ctx.acceptsLanguages('fr', 'au').should.be.false;
        })
      })
    })

    describe('when Accept-Language is not populated', function(){
      it('should return the first type', function(){
        var ctx = context();
        ctx.acceptsLanguages('es', 'en').should.equal('es');
      })
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
