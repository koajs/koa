
var koa = require('../..');
var request = require('supertest');
var fs = require('fs')

var app = koa();

app.outputErrors = true;

app.use(function *(next){
  yield* this.sendfile(__dirname + this.path);
})

var server = app.listen();

describe('res.sendfile(filename)', function(){
  var stats = fs.statSync(__dirname + '/sendfile.js');

  it('should send a file', function(done){
    request(server)
    .get('/sendfile.js')
    .expect(200, done);
  })

  it('should set Content-Length', function(done){
    request(server)
    .get('/sendfile.js')
    .expect('Content-Length', String(stats.size), done);
  })

  it('should set Content-Type', function(done){
    request(server)
    .get('/sendfile.js')
    .expect('Content-Type', 'application/javascript', done);
  })

  it('should set Last-Modified', function(done){
    request(server)
    .get('/sendfile.js')
    .expect('Last-Modified', stats.mtime.toUTCString(), done);
  })

  it('should set ETag', function(done){
    var etag = 'W/"' + stats.size + '-' + stats.mtime.getTime() + '"';

    request(server)
    .get('/sendfile.js')
    .expect('ETag', etag, done);
  })

  describe('when the method is HEAD', function(){
    it('should not send a response body', function(){

    })
  })

  describe('when .type is already set', function(){
    it('should not set Content-Type', function(){

    })
  })

  describe('when .etag is already set', function(){
    it('should not set the ETag', function(){

    })
  })
})