
'use strict';

var should = require('should');
var koa = require('../../');
var net = require('net');

describe('res.writable', function(){
  describe('when continuous requests in one persistent connection', function() {
    function requestTwice(server, done) {
      var port = server.address().port;
      var buf = new Buffer('GET / HTTP/1.1\r\nHost: localhost:' + port + '\r\nConnection: keep-alive\r\n\r\n');
      var client = net.connect(port);
      var datas = [];
      client
        .on('error', done)
        .on('data', function(data) {
          datas.push(data);
        })
        .on('end', function() {
          done(null, datas);
        });
      setImmediate(function() {
        client.write(buf);
      });
      setImmediate(function() {
        client.write(buf);
      });
      setTimeout(function() {
        client.end();
      }, 100);
    }

    it('should always writable and response all requests', function(done) {
      var app = koa();
      var count = 0;
      app.use(function*() {
        count++;
        this.body = 'request ' + count + ', writable: ' + this.writable;
      });

      var server = app.listen();
      requestTwice(server, function(err, datas) {
        var responses = Buffer.concat(datas).toString();
        responses.should.match(/request 1, writable: true/);
        responses.should.match(/request 2, writable: true/);
        done();
      });
    })
  })

  describe('when socket closed before response sent', function() {
    function requsetClosed(server) {
      var port = server.address().port;
      var buf = new Buffer('GET / HTTP/1.1\r\nHost: localhost:' + port + '\r\nConnection: keep-alive\r\n\r\n');
      var client = net.connect(port);
      setImmediate(function() {
        client.write(buf);
        client.end();
      });
    }

    it('should not writable', function(done) {
      var app = koa();
      app.use(function*() {
        yield sleep(1000);
        if (this.writable) return done(new Error('this.writable should not be true'));
        done();
      });
      var server = app.listen();
      requsetClosed(server);
    })
  })

  describe('when response finished', function() {
    function request(server) {
      var port = server.address().port;
      var buf = new Buffer('GET / HTTP/1.1\r\nHost: localhost:' + port + '\r\nConnection: keep-alive\r\n\r\n');
      var client = net.connect(port);
      setImmediate(function() {
        client.write(buf);
      });
      setTimeout(function() {
        client.end();
      }, 100);
    }

    it('should not writable', function(done) {
      var app = koa();
      app.use(function*() {
        this.res.end();
        if (this.writable) return done(new Error('this.writable should not be true'));
        done();
      });
      var server = app.listen();
      request(server);
    })
  })
})

function sleep(time) {
  return new Promise(function(resolve) {
    setTimeout(resolve, time);
  });
}
