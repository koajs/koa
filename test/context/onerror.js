
var koa = require('../..');
var request = require('supertest');

describe('ctx.onerror(err)', function(){
  it('should respond', function(done){
    var app = koa();

    app.use(function *(next){
      this.body = 'something else';

      this.throw(499, 'boom');
    })

    var server = app.listen();

    request(server)
    .get('/')
    .expect(499)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('Content-Length', '4')
    .end(done);
  })

  it('should unset all headers', function(done){
    var app = koa();

    app.use(function *(next){
      this.set('Vary', 'Accept-Encoding');
      this.set('X-CSRF-Token', 'asdf');
      this.body = 'response';

      this.throw(499, 'boom');
    })

    var server = app.listen();

    request(server)
    .get('/')
    .expect(499)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('Content-Length', '4')
    .end(function(err, res){
      if (err) return done(err);

      res.headers.should.not.have.property('vary');
      res.headers.should.not.have.property('x-csrf-token');
      res.headers.should.not.have.property('x-powered-by');

      done();
    })
  })
})