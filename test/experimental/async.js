
'use strict';

/**
 * Separate file primarily because we use `require('babel/register')`.
 */

const request = require('supertest');
const Koa = require('../..');

describe('.experimental=true', function () {
  it('should support async functions', function (done) {
    const app = new Koa();
    app.experimental = true;
    app.use(async function (next) {
      const string = await Promise.resolve('asdf');
      this.body = string;
    });

    request(app.callback())
    .get('/')
    .expect('asdf')
    .expect(200, done);
  })
})
