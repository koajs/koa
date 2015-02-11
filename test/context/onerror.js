
var request = require('supertest');
var koa = require('../..');

describe('ctx.onerror(err)', function(){
  it('should respond', function(done){
    var app = koa();

    app.use(function *(next){
      this.body = 'something else';

      this.throw(418, 'boom');
    })

    var server = app.listen();

    request(server)
    .get('/')
    .expect(418)
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

      this.throw(418, 'boom');
    })

    var server = app.listen();

    request(server)
    .get('/')
    .expect(418)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('Content-Length', '4')
    .end(function(err, res){
      if (err) return done(err);

      res.headers.should.not.have.property('vary');
      res.headers.should.not.have.property('x-csrf-token');

      done();
    })
  })

  it('should unset all headers except cors', function(done){
    var app = koa();

    app.use(function *(next){
      this.set('Vary', 'Accept-Encoding');
      this.set('X-CSRF-Token', 'asdf');
      this.set('Access-Control-Allow-Origin', 'koaisawesome.js');
      this.set('Access-Control-Expose-Headers', 'something');
      this.set('Access-Control-Max-Age', '88');
      this.set('Access-Control-Allow-Credentials', true);
      this.set('Access-Control-Allow-Methods', 'GET,POST,KOA');
      this.set('Access-Control-Allow-Headers', 'asdf');
      this.body = 'response';

      this.throw(418, 'boom');
    })

    var server = app.listen();

    request(server)
    .get('/')
    .expect(418)
    .expect('Content-Type', 'text/plain; charset=utf-8')
    .expect('Content-Length', '4')
    .end(function(err, res){
      if (err) return done(err);

      res.headers.should.not.have.property('vary');
      res.headers.should.not.have.property('x-csrf-token');
      res.headers.should.have.property('access-control-allow-origin');
      res.headers.should.have.property('access-control-expose-headers');
      res.headers.should.have.property('access-control-max-age');
      res.headers.should.have.property('access-control-allow-credentials');
      res.headers.should.have.property('access-control-allow-methods');
      res.headers.should.have.property('access-control-allow-headers');

      done();
    })
  })

  describe('when invalid err.status', function(){
    describe('not number', function(){
      it('should respond 500', function(done){
        var app = koa();

        app.use(function *(next){
          this.body = 'something else';
          var err = new Error('some error');
          err.status = 'notnumber';
          throw err;
        })

        var server = app.listen();

        request(server)
        .get('/')
        .expect(500)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect('Internal Server Error', done);
      })
    })

    describe('not http status code', function(){
      it('should respond 500', function(done){
        var app = koa();

        app.use(function *(next){
          this.body = 'something else';
          var err = new Error('some error');
          err.status = 9999;
          throw err;
        })

        var server = app.listen();

        request(server)
        .get('/')
        .expect(500)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect('Internal Server Error', done);
      })
    })
  })
})
