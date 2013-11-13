
var context = require('../context');

describe('ctx.path', function(){
  it('should return the pathname', function(){
    var ctx = context();
    ctx.url = '/login?next=/dashboard';
    ctx.path.should.equal('/login');
  })
})

describe('ctx.path=', function(){
  it('should set the pathname', function(){
    var ctx = context();
    ctx.url = '/login?next=/dashboard';

    ctx.path = '/logout';
    ctx.path.should.equal('/logout');
    ctx.url.should.equal('/logout?next=/dashboard');
  })
})