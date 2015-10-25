
'use strict';

const Koa = require('../..');

describe('app.toJSON()', () => {
  it('should work', () => {
    const app = new Koa();
    const obj = app.toJSON();

    obj.should.eql({
      subdomainOffset: 2,
      proxy: false,
      env: 'test'
    });
  });
});
