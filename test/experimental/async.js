
/**
 * Separate file primarily because we use `require('babel/register')`.
 */

var request = require('supertest');
var koa = require('../..');

describe('.experimental=true', function () {
  it('should support async functions', function (done) {
    var app = koa();
    app.experimental = true;
    app.use(async function (next) {
      var string = await Promise.resolve('asdf');
      this.body = string;
    });

    request(app.callback())
    .get('/')
    .expect('asdf')
    .expect(200, done);
  })
})
